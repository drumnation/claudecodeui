/**
 * Shell Feature Types
 * 
 * Comprehensive type definitions for shell, git, and live preview functionality
 */

import type { Project, Session } from "../../../App";

// Terminal Session Types
export interface TerminalSession {
  terminal: any;
  fitAddon: any;
  ws: WebSocket | null;
  isConnected: boolean;
  lastActivity?: number;
}

export interface ShellProps {
  selectedProject: Project | null;
  selectedSession: Session | null;
  isActive: boolean;
}

export interface ShellState {
  isConnected: boolean;
  isInitialized: boolean;
  isRestarting: boolean;
  isConnecting: boolean;
  lastSessionId: string | null;
}

// Git Types
export interface GitStatus {
  modified?: string[];
  added?: string[];
  deleted?: string[];
  untracked?: string[];
  branch?: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  stats?: string;
}

export interface GitPanelProps {
  selectedProject: Project | null;
  isMobile: boolean;
}

export interface GitPanelState {
  gitStatus: GitStatus | null;
  gitDiff: Record<string, any>;
  isLoading: boolean;
  commitMessage: string;
  expandedFiles: Set<string>;
  selectedFiles: Set<string>;
  isCommitting: boolean;
  currentBranch: string;
  branches: string[];
  activeView: 'changes' | 'history';
  recentCommits: GitCommit[];
  expandedCommits: Set<string>;
  commitDiffs: Record<string, any>;
  isGeneratingMessage: boolean;
}

// Live Preview Types
export interface ServerLog {
  type: string;
  message: string;
  timestamp?: any;
}

export interface LivePreviewPanelProps {
  selectedProject: Project | null;
  serverStatus: string;
  serverUrl: string;
  availableScripts: string[];
  onStartServer: (script: string) => void;
  onStopServer: () => void;
  onScriptSelect: (script: string) => void;
  currentScript: string;
  onClose: () => void;
  isMobile: boolean;
  serverLogs?: ServerLog[];
  onClearLogs: () => void;
}

export interface LivePreviewState {
  url: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  error: string | null;
  iframeKey: number;
  showDevServerAnyway: boolean;
  showLogs: boolean;
}

// WebSocket Message Types for Shell
export interface ShellWSMessage {
  type: 'init' | 'input' | 'output' | 'url_open' | 'error';
  data?: string;
  projectPath?: string;
  sessionId?: string;
  hasSession?: boolean;
  url?: string;
}

// Logging Context Types
export interface ShellLoggingContext {
  sessionId?: string;
  projectName?: string;
  projectPath?: string;
  terminalState?: string;
  wsState?: string;
  command?: string;
  error?: string;
}

export interface GitLoggingContext {
  projectName?: string;
  projectPath?: string;
  branch?: string;
  operation?: string;
  files?: string[];
  commitHash?: string;
  error?: string;
}

export interface LivePreviewLoggingContext {
  projectName?: string;
  serverStatus?: string;
  serverUrl?: string;
  script?: string;
  error?: string;
  action?: string;
}