import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { ClaudeWebSocketHandler } from './claude-cli.websocket';
import { ClaudeCliService } from './claude-cli.service';

// Mock dependencies
vi.mock('./claude-cli.service');
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

// Mock reliable websocket sender
vi.mock('../../lib/reliableWebSocket', () => ({
  createReliableWebSocketSender: vi.fn(() => ({
    sendReliableMessage: vi.fn(),
    handleConnectionState: vi.fn(),
  }))
}));

// Mock heartbeat manager
vi.mock('../../lib/heartbeatManager', () => ({
  createHeartbeatManager: vi.fn(() => ({
    on: vi.fn(),
    stopHeartbeat: vi.fn(),
    startHeartbeat: vi.fn(),
  }))
}));

// Mock sessions service
vi.mock('../sessions/sessions.service', () => ({
  sessionsService: {
    updateSessionTitle: vi.fn(),
  }
}));

// Mock planner service
vi.mock('../planner/planner.controller.js', () => ({
  getPlannerServiceInstance: vi.fn(() => ({
    processRequest: vi.fn(),
  }))
}));

// Mock fs promises
vi.mock('fs', () => ({
  promises: {
    writeFile: vi.fn(),
  }
}));

// Mock status sync
vi.mock('../../api/status-sync', () => ({
  updateSessionStatus: vi.fn(),
}));

describe('ClaudeWebSocketHandler', () => {
  let mockWs: any;
  let handler: ClaudeWebSocketHandler;
  let mockService: any;
  let mockReliableSender: any;

  beforeEach(async () => {
    // Create mock WebSocket
    mockWs = {
      send: vi.fn(),
      on: vi.fn(),
      removeAllListeners: vi.fn()
    };

    // Create mock service
    mockService = {
      start: vi.fn(),
      kill: vi.fn(),
      on: vi.fn(),
      removeAllListeners: vi.fn()
    };

    // Create mock reliable sender
    mockReliableSender = {
      sendReliableMessage: vi.fn(),
      handleConnectionState: vi.fn(),
      clearAllMessages: vi.fn(),
    };

    // Mock ClaudeCliService constructor
    (ClaudeCliService as any).mockImplementation(() => mockService);

    // Mock createReliableWebSocketSender to return our mock
    const { createReliableWebSocketSender } = await import('../../lib/reliableWebSocket');
    (createReliableWebSocketSender as any).mockReturnValue(mockReliableSender);

    // Create handler
    handler = new ClaudeWebSocketHandler(mockWs);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleClaudeCommand', () => {
    it('should start Claude CLI service with correct options', async () => {
      const command = {
        type: 'claude-command' as const,
        command: 'Hello Claude',
        options: {
          cwd: '/test/project',
          sessionId: 'test-session-123',
          resume: false,
          toolsSettings: {
            allowedTools: ['Read', 'Write'],
            skipPermissions: false
          }
        }
      };

      await handler.handleClaudeCommand(command);

      expect(ClaudeCliService).toHaveBeenCalledWith('test-session-123');
      expect(mockService.start).toHaveBeenCalledWith({
        command: 'Hello Claude',
        cwd: '/test/project',
        projectPath: undefined,
        sessionId: 'test-session-123',
        resume: false,
        toolsSettings: command.options.toolsSettings
      });
    });

    it('should generate session ID if not provided', async () => {
      const command = {
        type: 'claude-command' as const,
        command: 'Test'
      };

      await handler.handleClaudeCommand(command);

      const sessionIdArg = mockService.start.mock.calls[0][0].sessionId;
      expect(sessionIdArg).toMatch(/^ui-session-\d+$/);
    });

    it('should send initial status message', async () => {
      await handler.handleClaudeCommand({
        type: 'claude-command',
        command: 'Test'
      });

      expect(mockReliableSender.sendReliableMessage).toHaveBeenCalledWith(mockWs, {
        type: 'claude-status',
        status: {
          text: 'Connecting to Claude...',
          tokens: 0,
          can_interrupt: true
        }
      }, { priority: 'high' });
    });

    it('should kill existing service for same session', async () => {
      const existingService = {
        kill: vi.fn()
      };

      // Simulate existing service
      await handler.handleClaudeCommand({
        type: 'claude-command',
        command: 'First',
        options: { sessionId: 'session-123' }
      });

      // Store reference to first service's kill method
      const firstKill = mockService.kill;

      // Create new mock for second service
      const secondService = {
        start: vi.fn(),
        kill: vi.fn(),
        on: vi.fn()
      };
      (ClaudeCliService as any).mockImplementation(() => secondService);

      // Start second command with same session
      await handler.handleClaudeCommand({
        type: 'claude-command',
        command: 'Second',
        options: { sessionId: 'session-123' }
      });

      expect(firstKill).toHaveBeenCalled();
    });

    it('should handle service start failure', async () => {
      mockService.start.mockRejectedValue(new Error('Failed to start'));

      await handler.handleClaudeCommand({
        type: 'claude-command',
        command: 'Test'
      });

      expect(mockReliableSender.sendReliableMessage).toHaveBeenCalledWith(mockWs, {
        type: 'error',
        error: 'Failed to start Claude CLI'
      }, { priority: 'high' });
    });
  });

  describe('handleAbortSession', () => {
    it('should kill service and send confirmation', async () => {
      // Start a service first
      await handler.handleClaudeCommand({
        type: 'claude-command',
        command: 'Test',
        options: { sessionId: 'session-123' }
      });

      // Clear previous calls
      mockReliableSender.sendReliableMessage.mockClear();

      // Abort the session
      handler.handleAbortSession({
        type: 'abort-session',
        sessionId: 'session-123'
      });

      expect(mockService.kill).toHaveBeenCalled();
      expect(mockReliableSender.sendReliableMessage).toHaveBeenCalledWith(mockWs, {
        type: 'session-aborted',
        sessionId: 'session-123'
      }, { priority: 'high' });
      expect(mockReliableSender.sendReliableMessage).toHaveBeenCalledWith(mockWs, {
        type: 'stream-end'
      });
    });
  });

  describe('service event handlers', () => {
    beforeEach(async () => {
      await handler.handleClaudeCommand({
        type: 'claude-command',
        command: 'Test',
        options: { sessionId: 'session-123' }
      });
      mockReliableSender.sendReliableMessage.mockClear();
    });

    it('should forward status events', () => {
      const statusHandler = mockService.on.mock.calls.find(
        call => call[0] === 'status'
      )?.[1];

      statusHandler({
        type: 'status',
        data: { message: 'Working...', tokens: 100 }
      });

      expect(mockReliableSender.sendReliableMessage).toHaveBeenCalledWith(mockWs, {
        type: 'claude-status',
        data: { message: 'Working...', tokens: 100 },
        connectionHealth: expect.any(String)
      }, { priority: 'high' });
    });

    it('should forward claude-response events', () => {
      const responseHandler = mockService.on.mock.calls.find(
        call => call[0] === 'claude-response'
      )?.[1];

      const response = {
        type: 'message',
        message: { role: 'assistant', content: 'Hello!' }
      };

      responseHandler({ type: 'claude-response', data: response });

      expect(mockReliableSender.sendReliableMessage).toHaveBeenCalledWith(mockWs, {
        type: 'claude-response',
        data: response
      });
    });

    it('should track user messages', () => {
      const responseHandler = mockService.on.mock.calls.find(
        call => call[0] === 'claude-response'
      )?.[1];

      // Simulate multiple user messages
      for (let i = 0; i < 3; i++) {
        responseHandler({
          type: 'claude-response',
          data: { message: { role: 'user', content: `Message ${i}` } }
        });
      }

      // Message count should trigger summary update at interval 3
      // (Would need to mock setTimeout to test the actual summary generation)
    });

    it('should handle session-created events', () => {
      const sessionCreatedHandler = mockService.on.mock.calls.find(
        call => call[0] === 'session-created'
      )?.[1];

      sessionCreatedHandler({
        type: 'session-created',
        sessionId: 'new-session-456'
      });

      expect(mockReliableSender.sendReliableMessage).toHaveBeenCalledWith(mockWs, {
        type: 'session-created',
        sessionId: 'new-session-456'
      });
    });

    it('should handle exit events and cleanup', () => {
      const exitHandler = mockService.on.mock.calls.find(
        call => call[0] === 'exit'
      )?.[1];

      exitHandler({
        type: 'exit',
        data: { exitCode: 0, sessionId: 'session-123' }
      });

      expect(mockReliableSender.sendReliableMessage).toHaveBeenCalledWith(mockWs, {
        type: 'claude-complete',
        exitCode: 0,
        isNewSession: expect.any(Boolean)
      });
    });

    it('should handle error events', () => {
      const errorHandler = mockService.on.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      errorHandler({
        type: 'error',
        data: 'Something went wrong'
      });

      expect(mockReliableSender.sendReliableMessage).toHaveBeenCalledWith(mockWs, {
        type: 'claude-error',
        error: 'Something went wrong'
      }, { priority: 'high' });
    });

    it('should handle stream-end events', () => {
      const streamEndHandler = mockService.on.mock.calls.find(
        call => call[0] === 'stream-end'
      )?.[1];

      streamEndHandler({ type: 'stream-end' });

      expect(mockReliableSender.sendReliableMessage).toHaveBeenCalledWith(mockWs, {
        type: 'stream-end'
      });
    });
  });

  describe('cleanup', () => {
    it('should kill service on cleanup', async () => {
      await handler.handleClaudeCommand({
        type: 'claude-command',
        command: 'Test',
        options: { sessionId: 'session-123' }
      });

      handler.cleanup();

      expect(mockService.kill).toHaveBeenCalled();
    });
  });
});