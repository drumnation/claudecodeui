import { WebSocket } from 'ws';
import { createLogger } from '@kit/logger/node';
import { ShellService } from './shell.service';
import { ShellMessage, ShellWebSocketMessage } from './shell.types';

const logger = createLogger({ scope: 'shell-handlers' });

// Map to track active shell services
const shellServices = new Map<WebSocket, ShellService>();

export function handleShellWebSocketConnection(ws: WebSocket): void {
  logger.info('[Shell] New shell WebSocket connection');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString()) as ShellMessage;
      logger.debug('[Shell] Received message', { type: data.type });

      switch (data.type) {
        case 'init':
          await handleShellInit(ws, data);
          break;

        case 'input':
          handleShellInput(ws, data);
          break;

        case 'resize':
          // Terminal resize not supported without PTY
          logger.debug('[Shell] Terminal resize requested but not supported without PTY');
          break;

        default:
          logger.warn('[Shell] Unknown message type', { type: (data as any).type });
          sendMessage(ws, {
            type: 'error',
            message: `Unknown message type: ${(data as any).type}`
          });
      }
    } catch (error) {
      logger.error('[Shell] Failed to process message', { error });
      sendMessage(ws, {
        type: 'error',
        message: 'Failed to process message'
      });
    }
  });

  ws.on('close', () => {
    logger.info('[Shell] Client disconnected');
    
    // Clean up shell service
    const service = shellServices.get(ws);
    if (service) {
      service.kill();
      shellServices.delete(ws);
    }
  });

  ws.on('error', (error) => {
    logger.error('[Shell] WebSocket error', { error });
  });
}

async function handleShellInit(ws: WebSocket, data: any): Promise<void> {
  const { projectPath, sessionId, hasSession } = data;

  logger.info('[Shell] Initializing shell', {
    projectPath,
    sessionId,
    hasSession
  });

  // Clean up any existing service
  const existingService = shellServices.get(ws);
  if (existingService) {
    existingService.kill();
    shellServices.delete(ws);
  }

  try {
    // Create new shell service
    const service = new ShellService({
      projectPath,
      sessionId,
      hasSession
    });

    // Set up event handlers
    service.on('output', (output: string) => {
      sendMessage(ws, {
        type: 'output',
        data: output
      });
    });

    service.on('error', (error: string) => {
      sendMessage(ws, {
        type: 'output',
        data: `\x1b[31m${error}\x1b[0m`
      });
    });

    service.on('url-open', (url: string) => {
      sendMessage(ws, {
        type: 'url_open',
        url
      });
    });

    service.on('exit', ({ code, signal }) => {
      sendMessage(ws, {
        type: 'output',
        data: `\r\n\x1b[33mClaude exited with code ${code}${signal ? ` (${signal})` : ''}\x1b[0m\r\n`
      });
      shellServices.delete(ws);
    });

    service.on('process-error', (error: Error) => {
      sendMessage(ws, {
        type: 'error',
        message: `Failed to start Claude: ${error.message}`
      });
      shellServices.delete(ws);
    });

    // Store service
    shellServices.set(ws, service);

    // Start the service
    await service.start();

  } catch (error) {
    logger.error('[Shell] Failed to start shell service', { error });
    sendMessage(ws, {
      type: 'error',
      message: error instanceof Error ? error.message : 'Failed to start shell'
    });
  }
}

function handleShellInput(ws: WebSocket, data: any): void {
  const service = shellServices.get(ws);
  if (!service) {
    logger.warn('[Shell] No active shell service for input');
    sendMessage(ws, {
      type: 'error',
      message: 'Shell is not running. Please reconnect to start a new session.'
    });
    return;
  }

  service.write(data.data);
}

function sendMessage(ws: WebSocket, message: ShellWebSocketMessage): void {
  try {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  } catch (error) {
    logger.error('[Shell] Failed to send message', { error });
  }
}