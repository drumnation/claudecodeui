export interface ToolsSettings {
  allowedTools: string[];
  disallowedTools: string[];
  skipPermissions: boolean;
}

export interface SpawnClaudeOptions {
  cwd?: string;
  projectPath?: string;
  resume?: boolean;
  sessionId?: string;
  toolsSettings?: ToolsSettings;
}

export interface ClaudeResponse {
  message?: {
    content?: string;
    role: string;
  };
  session_id?: string;
  subtype?: string;
  type?: string;
}

export interface ClaudeStatusData {
  can_interrupt: boolean;
  message: string;
  raw: string;
  tokens: number;
}

export interface SessionInfo {
  id: string;
  summary: string;
}

export interface WebSocketMessage {
  type: string;
  data?: unknown;
  error?: string;
  sessionId?: string;
  exitCode?: number | null;
  isNewSession?: boolean;
  summary?: string;
}
