import {WebSocketServer, WebSocket} from 'ws';
import type {IncomingMessage} from 'http';
import type {WebSocketConfig, ExtendedWebSocket} from './websocket.types.js';

export const createWebSocketServer = (
  config: WebSocketConfig,
): WebSocketServer => {
  return new WebSocketServer({
    server: config.server,
    verifyClient:
      config.verifyClient ||
      ((info: {req: IncomingMessage}) => {
        const pathname = new URL(
          info.req.url || '',
          `http://${info.req.headers.host}`,
        ).pathname;
        return pathname === '/ws' || pathname === '/shell';
      }),
  });
};

export const createConnectedClientsSet = (): Set<ExtendedWebSocket> =>
  new Set();

export const broadcastMessage = (
  clients: Set<ExtendedWebSocket>,
  message: any,
): void => {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN = 1
      client.send(data);
    }
  });
};
