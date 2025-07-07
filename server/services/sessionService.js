/**
 * Session service that handles session-related business logic
 * Uses core utilities and adapters for clean separation of concerns
 */

const path = require('path');
const os = require('os');
const crypto = require('crypto');
const fs = require('../adapters/fsAdapter');
const logger = require('../adapters/logger').create('SessionService');
const {
  parseJSONL,
  toJSONL,
  extractSessionMetadata,
  generateSessionSummary,
  sortSessions,
  filterSessions,
  paginateSessions,
  transformSessionForAPI,
  calculateSessionStats,
  mergeSessionUpdates
} = require('../core/sessionUtils');
const { encodeProjectPath } = require('../core/projectUtils');

class SessionService {
  constructor() {
    this.claudeDir = path.join(os.homedir(), '.claude');
  }

  /**
   * Get sessions for a project
   * @param {string} projectPath - The project path
   * @param {number} offset - Pagination offset
   * @param {number} limit - Pagination limit
   * @returns {Promise<Object>} Sessions with metadata
   */
  async getProjectSessions(projectPath, offset = 0, limit = 50) {
    try {
      logger.time('getProjectSessions');
      
      const sessions = await this._loadAllSessions(projectPath);
      const sorted = sortSessions(sessions, 'lastActivity');
      const paginated = paginateSessions(sorted, offset, limit);
      
      logger.timeEnd('getProjectSessions');
      return paginated;
    } catch (error) {
      logger.logError(error, 'Failed to get project sessions');
      return {
        sessions: [],
        meta: { total: 0, offset: 0, limit, hasMore: false }
      };
    }
  }

  /**
   * Get a single session
   * @param {string} projectPath - The project path
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object|null>} Session data or null
   */
  async getSession(projectPath, sessionId) {
    try {
      const sessions = await this._loadAllSessions(projectPath);
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      logger.error('Failed to get session', { projectPath, sessionId, error: error.message });
      return null;
    }
  }

  /**
   * Get session messages
   * @param {string} projectPath - The project path
   * @param {string} sessionId - The session ID
   * @returns {Promise<Array>} Array of messages
   */
  async getSessionMessages(projectPath, sessionId) {
    try {
      const conversationFile = this._getConversationPath(projectPath, sessionId);
      
      if (await fs.exists(conversationFile)) {
        return await fs.readJSONL(conversationFile);
      }
      
      return [];
    } catch (error) {
      logger.error('Failed to get session messages', { projectPath, sessionId, error: error.message });
      return [];
    }
  }

  /**
   * Create a new session
   * @param {string} projectPath - The project path
   * @param {Object} options - Session options
   * @returns {Promise<Object>} Created session
   */
  async createSession(projectPath, options = {}) {
    try {
      logger.info('Creating session', { projectPath, options });
      
      const sessionId = options.id || this._generateSessionId();
      const now = new Date().toISOString();
      
      const session = {
        id: sessionId,
        created: now,
        lastActivity: now,
        summary: options.summary || '',
        messageCount: 0,
        cwd: options.cwd || projectPath,
        ...options
      };
      
      // Create session directory
      const sessionDir = this._getSessionDir(projectPath, sessionId);
      await fs.ensureDir(sessionDir);
      
      // Create empty conversation file
      const conversationFile = path.join(sessionDir, 'conversation.jsonl');
      await fs.writeFile(conversationFile, '');
      
      // Add to sessions list
      await this._addSessionToList(projectPath, session);
      
      logger.info('Session created', { projectPath, sessionId });
      return session;
    } catch (error) {
      logger.logError(error, 'Failed to create session');
      throw error;
    }
  }

  /**
   * Update session summary
   * @param {string} projectPath - The project path
   * @param {string} sessionId - The session ID
   * @param {string} summary - New summary
   * @returns {Promise<boolean>} Success status
   */
  async updateSessionSummary(projectPath, sessionId, summary) {
    try {
      logger.info('Updating session summary', { projectPath, sessionId });
      
      const sessions = await this._loadAllSessions(projectPath);
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        logger.warn('Session not found', { projectPath, sessionId });
        return false;
      }
      
      sessions[sessionIndex] = mergeSessionUpdates(sessions[sessionIndex], { summary });
      
      await this._saveSessionsList(projectPath, sessions);
      
      logger.info('Session summary updated', { projectPath, sessionId });
      return true;
    } catch (error) {
      logger.logError(error, 'Failed to update session summary');
      return false;
    }
  }

  /**
   * Delete a session
   * @param {string} projectPath - The project path
   * @param {string} sessionId - The session ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteSession(projectPath, sessionId) {
    try {
      logger.info('Deleting session', { projectPath, sessionId });
      
      // Remove from sessions list
      const sessions = await this._loadAllSessions(projectPath);
      const filtered = sessions.filter(s => s.id !== sessionId);
      
      if (filtered.length === sessions.length) {
        logger.warn('Session not found', { projectPath, sessionId });
        return false;
      }
      
      await this._saveSessionsList(projectPath, filtered);
      
      // Delete session directory
      const sessionDir = this._getSessionDir(projectPath, sessionId);
      if (await fs.exists(sessionDir)) {
        await fs.remove(sessionDir);
      }
      
      logger.info('Session deleted', { projectPath, sessionId });
      return true;
    } catch (error) {
      logger.logError(error, 'Failed to delete session');
      return false;
    }
  }

  /**
   * Add a message to a session
   * @param {string} projectPath - The project path
   * @param {string} sessionId - The session ID
   * @param {Object} message - Message to add
   * @returns {Promise<void>}
   */
  async addMessage(projectPath, sessionId, message) {
    try {
      const conversationFile = this._getConversationPath(projectPath, sessionId);
      
      // Add timestamp if not present
      if (!message.timestamp) {
        message.timestamp = new Date().toISOString();
      }
      
      // Append to conversation file
      await fs.appendJSONL(conversationFile, message);
      
      // Update session metadata
      await this._updateSessionActivity(projectPath, sessionId);
    } catch (error) {
      logger.error('Failed to add message', { projectPath, sessionId, error: error.message });
      throw error;
    }
  }

  /**
   * Generate a session summary using AI
   * @param {string} projectPath - The project path
   * @param {string} sessionId - The session ID
   * @returns {Promise<string>} Generated summary
   */
  async generateSessionSummary(projectPath, sessionId) {
    try {
      const messages = await this.getSessionMessages(projectPath, sessionId);
      
      if (messages.length === 0) {
        return 'Empty session';
      }
      
      // Use built-in summary generation as fallback
      // In production, this would call Claude API
      return generateSessionSummary(messages);
    } catch (error) {
      logger.error('Failed to generate summary', { projectPath, sessionId, error: error.message });
      return 'Failed to generate summary';
    }
  }

  /**
   * Search sessions
   * @param {string} projectPath - The project path
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching sessions
   */
  async searchSessions(projectPath, searchTerm, options = {}) {
    try {
      const sessions = await this._loadAllSessions(projectPath);
      
      const filtered = filterSessions(sessions, {
        ...options,
        searchTerm
      });
      
      return sortSessions(filtered, options.sortBy || 'lastActivity');
    } catch (error) {
      logger.error('Failed to search sessions', { projectPath, error: error.message });
      return [];
    }
  }

  /**
   * Get session statistics
   * @param {string} projectPath - The project path
   * @returns {Promise<Object>} Session statistics
   */
  async getSessionStats(projectPath) {
    try {
      const sessions = await this._loadAllSessions(projectPath);
      return calculateSessionStats(sessions);
    } catch (error) {
      logger.error('Failed to get session stats', { projectPath, error: error.message });
      return calculateSessionStats([]);
    }
  }

  // Private methods

  _generateSessionId() {
    // Generate a unique session ID
    return crypto.randomBytes(12).toString('hex');
  }

  _getProjectDir(projectPath) {
    return path.join(this.claudeDir, 'projects', encodeProjectPath(projectPath));
  }

  _getSessionDir(projectPath, sessionId) {
    return path.join(this._getProjectDir(projectPath), 'sessions', sessionId);
  }

  _getConversationPath(projectPath, sessionId) {
    return path.join(this._getSessionDir(projectPath, sessionId), 'conversation.jsonl');
  }

  async _loadAllSessions(projectPath) {
    try {
      const sessionsFile = path.join(this._getProjectDir(projectPath), 'sessions.jsonl');
      
      if (await fs.exists(sessionsFile)) {
        const sessions = await fs.readJSONL(sessionsFile);
        
        // Load message counts for each session
        for (const session of sessions) {
          try {
            const messages = await this.getSessionMessages(projectPath, session.id);
            session.messageCount = messages.length;
            
            // Extract metadata if not present
            if (messages.length > 0 && !session.lastActivity) {
              const metadata = extractSessionMetadata(messages);
              session.lastActivity = metadata.lastMessageTime;
              session.toolsUsed = metadata.toolsUsed;
            }
          } catch (error) {
            logger.debug('Failed to load session messages', { sessionId: session.id });
          }
        }
        
        return sessions;
      }
      
      return [];
    } catch (error) {
      logger.error('Failed to load sessions', { projectPath, error: error.message });
      return [];
    }
  }

  async _saveSessionsList(projectPath, sessions) {
    const sessionsFile = path.join(this._getProjectDir(projectPath), 'sessions.jsonl');
    await fs.ensureDir(this._getProjectDir(projectPath));
    await fs.writeJSONL(sessionsFile, sessions);
  }

  async _addSessionToList(projectPath, session) {
    const sessions = await this._loadAllSessions(projectPath);
    sessions.unshift(session); // Add to beginning
    await this._saveSessionsList(projectPath, sessions);
  }

  async _updateSessionActivity(projectPath, sessionId) {
    try {
      const sessions = await this._loadAllSessions(projectPath);
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        const messages = await this.getSessionMessages(projectPath, sessionId);
        const metadata = extractSessionMetadata(messages);
        
        sessions[sessionIndex] = mergeSessionUpdates(sessions[sessionIndex], {
          lastActivity: new Date().toISOString(),
          messageCount: metadata.messageCount,
          toolsUsed: metadata.toolsUsed
        });
        
        await this._saveSessionsList(projectPath, sessions);
      }
    } catch (error) {
      logger.debug('Failed to update session activity', { error: error.message });
    }
  }
}

// Export singleton instance
module.exports = new SessionService();