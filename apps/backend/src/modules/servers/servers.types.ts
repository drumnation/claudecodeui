import type {ChildProcess} from 'child_process';

export interface ServerInfo {
  process: ChildProcess;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  port: string | null;
  url: string | null;
  script: string;
  projectPath: string;
  startTime: Date;
}

export interface ServerStatusInfo {
  script: string;
  status: string;
  url: string | null;
  port: string | null;
  startTime: Date;
}

export interface StartServerResult {
  success?: boolean;
  error?: string;
  url?: string | null;
}

export interface StopServerResult {
  success: boolean;
}

export interface WebSocketMessage {
  type: string;
  projectPath: string;
  status?: string;
  url?: string | null;
  script?: string;
  message?: string;
  stream?: string;
  timestamp: string;
}
