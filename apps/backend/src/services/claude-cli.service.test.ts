import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClaudeCliService } from './claude-cli.service';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';

// Mock child_process
vi.mock('child_process', () => ({
  spawn: vi.fn()
}));

// Mock logger
vi.mock('@kit/logger/node', () => ({
  createLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}));

describe('ClaudeCliService', () => {
  let service: ClaudeCliService;
  let mockProcess: any;

  beforeEach(() => {
    // Create mock process
    mockProcess = new EventEmitter() as any;
    mockProcess.stdout = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    mockProcess.stdin = {
      write: vi.fn(),
      end: vi.fn()
    };
    mockProcess.kill = vi.fn();
    mockProcess.killed = false;

    // Reset mocks
    vi.clearAllMocks();
    (spawn as any).mockReturnValue(mockProcess);

    // Create service instance
    service = new ClaudeCliService('test-session-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('start', () => {
    it('should spawn claude process with correct arguments for new session', async () => {
      await service.start({
        command: 'Hello Claude',
        cwd: '/test/project',
        toolsSettings: {
          allowedTools: ['Read', 'Write'],
          disallowedTools: ['Bash'],
          skipPermissions: false
        }
      });

      expect(spawn).toHaveBeenCalledWith(
        'claude',
        [
          '--print', 'Hello Claude',
          '--output-format', 'stream-json',
          '--verbose',
          '--model', 'sonnet',
          '--allowedTools', 'Read',
          '--allowedTools', 'Write',
          '--disallowedTools', 'Bash'
        ],
        {
          cwd: '/test/project',
          stdio: ['pipe', 'pipe', 'pipe'],
          env: expect.objectContaining({
            FORCE_COLOR: '3',
            TERM: 'xterm-256color',
            COLORTERM: 'truecolor',
            CI: 'false'
          })
        }
      );
    });

    it('should spawn claude process with resume flag for existing session', async () => {
      await service.start({
        sessionId: 'existing-session-123',
        resume: true,
        cwd: '/test/project'
      });

      expect(spawn).toHaveBeenCalledWith(
        'claude',
        expect.arrayContaining([
          '--resume', 'existing-session-123',
          '--output-format', 'stream-json',
          '--verbose'
        ]),
        expect.any(Object)
      );
    });

    it('should handle dangerously-skip-permissions flag', async () => {
      await service.start({
        command: 'Test',
        toolsSettings: {
          skipPermissions: true,
          allowedTools: ['Read'], // Should be ignored
          disallowedTools: ['Write'] // Should be ignored
        }
      });

      const args = (spawn as any).mock.calls[0][1];
      expect(args).toContain('--dangerously-skip-permissions');
      expect(args).not.toContain('--allowedTools');
      expect(args).not.toContain('--disallowedTools');
    });

    it('should emit error when spawn fails', async () => {
      (spawn as any).mockImplementation(() => {
        throw new Error('Command not found');
      });

      const errorHandler = vi.fn();
      service.on('error', errorHandler);

      await expect(service.start({ command: 'Test' })).rejects.toThrow();
      expect(errorHandler).toHaveBeenCalledWith({
        type: 'error',
        data: 'Failed to start Claude CLI. Make sure claude is installed and in your PATH.'
      });
    });
  });

  describe('stdout handling', () => {
    beforeEach(async () => {
      await service.start({ command: 'Test' });
    });

    it('should parse and emit JSON responses', async () => {
      const jsonResponse = {
        type: 'message',
        message: { role: 'assistant', content: 'Hello!' },
        session_id: 'new-session-456'
      };

      const promise = new Promise((resolve) => {
        service.on('claude-response', (event) => {
          expect(event.type).toBe('claude-response');
          expect(event.data).toEqual(jsonResponse);
          resolve(true);
        });
      });

      mockProcess.stdout.emit('data', JSON.stringify(jsonResponse) + '\n');
      await promise;
    });

    it('should capture session ID and emit session-created event', async () => {
      // Create a new service without initial session ID to test session creation
      const newService = new ClaudeCliService('');
      
      // Mock the process for the new service
      newService['process'] = mockProcess;
      newService['setupProcessHandlers']();
      
      const jsonResponse = {
        session_id: 'captured-session-789'
      };

      const promise = new Promise((resolve) => {
        newService.on('session-created', (event) => {
          expect(event.type).toBe('session-created');
          expect(event.sessionId).toBe('captured-session-789');
          resolve(true);
        });
      });

      mockProcess.stdout.emit('data', JSON.stringify(jsonResponse) + '\n');
      await promise;
    });

    it('should detect and parse status messages in JSON format', async () => {
      const statusResponse = {
        type: 'status',
        message: 'Processing...',
        tokens: 150
      };

      const promise = new Promise((resolve) => {
        service.on('status', (event) => {
          expect(event.type).toBe('status');
          expect(event.data).toEqual(statusResponse);
          resolve(true);
        });
      });

      mockProcess.stdout.emit('data', JSON.stringify(statusResponse) + '\n');
      await promise;
    });

    it('should detect and parse status messages in text format', async () => {
      const statusLine = '✻ Working... (⚒ 250 tokens · esc to interrupt)';

      const promise = new Promise((resolve) => {
        service.on('status', (event) => {
          expect(event.type).toBe('status');
          expect(event.data.message).toBe('Working...');
          expect(event.data.tokens).toBe(250);
          expect(event.data.can_interrupt).toBe(true);
          resolve(true);
        });
      });

      mockProcess.stdout.emit('data', statusLine + '\n');
      await promise;
    });

    it('should handle incomplete lines and buffer them', () => {
      const part1 = '{"type":"message","content":"Part';
      const part2 = 'ial message"}\n';

      const responseHandler = vi.fn();
      service.on('claude-response', responseHandler);

      // Send first part - should not emit yet
      mockProcess.stdout.emit('data', part1);
      expect(responseHandler).not.toHaveBeenCalled();

      // Send second part - should now emit
      mockProcess.stdout.emit('data', part2);
      expect(responseHandler).toHaveBeenCalled();
    });

    it('should detect interactive prompts in buffer', async () => {
      const promptText = 'Do you want to continue? (y/n) >';

      const promise = new Promise((resolve) => {
        service.on('interactive-prompt', (event) => {
          expect(event.type).toBe('interactive-prompt');
          expect(event.data).toBe(promptText);
          resolve(true);
        });
      });

      // Send without newline to keep in buffer
      mockProcess.stdout.emit('data', promptText);
      await promise;
    });

    it('should emit raw output for non-JSON lines', async () => {
      const rawLine = 'This is raw output from Claude';

      const promise = new Promise((resolve) => {
        service.on('claude-output', (event) => {
          expect(event.type).toBe('claude-output');
          expect(event.data).toBe(rawLine);
          resolve(true);
        });
      });

      mockProcess.stdout.emit('data', rawLine + '\n');
      await promise;
    });
  });

  describe('stderr handling', () => {
    beforeEach(async () => {
      await service.start({ command: 'Test' });
    });

    it('should detect status messages in stderr', async () => {
      const statusLine = '✹ Analyzing... (⚒ 500 tokens · esc to interrupt)';

      const promise = new Promise((resolve) => {
        service.on('status', (event) => {
          expect(event.type).toBe('status');
          expect(event.data.message).toBe('Analyzing...');
          expect(event.data.tokens).toBe(500);
          resolve(true);
        });
      });

      mockProcess.stderr.emit('data', statusLine);
      await promise;
    });

    it('should emit errors for non-status stderr output', async () => {
      const errorMessage = 'Error: Something went wrong';

      const promise = new Promise((resolve) => {
        service.on('error', (event) => {
          expect(event.type).toBe('error');
          expect(event.data).toBe(errorMessage);
          resolve(true);
        });
      });

      mockProcess.stderr.emit('data', errorMessage);
      await promise;
    });
  });

  describe('process lifecycle', () => {
    beforeEach(async () => {
      await service.start({ command: 'Test' });
    });

    it('should emit exit and stream-end events when process closes', async () => {
      const events: any[] = [];

      service.on('exit', (event) => events.push(event));
      service.on('stream-end', (event) => events.push(event));

      mockProcess.emit('close', 0);

      // Wait a tick for events to be processed
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({
        type: 'exit',
        data: {
          exitCode: 0,
          sessionId: 'test-session-123'
        }
      });
      expect(events[1]).toEqual({ type: 'stream-end' });
    });

    it('should emit error event on process error', async () => {
      const processError = new Error('Process crashed');

      const promise = new Promise((resolve) => {
        service.on('error', (event) => {
          expect(event.type).toBe('error');
          expect(event.data).toBe('Process crashed');
          resolve(true);
        });
      });

      mockProcess.emit('error', processError);
      await promise;
    });
  });

  describe('command sending', () => {
    beforeEach(async () => {
      await service.start({ command: 'Initial' });
    });

    it('should send command to stdin', () => {
      service.sendCommand('Hello Claude');
      
      expect(mockProcess.stdin.write).toHaveBeenCalledWith('Hello Claude\n');
    });

    it('should throw error if process not running', () => {
      service.kill();
      
      expect(() => service.sendCommand('Test')).toThrow('Claude process not running');
    });
  });

  describe('interactive responses', () => {
    beforeEach(async () => {
      await service.start({ command: 'Test' });
    });

    it('should send interactive response to stdin', () => {
      service.sendInteractiveResponse('y');
      
      expect(mockProcess.stdin.write).toHaveBeenCalledWith('y\n');
    });
  });

  describe('process management', () => {
    beforeEach(async () => {
      await service.start({ command: 'Test' });
    });

    it('should kill process when kill() is called', () => {
      expect(service.isRunning()).toBe(true);
      
      service.kill();
      
      expect(mockProcess.kill).toHaveBeenCalled();
      expect(service.isRunning()).toBe(false);
    });

    it('should report running status correctly', () => {
      expect(service.isRunning()).toBe(true);
      
      mockProcess.killed = true;
      expect(service.isRunning()).toBe(false);
    });
  });

  describe('status message parsing', () => {
    beforeEach(async () => {
      await service.start({ command: 'Test' });
    });

    const statusTestCases = [
      {
        input: '✻ Working... (23s · ⚒ 100 tokens · esc to interrupt)',
        expected: { message: 'Working...', tokens: 100, can_interrupt: true }
      },
      {
        input: '✹ Analyzing code... (⚒ 250 tokens)',
        expected: { message: 'Analyzing...', tokens: 250, can_interrupt: false }
      },
      {
        input: '✸ Reading files... (⚒ 0 tokens · esc to interrupt)',
        expected: { message: 'Reading...', tokens: 0, can_interrupt: true }
      },
      {
        input: '✶ Thinking... (⚒ 1500 tokens)',
        expected: { message: 'Thinking...', tokens: 1500, can_interrupt: false }
      }
    ];

    statusTestCases.forEach(({ input, expected }) => {
      it(`should parse status: "${input}"`, async () => {
        const promise = new Promise((resolve) => {
          service.on('status', (event) => {
            expect(event.data.message).toBe(expected.message);
            expect(event.data.tokens).toBe(expected.tokens);
            expect(event.data.can_interrupt).toBe(expected.can_interrupt);
            resolve(true);
          });
        });

        mockProcess.stdout.emit('data', input + '\n');
        await promise;
      });
    });
  });
});