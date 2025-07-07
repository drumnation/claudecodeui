import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';

// Mock child_process before importing the module
vi.mock('child_process', () => ({
  spawn: vi.fn()
}));

// Now import after mocking
const { spawn } = await import('child_process');
const { spawnClaude, abortClaudeSession } = await import('../claude-cli.js');

// Create a mock child process that extends EventEmitter
class MockChildProcess extends EventEmitter {
  constructor() {
    super();
    this.stdout = new EventEmitter();
    this.stderr = new EventEmitter();
    this.stdin = {
      write: vi.fn(),
      end: vi.fn()
    };
    this.kill = vi.fn();
    this.pid = 12345;
  }
}

describe('Claude CLI Integration', () => {
  let mockChildProcess;
  let mockWebSocket;

  beforeEach(() => {
    // Create fresh mocks for each test
    mockChildProcess = new MockChildProcess();
    mockWebSocket = global.testUtils.createMockWebSocket();
    
    // Mock spawn to return our mock child process
    vi.mocked(spawn).mockReturnValue(mockChildProcess);
  });

  describe('Authentication and Environment', () => {
    it('should remove ANTHROPIC_API_KEY from environment when spawning Claude', async () => {
      const command = 'test message';
      const options = { cwd: '/test/path' };

      // Set API key in environment to test removal
      process.env.ANTHROPIC_API_KEY = 'test-api-key';

      // Start the spawn process
      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      // Check that spawn was called with proper environment
      expect(spawn).toHaveBeenCalledWith(
        expect.any(String), // claude command path
        expect.any(Array),  // arguments
        expect.objectContaining({
          env: expect.not.objectContaining({
            ANTHROPIC_API_KEY: 'test-api-key'
          })
        })
      );

      // Simulate successful completion
      mockChildProcess.emit('close', 0);
      await spawnPromise;
    });

    it('should use correct Claude CLI path', async () => {
      const command = 'test message';
      const options = {};

      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      // Check that the correct Claude path is used
      expect(spawn).toHaveBeenCalledWith(
        'claude', // Should resolve to claude command
        expect.any(Array),
        expect.any(Object)
      );

      mockChildProcess.emit('close', 0);
      await spawnPromise;
    });

    it('should include correct command line arguments', async () => {
      const command = 'test message';
      const options = {
        sessionId: 'test-session-123',
        resume: false,
        toolsSettings: {
          skipPermissions: true,
          allowedTools: ['Read', 'Write'],
          disallowedTools: ['Bash']
        }
      };

      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      const [, args] = spawn.mock.calls[0];
      
      // Check that arguments are correctly constructed
      expect(args).toContain('--print');
      expect(args).toContain(command);
      expect(args).toContain('--output-format');
      expect(args).toContain('stream-json');
      expect(args).toContain('--verbose');
      expect(args).toContain('--model');
      expect(args).toContain('sonnet');
      expect(args).toContain('--dangerously-skip-permissions');

      mockChildProcess.emit('close', 0);
      await spawnPromise;
    });
  });

  describe('WebSocket Communication', () => {
    it('should send session-created event for new sessions', async () => {
      const command = 'test message';
      const options = {}; // No sessionId = new session

      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      // Simulate Claude CLI sending session initialization
      const initResponse = {
        type: 'system',
        subtype: 'init',
        session_id: 'new-session-456',
        apiKeySource: 'none'
      };

      mockChildProcess.stdout.emit('data', JSON.stringify(initResponse) + '\\n');

      // Should send session-created event
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'session-created',
          sessionId: 'new-session-456'
        })
      );

      mockChildProcess.emit('close', 0);
      await spawnPromise;
    });

    it('should forward Claude responses to WebSocket', async () => {
      const command = 'test message';
      const options = {};

      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      // Simulate Claude response
      const claudeResponse = global.testUtils.createMockClaudeResponse();
      mockChildProcess.stdout.emit('data', JSON.stringify(claudeResponse) + '\\n');

      // Should forward response to WebSocket
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'claude-response',
          data: claudeResponse
        })
      );

      mockChildProcess.emit('close', 0);
      await spawnPromise;
    });

    it('should handle authentication errors properly', async () => {
      const command = 'test message';
      const options = {};

      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      // Simulate authentication error
      const authError = {
        type: 'assistant',
        message: {
          content: [{ type: 'text', text: 'Credit balance is too low' }]
        }
      };

      mockChildProcess.stdout.emit('data', JSON.stringify(authError) + '\\n');

      // Should forward error to WebSocket
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'claude-response',
          data: authError
        })
      );

      // Simulate process exit with error
      mockChildProcess.emit('close', 1);

      await expect(spawnPromise).rejects.toThrow('Claude CLI exited with code 1');
    });
  });

  describe('Process Management', () => {
    it('should track active processes by session ID', async () => {
      const command = 'test message';
      const options = { sessionId: 'track-test-123' };

      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      // Process should be tracked
      expect(spawn).toHaveBeenCalled();

      mockChildProcess.emit('close', 0);
      await spawnPromise;
    });

    it('should abort sessions when requested', async () => {
      const command = 'test message';
      const options = { sessionId: 'abort-test-123' };

      // Start a session
      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      // Simulate session init to capture session ID
      const initResponse = {
        type: 'system',
        session_id: 'abort-test-123'
      };
      mockChildProcess.stdout.emit('data', JSON.stringify(initResponse) + '\\n');

      // Abort the session
      const aborted = abortClaudeSession('abort-test-123');
      expect(aborted).toBe(true);
      expect(mockChildProcess.kill).toHaveBeenCalledWith('SIGTERM');

      // Complete the promise
      mockChildProcess.emit('close', 0);
      await spawnPromise;
    });

    it('should handle process errors gracefully', async () => {
      const command = 'test message';
      const options = {};

      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      // Simulate process error
      const error = new Error('ENOENT: Claude CLI not found');
      mockChildProcess.emit('error', error);

      // Should send error to WebSocket
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'claude-error',
          error: error.message
        })
      );

      await expect(spawnPromise).rejects.toThrow('ENOENT: Claude CLI not found');
    });
  });

  describe('Resume Functionality', () => {
    it('should include resume flag when resuming sessions', async () => {
      const command = 'test message';
      const options = {
        sessionId: 'resume-test-123',
        resume: true
      };

      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      const [, args] = spawn.mock.calls[0];
      expect(args).toContain('--resume');
      expect(args).toContain('resume-test-123');

      mockChildProcess.emit('close', 0);
      await spawnPromise;
    });

    it('should not include resume flag for new sessions', async () => {
      const command = 'test message';
      const options = {
        sessionId: 'new-test-123',
        resume: false
      };

      const spawnPromise = spawnClaude(command, options, mockWebSocket);

      const [, args] = spawn.mock.calls[0];
      expect(args).not.toContain('--resume');

      mockChildProcess.emit('close', 0);
      await spawnPromise;
    });
  });
});