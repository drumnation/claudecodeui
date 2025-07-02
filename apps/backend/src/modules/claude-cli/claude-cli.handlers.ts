import type {WebSocket} from 'ws';
import type {SpawnClaudeOptions, WebSocketMessage} from './claude-cli.types.js';
import type {Logger} from '@kit/logger/types';
import {
  createClaudeProcess,
  handleProcessOutput,
  generateSessionSummary,
  abortClaudeSession,
} from './claude-cli.service.js';
import {sessionManager} from './claude-cli.utils.js';

// Main spawn handler that integrates with WebSocket
export const spawnClaude = async (
  command: string | undefined,
  options: SpawnClaudeOptions = {},
  ws: WebSocket,
  logger: Logger,
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const {sessionId} = options;

    // Create WebSocket message sender
    const sendMessage = (message: WebSocketMessage): void => {
      ws.send(JSON.stringify(message));
    };

    // Create dependencies object
    const deps = {
      sendMessage,
      apiPort: parseInt(process.env['PORT'] ?? '3000'),
      logger,
    };

    // State management
    const state = {
      capturedSessionId: sessionId,
      sessionCreatedSent: false,
    };

    const buffer = {value: ''};

    // Handle process output
    const onData = (data: Buffer, type: 'stdout' | 'stderr'): void => {
      handleProcessOutput(data, type, buffer, state, options, deps);
    };

    // Handle process close
    const onClose = (code: number | null): void => {
      const finalSessionId =
        state.capturedSessionId ?? sessionId ?? Date.now().toString();
      
      logger.info('Claude CLI process exited', {code, sessionId: finalSessionId});

      sessionManager.deleteProcess(finalSessionId);
      sessionManager.deleteMessageCount(finalSessionId);
      sessionManager.deleteManualEditFlag(finalSessionId);

      sendMessage({
        type: 'claude-complete',
        exitCode: code,
        isNewSession: !sessionId && !!command,
      });

      // Generate session summary for new sessions
      if (!sessionId && state.capturedSessionId && code === 0) {
        void generateSessionSummary(state.capturedSessionId, deps);
      }

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Claude CLI exited with code ${code}`));
      }
    };

    // Handle process error
    const onError = (error: Error): void => {
      const finalSessionId =
        state.capturedSessionId ?? sessionId ?? Date.now().toString();
        
      logger.error('Claude CLI process error', {error, sessionId: finalSessionId});

      sessionManager.deleteProcess(finalSessionId);

      sendMessage({
        type: 'claude-error',
        error: error.message,
      });

      reject(error);
    };

    // Store process reference
    let processKey =
      state.capturedSessionId ?? sessionId ?? Date.now().toString();

    // Wrap onData to handle session ID updates
    const wrappedOnData = (data: Buffer, type: 'stdout' | 'stderr') => {
      onData(data, type);

      // Check if we captured a new session ID
      if (state.capturedSessionId && processKey !== state.capturedSessionId) {
        sessionManager.deleteProcess(processKey);
        sessionManager.setProcess(state.capturedSessionId, claudeProcess);
        processKey = state.capturedSessionId;
      }
    };

    // Create the process with wrapped handler
    const claudeProcess = createClaudeProcess(
      command,
      options,
      wrappedOnData,
      onClose,
      onError,
    );
    sessionManager.setProcess(processKey, claudeProcess);
  });
};

// WebSocket message handlers
export const handleAbortSession = (sessionId: string): boolean => {
  return abortClaudeSession(sessionId);
};

export const handleMarkManuallyEdited = (sessionId: string): void => {
  sessionManager.markAsManuallyEdited(sessionId);
};

export const handleClearManualEdit = (sessionId: string): void => {
  sessionManager.clearManualEditFlag(sessionId);
};

// Utility handler for generating session summary on demand
export const handleGenerateSummary = async (
  sessionId: string,
  ws: WebSocket,
  logger: Logger,
  forceUpdate = false,
): Promise<void> => {
  const sendMessage = (message: WebSocketMessage): void => {
    ws.send(JSON.stringify(message));
  };

  const deps = {
    sendMessage,
    apiPort: parseInt(process.env['PORT'] ?? '3000'),
    logger,
  };

  await generateSessionSummary(sessionId, deps, forceUpdate);
};
