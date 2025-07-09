import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSocket } from 'ws';
import { handleClaudeWebSocketConnection } from './claude-cli.handlers';
import { ClaudeWebSocketHandler } from './claude-cli.websocket';

// Mock dependencies
vi.mock('./claude-cli.websocket');
vi.mock('@kit/logger/node', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    isLevelEnabled: vi.fn().mockReturnValue(true)
  }))
}));

describe('Claude CLI Handlers', () => {
  let mockWs: any;
  let mockHandler: any;

  beforeEach(() => {
    // Create mock WebSocket
    mockWs = {
      on: vi.fn(),
      send: vi.fn()
    };

    // Create mock handler
    mockHandler = {
      handleClaudeCommand: vi.fn(),
      handleAbortSession: vi.fn(),
      cleanup: vi.fn()
    };

    // Mock ClaudeWebSocketHandler constructor
    (ClaudeWebSocketHandler as any).mockImplementation(() => mockHandler);

    vi.clearAllMocks();
  });

  describe('handleClaudeWebSocketConnection', () => {
    it('should create handler and set up event listeners', () => {
      handleClaudeWebSocketConnection(mockWs);

      expect(ClaudeWebSocketHandler).toHaveBeenCalledWith(mockWs);
      expect(mockWs.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockWs.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockWs.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    describe('message handling', () => {
      let messageHandler: (message: any) => void;

      beforeEach(() => {
        handleClaudeWebSocketConnection(mockWs);
        messageHandler = mockWs.on.mock.calls.find(
          (call: any) => call[0] === 'message'
        )?.[1];
      });

      it('should handle claude-command messages', async () => {
        const message = JSON.stringify({
          type: 'claude-command',
          command: 'Hello Claude',
          options: { sessionId: 'test-123' }
        });

        await messageHandler(Buffer.from(message));

        expect(mockHandler.handleClaudeCommand).toHaveBeenCalledWith({
          type: 'claude-command',
          command: 'Hello Claude',
          options: { sessionId: 'test-123' }
        });
      });

      it('should handle abort-session messages', async () => {
        const message = JSON.stringify({
          type: 'abort-session',
          sessionId: 'test-123'
        });

        await messageHandler(Buffer.from(message));

        expect(mockHandler.handleAbortSession).toHaveBeenCalledWith({
          type: 'abort-session',
          sessionId: 'test-123'
        });
      });

      it('should send error for unknown message types', async () => {
        const message = JSON.stringify({
          type: 'unknown-type',
          data: 'test'
        });

        await messageHandler(Buffer.from(message));

        expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
          type: 'error',
          error: 'Unknown message type: unknown-type'
        }));
      });

      it('should handle JSON parse errors', async () => {
        const invalidMessage = 'invalid json';

        await messageHandler(Buffer.from(invalidMessage));

        expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
          type: 'error',
          error: 'Failed to process message'
        }));
      });
    });

    describe('connection lifecycle', () => {
      it('should cleanup handler on close', () => {
        handleClaudeWebSocketConnection(mockWs);
        
        const closeHandler = mockWs.on.mock.calls.find(
          (call: any) => call[0] === 'close'
        )?.[1];

        closeHandler();

        expect(mockHandler.cleanup).toHaveBeenCalled();
      });

      it('should handle WebSocket errors', () => {
        handleClaudeWebSocketConnection(mockWs);
        
        const errorHandler = mockWs.on.mock.calls.find(
          (call: any) => call[0] === 'error'
        )?.[1];

        const testError = new Error('WebSocket error');
        
        // Should not throw
        expect(() => errorHandler(testError)).not.toThrow();
      });
    });
  });
});