import type {WebSocket} from 'ws';
import type {
  ExtendedWebSocket,
  ConnectionHandler,
} from '../../infra/websocket/index.js';
import type {Logger} from '@kit/logger/types';
import {spawnClaude, handleAbortSession} from './claude-cli.handlers.js';

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
          const sessionLogger = logger.child({
            sessionId: data.options?.sessionId,
            projectPath: data.options?.projectPath,
          });
          sessionLogger.info('💬 User message', {
            command: data.command || '[Continue/Resume]',
            sessionType: data.options?.sessionId ? 'Resume' : 'New',
          });
          await spawnClaude(data.command, data.options, ws, sessionLogger);
        } else if (data.type === 'abort-session') {
          logger.info('🛑 Aborting session', {sessionId: data.sessionId});
          handleAbortSession(data.sessionId);
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
