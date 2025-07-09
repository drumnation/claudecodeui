export interface ShellProps {
  selectedProject: {
    name: string;
    path: string;
    fullPath?: string;
    displayName?: string;
  } | null;
  selectedSession?: {
    summary: string;
    [key: string]: any;
  };
  isActive?: boolean;
  height?: number | string;
  defaultCommand?: string;
}

export interface ShellState {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  isConnected: boolean;
  error: string | null;
}

export interface TerminalSession {
  id: string;
  name: string;
  projectPath: string;
  isActive: boolean;
  output: string;
  command?: string;
  exitCode?: number;
  createdAt: Date;
}

export interface ShellCommand {
  id: string;
  command: string;
  timestamp: Date;
  output?: string;
  error?: string;
  exitCode?: number;
  duration?: number;
}

export interface ShellHeaderProps {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  onSessionChange: (sessionId: string) => void;
  onNewSession: () => void;
  onCloseSession: (sessionId: string) => void;
  onClear: () => void;
}

export interface TerminalProps {
  sessionId: string;
  onCommand: (command: string) => void;
  onResize?: (cols: number, rows: number) => void;
  fontSize?: number;
  theme?: string;
  cursorStyle?: 'block' | 'bar' | 'underline';
}

export interface ShellWebSocketMessage {
  type: 'command' | 'output' | 'error' | 'exit' | 'resize' | 'clear';
  sessionId: string;
  data?: any;
}

export interface CommandHistoryItem {
  command: string;
  timestamp: Date;
  projectPath: string;
  exitCode?: number;
}
