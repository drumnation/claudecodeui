/**
 * TypeScript type definitions for project-related data structures
 * Based on the existing JSDoc typedefs in projects.js
 */

export interface Project {
  name: string;
  path: string;
  displayName?: string;
  language?: string;
  isMonorepo?: boolean;
  monorepoType?: 'npm-workspaces' | 'lerna' | 'nx' | 'cargo-workspace' | 'go-workspace' | 'gradle' | 'maven';
  subprojects?: string[];
  isWorktree?: boolean;
  mainRepoPath?: string;
  lastActivity?: string;
  created?: string;
  sessions?: Session[];
  sessionCount?: number;
  missing?: boolean;
  error?: string;
}

export interface Session {
  id: string;
  summary?: string;
  messageCount: number;
  created: string;
  lastActivity?: string;
  cwd?: string;
  toolsUsed?: string[];
}

export interface SessionMeta {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface SessionsResponse {
  sessions: Session[];
  meta: SessionMeta;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  type: 'function';
  function: {
    name: string;
    arguments?: string;
  };
}

export interface MonorepoInfo {
  isMonorepo: boolean;
  monorepoType?: string;
  subprojects?: string[];
}

export interface ProjectConfig {
  [path: string]: Project;
}

export interface ProjectStats {
  totalProjects: number;
  languageCounts: Record<string, number>;
  monorepoCount: number;
  worktreeCount: number;
  totalSessions: number;
  averageSessionsPerProject: string;
}

export interface SessionStats {
  totalSessions: number;
  totalMessages: number;
  averageMessagesPerSession: string;
  sessionsWithSummary: number;
  summaryPercentage: string;
}

export interface GitStatus {
  branch: string;
  files: GitFile[];
}

export interface GitFile {
  path: string;
  status: string;
  type: 'modified' | 'added' | 'deleted' | 'untracked' | 'staged';
}

export interface GitCommit {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
  stats?: {
    filesChanged: number;
    insertions: number;
    deletions: number;
  };
}

export interface ServerStatus {
  [name: string]: {
    status: 'running' | 'stopped';
    command: string;
    args: string[];
    cwd: string;
    port?: number;
    pid?: number;
  };
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
  modified?: string;
}

export interface SlashCommand {
  name: string;
  description: string;
  pattern?: string;
  action: string;
}