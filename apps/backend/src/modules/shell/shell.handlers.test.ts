import {describe, it, expect, vi, beforeEach, beforeAll} from 'vitest';
import {WebSocket} from 'ws';
import type {IPty} from 'node-pty';
import type {Logger} from '@kit/logger/types';

// Mock the module with a factory function
vi.mock('./shell.service.js', () => {
  // Define the mock inside the factory to avoid hoisting issues
  const mockShellManager = {
    createSession: vi.fn(),
    getSession: vi.fn(),
    terminateSession: vi.fn(),
    terminateAllSessions: vi.fn(),
  };

  return {
    createShellManager: vi.fn(() => mockShellManager),
    generateSessionId: vi.fn(() => 'shell-123-abc'),
  };
});

// Import after mocking
import {createShellHandler, cleanupShellSessions} from './shell.handlers.js';
import * as shellService from './shell.service.js';

describe('shell.handlers', () => {
  let mockWs: Partial<WebSocket>;
  let mockPty: Partial<IPty>;
  let handler: ReturnType<typeof createShellHandler>;
  let mockShellManager: any;
  let mockLogger: Logger;

  beforeAll(() => {
    // Create mock logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(() => mockLogger),
    } as unknown as Logger;
    
    // Ensure the handler is created after mocks are set up
    handler = createShellHandler(mockLogger);
    // Get the mock shell manager
    mockShellManager = vi.mocked(shellService.createShellManager).mock
      .results[0]?.value;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock WebSocket
    mockWs = {
      send: vi.fn(),
      on: vi.fn(),
      readyState: WebSocket.OPEN,
      close: vi.fn(),
    };

    // Mock PTY
    mockPty = {
      onData: vi.fn(),
      onExit: vi.fn(),
      write: vi.fn(),
      resize: vi.fn(),
      kill: vi.fn(),
    };

    // Configure mock return value
    if (mockShellManager) {
      mockShellManager.createSession.mockReturnValue(mockPty);
    }
  });

  describe('connection handling', () => {
    it('should create a new shell session on connection', () => {
      handler(mockWs as WebSocket);

      expect(mockShellManager.createSession).toHaveBeenCalledWith(
        'shell-123-abc',
      );
      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({type: 'session-id', sessionId: 'shell-123-abc'}),
      );
    });

    it('should set up PTY data handler', () => {
      handler(mockWs as WebSocket);

      expect(mockPty.onData).toHaveBeenCalled();

      // Test data handler
      const dataHandler = vi.mocked(mockPty.onData!).mock.calls[0][0];
      dataHandler('Hello from shell');

      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({type: 'output', data: 'Hello from shell'}),
      );
    });

    it('should not send data if WebSocket is closed', () => {
      handler(mockWs as WebSocket);

      // Close the WebSocket
      (mockWs as any).readyState = WebSocket.CLOSED;

      const dataHandler = vi.mocked(mockPty.onData!).mock.calls[0][0];
      dataHandler('Hello from shell');

      // Should only have the initial session-id message
      expect(mockWs.send).toHaveBeenCalledTimes(1);
    });

    it('should set up PTY exit handler', () => {
      handler(mockWs as WebSocket);

      expect(mockPty.onExit).toHaveBeenCalled();

      // Test exit handler
      const exitHandler = vi.mocked(mockPty.onExit!).mock.calls[0][0];
      exitHandler({exitCode: 0, signal: 15});

      expect(mockShellManager.terminateSession).toHaveBeenCalledWith(
        'shell-123-abc',
      );
      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({type: 'exit', exitCode: 0, signal: 15}),
      );
      expect(mockWs.close).toHaveBeenCalled();
    });

    it('should handle PTY exit when WebSocket is already closed', () => {
      handler(mockWs as WebSocket);

      // Close the WebSocket
      (mockWs as any).readyState = WebSocket.CLOSED;

      const exitHandler = vi.mocked(mockPty.onExit!).mock.calls[0][0];
      exitHandler({exitCode: 0});

      expect(mockShellManager.terminateSession).toHaveBeenCalledWith(
        'shell-123-abc',
      );
      expect(mockWs.send).toHaveBeenCalledTimes(1); // Only initial session-id
      expect(mockWs.close).not.toHaveBeenCalled();
    });
  });

  describe('message handling', () => {
    it('should handle input messages', () => {
      handler(mockWs as WebSocket);

      const messageHandler = vi
        .mocked(mockWs.on!)
        .mock.calls.find((call) => call[0] === 'message')?.[1] as Function;

      messageHandler(
        Buffer.from(JSON.stringify({type: 'input', data: 'ls -la'})),
      );

      expect(mockPty.write).toHaveBeenCalledWith('ls -la');
    });

    it('should handle resize messages', () => {
      handler(mockWs as WebSocket);

      const messageHandler = vi
        .mocked(mockWs.on!)
        .mock.calls.find((call) => call[0] === 'message')?.[1] as Function;

      messageHandler(
        Buffer.from(JSON.stringify({type: 'resize', cols: 120, rows: 40})),
      );

      expect(mockPty.resize).toHaveBeenCalledWith(120, 40);
    });

    it('should ignore messages without required data', () => {
      handler(mockWs as WebSocket);

      const messageHandler = vi
        .mocked(mockWs.on!)
        .mock.calls.find((call) => call[0] === 'message')?.[1] as Function;

      // Input without data
      messageHandler(Buffer.from(JSON.stringify({type: 'input'})));
      expect(mockPty.write).not.toHaveBeenCalled();

      // Resize without cols/rows
      messageHandler(Buffer.from(JSON.stringify({type: 'resize', cols: 120})));
      expect(mockPty.resize).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON messages', () => {
      handler(mockWs as WebSocket);

      const messageHandler = vi
        .mocked(mockWs.on!)
        .mock.calls.find((call) => call[0] === 'message')?.[1] as Function;

      messageHandler(Buffer.from('invalid json'));

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error handling shell message',
        {error: expect.any(Error)},
      );
      expect(mockPty.write).not.toHaveBeenCalled();
    });

    it('should handle unknown message types', () => {
      handler(mockWs as WebSocket);

      const messageHandler = vi
        .mocked(mockWs.on!)
        .mock.calls.find((call) => call[0] === 'message')?.[1] as Function;

      messageHandler(
        Buffer.from(JSON.stringify({type: 'unknown', data: 'test'})),
      );

      expect(mockPty.write).not.toHaveBeenCalled();
      expect(mockPty.resize).not.toHaveBeenCalled();
    });
  });

  describe('disconnection handling', () => {
    it('should terminate session on WebSocket close', () => {
      handler(mockWs as WebSocket);

      const closeHandler = vi
        .mocked(mockWs.on!)
        .mock.calls.find((call) => call[0] === 'close')?.[1] as Function;

      closeHandler();

      expect(mockShellManager.terminateSession).toHaveBeenCalledWith(
        'shell-123-abc',
      );
    });

    it('should terminate session on WebSocket error', () => {
      handler(mockWs as WebSocket);

      const errorHandler = vi
        .mocked(mockWs.on!)
        .mock.calls.find((call) => call[0] === 'error')?.[1] as Function;

      const error = new Error('WebSocket error');
      errorHandler(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Shell WebSocket error',
        {error},
      );
      expect(mockShellManager.terminateSession).toHaveBeenCalledWith(
        'shell-123-abc',
      );
    });
  });

  describe('cleanupShellSessions', () => {
    it('should terminate all shell sessions', () => {
      cleanupShellSessions();

      expect(mockShellManager.terminateAllSessions).toHaveBeenCalled();
    });
  });

  describe('logging', () => {
    it('should log connection', () => {
      handler(mockWs as WebSocket);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '🖥️ Shell WebSocket connected',
      );
    });

    it('should log disconnection', () => {
      handler(mockWs as WebSocket);

      const closeHandler = vi
        .mocked(mockWs.on!)
        .mock.calls.find((call) => call[0] === 'close')?.[1] as Function;

      closeHandler();

      expect(mockLogger.info).toHaveBeenCalledWith(
        '🖥️ Shell WebSocket disconnected',
      );
    });

    it('should log process exit details', () => {
      handler(mockWs as WebSocket);

      const exitHandler = vi.mocked(mockPty.onExit!).mock.calls[0][0];
      exitHandler({exitCode: 1, signal: 9});

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Shell process exited',
        {exitCode: 1, signal: 9},
      );
    });
  });
});
