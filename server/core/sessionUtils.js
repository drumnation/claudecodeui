/**
 * Pure utility functions for session operations
 * These functions have no side effects and are easily testable
 */

/**
 * Parse a JSONL line and return the parsed object or null
 * @param {string} line - A single line from a JSONL file
 * @returns {Object|null} Parsed object or null if invalid
 */
function parseJSONLLine(line) {
  if (!line || !line.trim()) return null;
  
  try {
    return JSON.parse(line);
  } catch (error) {
    console.error('Failed to parse JSONL line:', line);
    return null;
  }
}

/**
 * Parse multiple JSONL lines
 * @param {string} content - JSONL content with multiple lines
 * @returns {Array} Array of parsed objects
 */
function parseJSONL(content) {
  if (!content) return [];
  
  return content
    .split('\n')
    .map(parseJSONLLine)
    .filter(Boolean);
}

/**
 * Convert objects to JSONL format
 * @param {Array} objects - Array of objects to convert
 * @returns {string} JSONL formatted string
 */
function toJSONL(objects) {
  return objects
    .map(obj => JSON.stringify(obj))
    .join('\n');
}

/**
 * Extract session metadata from messages
 * @param {Array} messages - Array of message objects
 * @returns {Object} Session metadata
 */
function extractSessionMetadata(messages) {
  if (!messages || messages.length === 0) {
    return {
      messageCount: 0,
      firstMessageTime: null,
      lastMessageTime: null,
      hasAssistantMessages: false,
      hasUserMessages: false,
      toolsUsed: []
    };
  }
  
  const toolsUsed = new Set();
  let hasAssistantMessages = false;
  let hasUserMessages = false;
  
  messages.forEach(msg => {
    if (msg.role === 'assistant') hasAssistantMessages = true;
    if (msg.role === 'user') hasUserMessages = true;
    
    // Extract tools used from assistant messages
    if (msg.tool_calls) {
      msg.tool_calls.forEach(call => {
        if (call.type === 'function' && call.function && call.function.name) {
          toolsUsed.add(call.function.name);
        }
      });
    }
  });
  
  const timestamps = messages
    .map(msg => msg.timestamp)
    .filter(Boolean)
    .map(ts => new Date(ts).getTime());
  
  return {
    messageCount: messages.length,
    firstMessageTime: timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : null,
    lastMessageTime: timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null,
    hasAssistantMessages,
    hasUserMessages,
    toolsUsed: Array.from(toolsUsed)
  };
}

/**
 * Generate a session summary from messages
 * @param {Array} messages - Array of message objects
 * @param {number} maxLength - Maximum length of the summary
 * @returns {string} Generated summary
 */
function generateSessionSummary(messages, maxLength = 100) {
  if (!messages || messages.length === 0) {
    return 'Empty session';
  }
  
  // Find the first user message
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  if (!firstUserMessage || !firstUserMessage.content) {
    return 'Session started';
  }
  
  let summary = firstUserMessage.content;
  
  // Clean up the summary
  summary = summary
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Truncate if needed
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }
  
  return summary;
}

/**
 * Sort sessions by various criteria
 * @param {Array} sessions - Array of session objects
 * @param {string} sortBy - Sort criteria (lastActivity, messageCount, created)
 * @returns {Array} Sorted array of sessions
 */
function sortSessions(sessions, sortBy = 'lastActivity') {
  return [...sessions].sort((a, b) => {
    switch (sortBy) {
      case 'lastActivity':
        const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return bTime - aTime;
      
      case 'messageCount':
        return (b.messageCount || 0) - (a.messageCount || 0);
      
      case 'created':
        const aCreated = a.created ? new Date(a.created).getTime() : 0;
        const bCreated = b.created ? new Date(b.created).getTime() : 0;
        return bCreated - aCreated;
      
      default:
        return 0;
    }
  });
}

/**
 * Filter sessions based on criteria
 * @param {Array} sessions - Array of session objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered array of sessions
 */
function filterSessions(sessions, filters = {}) {
  return sessions.filter(session => {
    if (filters.hasMessages !== undefined) {
      const hasMessages = (session.messageCount || 0) > 0;
      if (hasMessages !== filters.hasMessages) {
        return false;
      }
    }
    
    if (filters.hasSummary !== undefined) {
      const hasSummary = Boolean(session.summary && session.summary.trim());
      if (hasSummary !== filters.hasSummary) {
        return false;
      }
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const summaryMatch = (session.summary || '').toLowerCase().includes(searchLower);
      const idMatch = (session.id || '').toLowerCase().includes(searchLower);
      return summaryMatch || idMatch;
    }
    
    if (filters.dateFrom) {
      const sessionDate = new Date(session.lastActivity || session.created);
      if (sessionDate < new Date(filters.dateFrom)) {
        return false;
      }
    }
    
    if (filters.dateTo) {
      const sessionDate = new Date(session.lastActivity || session.created);
      if (sessionDate > new Date(filters.dateTo)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Paginate sessions
 * @param {Array} sessions - Array of session objects
 * @param {number} offset - Starting index
 * @param {number} limit - Number of items to return
 * @returns {Object} Paginated result with sessions and metadata
 */
function paginateSessions(sessions, offset = 0, limit = 50) {
  const total = sessions.length;
  const paginatedSessions = sessions.slice(offset, offset + limit);
  
  return {
    sessions: paginatedSessions,
    meta: {
      total,
      offset,
      limit,
      hasMore: offset + limit < total
    }
  };
}

/**
 * Transform session data for API response
 * @param {Object} session - Raw session data
 * @returns {Object} Transformed session data
 */
function transformSessionForAPI(session) {
  return {
    id: session.id,
    summary: session.summary || '',
    messageCount: session.messageCount || 0,
    created: session.created,
    lastActivity: session.lastActivity,
    cwd: session.cwd,
    toolsUsed: session.toolsUsed || []
  };
}

/**
 * Calculate session statistics
 * @param {Array} sessions - Array of session objects
 * @returns {Object} Statistics object
 */
function calculateSessionStats(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalMessages: 0,
      averageMessagesPerSession: 0,
      sessionsWithSummary: 0,
      summaryPercentage: 0
    };
  }
  
  const totalMessages = sessions.reduce((sum, session) => sum + (session.messageCount || 0), 0);
  const sessionsWithSummary = sessions.filter(session => session.summary && session.summary.trim()).length;
  
  return {
    totalSessions: sessions.length,
    totalMessages,
    averageMessagesPerSession: (totalMessages / sessions.length).toFixed(2),
    sessionsWithSummary,
    summaryPercentage: ((sessionsWithSummary / sessions.length) * 100).toFixed(1)
  };
}

/**
 * Merge session updates with existing session data
 * @param {Object} existingSession - Current session data
 * @param {Object} updates - Updates to apply
 * @returns {Object} Merged session data
 */
function mergeSessionUpdates(existingSession, updates) {
  return {
    ...existingSession,
    ...updates,
    // Preserve id and created timestamp
    id: existingSession.id,
    created: existingSession.created,
    // Update lastActivity if not explicitly provided
    lastActivity: updates.lastActivity || new Date().toISOString()
  };
}

module.exports = {
  parseJSONLLine,
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
};