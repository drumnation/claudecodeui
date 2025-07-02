import {WebSocket} from 'ws';
import type {ConnectionHandler} from '../../infra/websocket/index.js';
import type {Logger} from '@kit/logger/types';
import {createShellManager, generateSessionId} from './shell.service.js';
import type {ShellMessage} from './shell.types.js';

const shellManager = createShellManager();

export const createShellHandler = (logger: Logger): ConnectionHandler => {
  return (ws: WebSocket) => {
    logger.info('🖥️ Shell WebSocket connected');

    // Generate unique session ID
    const sessionId = generateSessionId();

    // Create PTY instance
    const ptyProcess = shellManager.createSession(sessionId);

    // Send session ID to client
    ws.send(JSON.stringify({type: 'session-id', sessionId}));

    // Handle PTY output
    ptyProcess.onData((data: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({type: 'output', data}));
      }
    });

    // Handle PTY exit
    ptyProcess.onExit(
      ({exitCode, signal}: {exitCode: number; signal?: number}) => {
        logger.info('Shell process exited', {
          exitCode,
          signal,
        });
        shellManager.terminateSession(sessionId);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({type: 'exit', exitCode, signal}));
          ws.close();
        }
      },
    );

    // Handle WebSocket messages
    ws.on('message', (message: Buffer) => {
      try {
        const data: ShellMessage = JSON.parse(message.toString());

        if (data.type === 'input' && data.data) {
          ptyProcess.write(data.data);
        } else if (data.type === 'resize' && data.cols && data.rows) {
          ptyProcess.resize(data.cols, data.rows);
        }
      } catch (error) {
        logger.error('Error handling shell message', {error});
      }
    });

    // Handle WebSocket close
    ws.on('close', () => {
      logger.info('🖥️ Shell WebSocket disconnected');
      shellManager.terminateSession(sessionId);
    });

    // Handle WebSocket error
    ws.on('error', (error: Error) => {
      logger.error('❌ Shell WebSocket error', {error});
      shellManager.terminateSession(sessionId);
    });
  };
};

// Cleanup function for graceful shutdown
export const cleanupShellSessions = (): void => {
  shellManager.terminateAllSessions();
};
