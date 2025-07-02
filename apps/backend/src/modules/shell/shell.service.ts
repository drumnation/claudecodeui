import * as pty from 'node-pty';
import type {IPty} from 'node-pty';
import type {ShellSession} from './shell.types.js';

// Create a closure to maintain shell sessions
export const createShellManager = () => {
  const sessions = new Map<string, ShellSession>();

  const createSession = (sessionId: string): IPty => {
    const shell =
      process.env['SHELL'] ||
      (process.platform === 'win32' ? 'cmd.exe' : 'bash');
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.env['HOME'] || process.cwd(),
      env: process.env as Record<string, string>,
    });

    sessions.set(sessionId, {
      id: sessionId,
      pty: ptyProcess,
      createdAt: new Date(),
    });

    return ptyProcess;
  };

  const getSession = (sessionId: string): ShellSession | undefined => {
    return sessions.get(sessionId);
  };

  const terminateSession = (sessionId: string): void => {
    const session = sessions.get(sessionId);
    if (session) {
      try {
        session.pty.kill();
      } catch (error) {
        console.error('Error killing PTY process:', error);
      }
      sessions.delete(sessionId);
    }
  };

  const terminateAllSessions = (): void => {
    for (const [sessionId, session] of sessions) {
      try {
        session.pty.kill();
      } catch (error) {
        console.error('Error killing PTY process:', error);
      }
    }
    sessions.clear();
  };

  return {
    createSession,
    getSession,
    terminateSession,
    terminateAllSessions,
  };
};

export const generateSessionId = (): string => {
  return `shell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
