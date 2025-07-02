import type {WebSocket} from 'ws';
import type {IncomingMessage} from 'http';
import type {ExtendedWebSocket} from './websocket.types.js';

export type ConnectionHandler = (
  ws: WebSocket,
  request: IncomingMessage,
) => void;

export const createConnectionRouter = (
  handlers: Map<string, ConnectionHandler>,
): ConnectionHandler => {
  return (ws: WebSocket, request: IncomingMessage) => {
    const url = request.url;
    console.log('🔗 Client connected to:', url);

    const handler = handlers.get(url || '');
    if (handler) {
      handler(ws, request);
    } else {
      console.log('❌ Unknown WebSocket path:', url);
      ws.close();
    }
  };
};
