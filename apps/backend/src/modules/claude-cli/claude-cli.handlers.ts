import { WebSocket } from 'ws';
import { createLogger } from '@kit/logger/node';
import { ClaudeWebSocketHandler } from './claude-cli.websocket';

const logger = createLogger({ scope: 'claude-cli-handlers' });

// Map to track WebSocket handlers
const wsHandlers = new Map<WebSocket, ClaudeWebSocketHandler>();

export function handleClaudeWebSocketConnection(ws: WebSocket): void {
  logger.info('New Claude CLI WebSocket connection');
  
  // Create handler for this connection
  const handler = new ClaudeWebSocketHandler(ws);
  wsHandlers.set(ws, handler);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      logger.debug('Received WebSocket message', { type: data.type });

      switch (data.type) {
        case 'claude-command':
          await handler.handleClaudeCommand(data);
          break;

        case 'abort-session':
          handler.handleAbortSession(data);
          break;

        default:
          logger.warn('Unknown message type', { type: data.type });
          ws.send(JSON.stringify({
            type: 'error',
            error: `Unknown message type: ${data.type}`
          }));
      }
    } catch (error) {
      logger.error('Failed to process WebSocket message', { error });
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to process message'
      }));
    }
  });

  ws.on('close', () => {
    logger.info('Claude CLI WebSocket disconnected');
    
    // Clean up handler
    const handler = wsHandlers.get(ws);
    if (handler) {
      handler.cleanup();
      wsHandlers.delete(ws);
    }
  });

  ws.on('error', (error) => {
    logger.error('Claude CLI WebSocket error', { error });
  });
}