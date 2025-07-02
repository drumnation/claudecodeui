import type {IPty} from 'node-pty';

export interface ShellSession {
  id: string;
  pty: IPty;
  createdAt: Date;
}

export interface ShellMessage {
  type: 'input' | 'resize' | 'output' | 'exit' | 'session-id';
  data?: string;
  cols?: number;
  rows?: number;
  sessionId?: string;
  exitCode?: number;
  signal?: number;
}
