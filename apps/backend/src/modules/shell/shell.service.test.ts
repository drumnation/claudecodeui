import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import * as pty from 'node-pty';
import {createShellManager, generateSessionId} from './shell.service.js';
import type {IPty} from 'node-pty';

vi.mock('node-pty');

describe('shell.service', () => {
  let shellManager: ReturnType<typeof createShellManager>;
  let mockPty: Partial<IPty>;

  beforeEach(() => {
    vi.clearAllMocks();
    shellManager = createShellManager();

    mockPty = {
      kill: vi.fn(),
      write: vi.fn(),
      resize: vi.fn(),
      onData: vi.fn(),
      onExit: vi.fn(),
    };

    vi.mocked(pty.spawn).mockReturnValue(mockPty as IPty);
  });

  describe('createSession', () => {
    it('should create a new shell session', () => {
      const sessionId = 'test-session-123';
      const ptyProcess = shellManager.createSession(sessionId);

      expect(pty.spawn).toHaveBeenCalledWith(
        expect.any(String), // shell path
        [],
        {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: expect.any(String),
          env: expect.any(Object),
        },
      );
      expect(ptyProcess).toBe(mockPty);
    });

    it('should use SHELL environment variable', () => {
      const originalShell = process.env['SHELL'];
      process.env['SHELL'] = '/bin/zsh';

      shellManager.createSession('test-session');

      expect(pty.spawn).toHaveBeenCalledWith(
        '/bin/zsh',
        expect.any(Array),
        expect.any(Object),
      );

      process.env['SHELL'] = originalShell;
    });

    it('should use cmd.exe on Windows', () => {
      const originalPlatform = process.platform;
      const originalShell = process.env['SHELL'];
      delete process.env['SHELL'];
      Object.defineProperty(process, 'platform', {value: 'win32'});

      shellManager.createSession('test-session');

      expect(pty.spawn).toHaveBeenCalledWith(
        'cmd.exe',
        expect.any(Array),
        expect.any(Object),
      );

      Object.defineProperty(process, 'platform', {value: originalPlatform});
      if (originalShell) process.env['SHELL'] = originalShell;
    });

    it('should default to bash on non-Windows', () => {
      const originalShell = process.env['SHELL'];
      delete process.env['SHELL'];

      shellManager.createSession('test-session');

      expect(pty.spawn).toHaveBeenCalledWith(
        'bash',
        expect.any(Array),
        expect.any(Object),
      );

      if (originalShell) process.env['SHELL'] = originalShell;
    });

    it('should use HOME directory as cwd', () => {
      const originalHome = process.env['HOME'];
      process.env['HOME'] = '/home/user';

      shellManager.createSession('test-session');

      expect(pty.spawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({
          cwd: '/home/user',
        }),
      );

      process.env['HOME'] = originalHome;
    });

    it('should fallback to process.cwd() if no HOME', () => {
      const originalHome = process.env['HOME'];
      delete process.env['HOME'];
      const cwd = process.cwd();

      shellManager.createSession('test-session');

      expect(pty.spawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({
          cwd: cwd,
        }),
      );

      if (originalHome) process.env['HOME'] = originalHome;
    });
  });

  describe('getSession', () => {
    it('should return existing session', () => {
      const sessionId = 'test-session-123';
      shellManager.createSession(sessionId);

      const session = shellManager.getSession(sessionId);

      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
      expect(session?.pty).toBe(mockPty);
      expect(session?.createdAt).toBeInstanceOf(Date);
    });

    it('should return undefined for non-existent session', () => {
      const session = shellManager.getSession('non-existent');
      expect(session).toBeUndefined();
    });
  });

  describe('terminateSession', () => {
    it('should terminate an existing session', () => {
      const sessionId = 'test-session-123';
      shellManager.createSession(sessionId);

      shellManager.terminateSession(sessionId);

      expect(mockPty.kill).toHaveBeenCalled();
      expect(shellManager.getSession(sessionId)).toBeUndefined();
    });

    it('should handle non-existent session gracefully', () => {
      expect(() => {
        shellManager.terminateSession('non-existent');
      }).not.toThrow();
    });

    it('should handle errors when killing PTY process', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const sessionId = 'test-session-123';
      shellManager.createSession(sessionId);

      vi.mocked(mockPty.kill!).mockImplementation(() => {
        throw new Error('Kill failed');
      });

      shellManager.terminateSession(sessionId);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error killing PTY process:',
        expect.any(Error),
      );
      expect(shellManager.getSession(sessionId)).toBeUndefined(); // Session still removed

      consoleErrorSpy.mockRestore();
    });
  });

  describe('terminateAllSessions', () => {
    it('should terminate all sessions', () => {
      const session1 = 'session-1';
      const session2 = 'session-2';
      const session3 = 'session-3';

      shellManager.createSession(session1);
      shellManager.createSession(session2);
      shellManager.createSession(session3);

      shellManager.terminateAllSessions();

      expect(mockPty.kill).toHaveBeenCalledTimes(3);
      expect(shellManager.getSession(session1)).toBeUndefined();
      expect(shellManager.getSession(session2)).toBeUndefined();
      expect(shellManager.getSession(session3)).toBeUndefined();
    });

    it('should handle errors when killing processes', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      shellManager.createSession('session-1');
      shellManager.createSession('session-2');

      let killCount = 0;
      vi.mocked(mockPty.kill!).mockImplementation(() => {
        killCount++;
        if (killCount === 1) {
          throw new Error('Kill failed');
        }
      });

      shellManager.terminateAllSessions();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error killing PTY process:',
        expect.any(Error),
      );
      expect(shellManager.getSession('session-1')).toBeUndefined();
      expect(shellManager.getSession('session-2')).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty sessions gracefully', () => {
      expect(() => {
        shellManager.terminateAllSessions();
      }).not.toThrow();
    });
  });

  describe('generateSessionId', () => {
    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();

      expect(id1).toMatch(/^shell-\d+-[a-z0-9]{9}$/);
      expect(id2).toMatch(/^shell-\d+-[a-z0-9]{9}$/);
      expect(id1).not.toBe(id2);
    });

    it('should include timestamp in ID', () => {
      const before = Date.now();
      const id = generateSessionId();
      const after = Date.now();

      const match = id.match(/^shell-(\d+)-/);
      expect(match).toBeDefined();

      const timestamp = parseInt(match![1]);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('session management', () => {
    it('should manage multiple sessions independently', () => {
      const session1 = 'session-1';
      const session2 = 'session-2';

      const pty1 = shellManager.createSession(session1);
      const pty2 = shellManager.createSession(session2);

      expect(pty.spawn).toHaveBeenCalledTimes(2);

      // Terminate only session 1
      shellManager.terminateSession(session1);

      expect(shellManager.getSession(session1)).toBeUndefined();
      expect(shellManager.getSession(session2)).toBeDefined();
    });

    it('should reuse session ID after termination', () => {
      const sessionId = 'reusable-session';

      shellManager.createSession(sessionId);
      shellManager.terminateSession(sessionId);

      const newPty = shellManager.createSession(sessionId);

      expect(newPty).toBe(mockPty);
      expect(shellManager.getSession(sessionId)).toBeDefined();
    });
  });
});
