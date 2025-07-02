export interface ProjectConfig {
  [projectName: string]: {
    displayName?: string;
    manuallyAdded?: boolean;
    originalPath?: string;
  };
}

export interface SessionMeta {
  hasMore: boolean;
  total: number;
}

export interface Session {
  id: string;
  summary: string;
  messageCount: number;
  lastActivity: Date;
  cwd: string;
}

export interface Project {
  name: string;
  path: string | null;
  displayName: string;
  fullPath: string;
  isCustomName: boolean;
  isManuallyAdded?: boolean;
  sessions: Session[];
  sessionMeta?: SessionMeta;
}

export interface SessionsResult {
  sessions: Session[];
  hasMore: boolean;
  total: number;
  offset?: number;
  limit?: number;
}

export interface JsonlEntry {
  sessionId?: string;
  type?: string;
  summary?: string;
  message?: {
    role: string;
    content: string;
  };
  timestamp?: string;
  cwd?: string;
}

export interface FileWithStats {
  file: string;
  mtime: Date;
}

export interface PackageJson {
  name?: string;
}

export interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

export interface ProjectMetadata {
  displayName?: string;
  path: string;
  createdAt?: string;
}
