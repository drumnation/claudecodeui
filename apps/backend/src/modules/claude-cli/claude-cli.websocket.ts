import type {WebSocket} from 'ws';
import type {
  ExtendedWebSocket,
  ConnectionHandler,
} from '../../infra/websocket/index.js';
import {spawnClaude, handleAbortSession} from './claude-cli.handlers.js';

export const createChatHandler = (
  connectedClients: Set<ExtendedWebSocket>,
): ConnectionHandler => {
  return (ws: WebSocket) => {
    console.log('💬 Chat WebSocket connected');

    // Add to connected clients for project updates
    connectedClients.add(ws as ExtendedWebSocket);

    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'claude-command') {
          console.log('💬 User message:', data.command || '[Continue/Resume]');
          console.log('📁 Project:', data.options?.projectPath || 'Unknown');
          console.log(
            '🔄 Session:',
            data.options?.sessionId ? 'Resume' : 'New',
          );
          await spawnClaude(data.command, data.options, ws);
        } else if (data.type === 'abort-session') {
          console.log('🛑 Aborting session:', data.sessionId);
          handleAbortSession(data.sessionId);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(
          JSON.stringify({type: 'error', message: 'Failed to process message'}),
        );
      }
    });

    ws.on('close', () => {
      console.log('💬 Chat WebSocket disconnected');
      connectedClients.delete(ws as ExtendedWebSocket);
    });

    ws.on('error', (error: Error) => {
      console.error('❌ Chat WebSocket error:', error);
      connectedClients.delete(ws as ExtendedWebSocket);
    });
  };
};
