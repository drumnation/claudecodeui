import type {WebSocket} from 'ws';
import type {IncomingMessage} from 'http';
import type {Server} from 'http';

export interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
  projectPath?: string;
  shellPath?: string;
}

export interface WebSocketConfig {
  server: Server;
  verifyClient?: (info: {
    origin: string;
    req: IncomingMessage;
    secure: boolean;
  }) => boolean;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  error?: string;
  sessionId?: string;
}

export type ConnectionHandler = (
  ws: ExtendedWebSocket,
  req: IncomingMessage,
) => void;
