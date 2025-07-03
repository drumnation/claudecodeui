import type {WebSocket} from 'ws';
import type {
  ExtendedWebSocket,
  ConnectionHandler,
} from '../../infra/websocket/index.js';
import type {Logger} from '@kit/logger/types';
import {spawnClaude, handleAbortSession} from './claude-cli.handlers.js';
import {getSessionMessages} from '../projects/index.js';

// Rate limiting for session loading requests
const sessionLoadingMap = new Map<string, { timestamp: number; attempts: number }>();
const SESSION_RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_SESSION_REQUESTS_PER_WINDOW = 1;
const currentlyLoadingSessions = new Set<string>();

// Helper function to parse session IDs (handles legacy "projectName:originalSessionId" format)
const parseUniqueSessionId = (sessionId: string): string => {
  // Since we no longer prefix session IDs with project names, just return the session ID as-is
  // But handle legacy format in case there are any old session IDs in the system
  if (sessionId && sessionId.includes(':')) {
    const parts = sessionId.split(':');
    if (parts.length >= 2) {
      return parts.slice(1).join(':'); // Extract original session ID for backward compatibility
    }
  }
  return sessionId; // Return as-is (this is now the normal case)
};

export const createChatHandler = (
  connectedClients: Set<ExtendedWebSocket>,
  logger: Logger,
): ConnectionHandler => {
  return (ws: WebSocket) => {
    logger.info('💬 Chat WebSocket connected');

    // Add to connected clients for project updates
    connectedClients.add(ws as ExtendedWebSocket);

    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'claude-command') {
          // Parse unique session ID (format: "projectName:originalSessionId")
          const originalSessionId = data.options?.sessionId;
          const sessionId = parseUniqueSessionId(originalSessionId);
          
          if (originalSessionId !== sessionId) {
            logger.debug('Parsed unique session ID for claude-command', {
              originalSessionId,
              parsedSessionId: sessionId
            });
          }
          
          const sessionLogger = logger.child({
            sessionId: sessionId,
            projectPath: data.options?.projectPath,
          });
          sessionLogger.info('💬 User message', {
            command: data.command || '[Continue/Resume]',
            sessionType: sessionId ? 'Resume' : 'New',
          });
          
          // Update options with parsed session ID
          const updatedOptions = {
            ...data.options,
            sessionId: sessionId
          };
          
          await spawnClaude(data.command, updatedOptions, ws, sessionLogger);
        } else if (data.type === 'user_message') {
          // Parse unique session ID (format: "projectName:originalSessionId")
          const originalSessionId = data.sessionId;
          const sessionId = parseUniqueSessionId(originalSessionId);
          
          if (originalSessionId !== sessionId) {
            logger.debug('Parsed unique session ID for user_message', {
              originalSessionId,
              parsedSessionId: sessionId
            });
          }
          
          const sessionLogger = logger.child({
            sessionId: sessionId,
            projectName: data.projectName,
          });
          sessionLogger.info('💬 User message via WebSocket', {
            message: data.message || '[Continue/Resume]',
            sessionType: sessionId ? 'Resume' : 'New',
          });
          
          // Convert user_message to claude-command format
          const command = data.message;
          const options = {
            sessionId: sessionId,
            projectPath: data.projectName.replace(/-/g, '/'), // Convert back to path format
          };
          
          await spawnClaude(command, options, ws, sessionLogger);
        } else if (data.type === 'abort-session') {
          // Parse unique session ID (format: "projectName:originalSessionId")
          const originalSessionId = data.sessionId;
          const sessionId = parseUniqueSessionId(originalSessionId);
          
          if (originalSessionId !== sessionId) {
            logger.debug('Parsed unique session ID for abort-session', {
              originalSessionId,
              parsedSessionId: sessionId
            });
          }
          
          logger.info('🛑 Aborting session', {sessionId: sessionId});
          handleAbortSession(sessionId);
        } else if (data.type === 'load_session') {
          // Parse unique session ID (format: "projectName:originalSessionId")
          let projectName = data.projectName;
          const originalSessionId = data.sessionId;
          let sessionId = parseUniqueSessionId(originalSessionId);
          
          if (originalSessionId && originalSessionId.includes(':')) {
            const parts = originalSessionId.split(':');
            if (parts.length >= 2) {
              projectName = parts[0]; // Extract project name from unique session ID
              
              logger.debug('Parsed unique session ID for load_session', {
                originalSessionId,
                parsedProjectName: projectName,
                parsedSessionId: sessionId,
                providedProjectName: data.projectName
              });
            }
          }
          
          const sessionKey = `${projectName}_${sessionId}`;
          const now = Date.now();
          
          // Validate required parameters
          if (!projectName || !sessionId) {
            logger.warn('⚠️ Invalid session load request: missing parameters', {
              projectName: !!projectName,
              sessionId: !!sessionId,
              originalSessionId: data.sessionId,
              originalProjectName: data.projectName
            });
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Missing required parameters for session loading',
              sessionId: data.sessionId,
              projectName: data.projectName
            }));
            return;
          }
          
          // Check if session is already being loaded
          if (currentlyLoadingSessions.has(sessionKey)) {
            logger.debug('📜 Session already being loaded, ignoring duplicate request', {
              sessionKey,
              projectName: data.projectName,
              sessionId: data.sessionId
            });
            return;
          }
          
          // Rate limiting check
          const rateLimitData = sessionLoadingMap.get(sessionKey);
          if (rateLimitData) {
            const timeSinceLastRequest = now - rateLimitData.timestamp;
            
            if (timeSinceLastRequest < SESSION_RATE_LIMIT_WINDOW) {
              if (rateLimitData.attempts >= MAX_SESSION_REQUESTS_PER_WINDOW) {
                logger.warn('🚫 Session load rate limit exceeded', {
                  sessionKey,
                  attempts: rateLimitData.attempts,
                  timeSinceLastRequest,
                  projectName: data.projectName,
                  sessionId: data.sessionId
                });
                return; // Silently ignore rate-limited requests
              }
              rateLimitData.attempts++;
            } else {
              // Reset counter if outside window
              rateLimitData.timestamp = now;
              rateLimitData.attempts = 1;
            }
          } else {
            sessionLoadingMap.set(sessionKey, { timestamp: now, attempts: 1 });
          }

          logger.info('📜 Loading session history', {
            projectName: data.projectName,
            sessionId: data.sessionId,
            sessionKey
          });
          
          // Mark session as currently loading
          currentlyLoadingSessions.add(sessionKey);
          const loadStartTime = Date.now();
          
          try {
            const homePath = process.env['HOME'] || '';
            const messages = await getSessionMessages(
              homePath,
              projectName,
              sessionId,
              logger
            );
            
            const loadDuration = Date.now() - loadStartTime;
            
            logger.info('📜 Session history loaded successfully', {
              projectName: data.projectName,
              sessionId: data.sessionId,
              sessionKey,
              messageCount: messages.length,
              loadDuration
            });
            
            ws.send(JSON.stringify({
              type: 'session_history',
              sessionId: data.sessionId,
              projectName: data.projectName,
              messages
            }));
          } catch (error) {
            const loadDuration = Date.now() - loadStartTime;
            
            logger.error('❌ Failed to load session history', {
              projectName: data.projectName,
              sessionId: data.sessionId,
              sessionKey,
              loadDuration,
              error
            });
            
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to load session history',
              sessionId: data.sessionId,
              projectName: data.projectName
            }));
          } finally {
            // Always clear loading state
            currentlyLoadingSessions.delete(sessionKey);
            
            // Clean up old rate limit entries
            if (sessionLoadingMap.size > 1000) {
              const cutoffTime = now - (SESSION_RATE_LIMIT_WINDOW * 2);
              for (const [key, data] of sessionLoadingMap.entries()) {
                if (data.timestamp < cutoffTime) {
                  sessionLoadingMap.delete(key);
                }
              }
            }
          }
        }
      } catch (error) {
        logger.error('Error handling WebSocket message', {error});
        ws.send(
          JSON.stringify({type: 'error', message: 'Failed to process message'}),
        );
      }
    });

    ws.on('close', () => {
      logger.info('💬 Chat WebSocket disconnected');
      connectedClients.delete(ws as ExtendedWebSocket);
    });

    ws.on('error', (error: Error) => {
      logger.error('❌ Chat WebSocket error', {error});
      connectedClients.delete(ws as ExtendedWebSocket);
    });
  };
};
