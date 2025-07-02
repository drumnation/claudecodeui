import type {WebSocket} from 'ws';
import type {IncomingMessage} from 'http';
import type {ExtendedWebSocket} from './websocket.types.js';
import type {Logger} from '@kit/logger/types';

export type ConnectionHandler = (
  ws: WebSocket,
  request: IncomingMessage,
) => void;

export const createConnectionRouter = (
  handlers: Map<string, ConnectionHandler>,
  logger: Logger,
): ConnectionHandler => {
  return (ws: WebSocket, request: IncomingMessage) => {
    const url = request.url;
    
    // Create a session ID for this WebSocket connection
    const sessionId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sessionLogger = logger.child({ sessionId, path: url });
    
    sessionLogger.info('Client connected to WebSocket', { url });

    const handler = handlers.get(url || '');
    if (handler) {
      // Attach the session logger to the WebSocket for use in handlers
      (ws as any).logger = sessionLogger;
      handler(ws, request);
    } else {
      sessionLogger.warn('Unknown WebSocket path', { url });
      ws.close();
    }
  };
};
