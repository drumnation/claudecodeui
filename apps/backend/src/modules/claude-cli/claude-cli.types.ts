// Types for Claude CLI module

export interface ClaudeCommand {
  type: 'claude-command';
  command: string;
  options?: {
    projectPath?: string;
    cwd?: string;
    sessionId?: string;
    resume?: boolean;
    toolsSettings?: {
      allowedTools?: string[];
      disallowedTools?: string[];
      skipPermissions?: boolean;
    };
  };
}

export interface AbortSession {
  type: 'abort-session';
  sessionId: string;
}

export interface ClaudeWebSocketMessage {
  type: string;
  data?: any;
  error?: string;
  sessionId?: string;
  status?: any;
  message?: any;
  exitCode?: number;
  isNewSession?: boolean;
  summary?: string;
}

export interface SessionInfo {
  sessionId: string;
  projectPath?: string;
  cwd?: string;
  messageCount: number;
  isManuallyEdited?: boolean;
}