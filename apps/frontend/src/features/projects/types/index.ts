/**
 * Projects Feature Types - Domain-specific type definitions
 * Following Bulletproof React feature-slice pattern
 */

// Core project types
export interface Project {
  id: string;
  name: string;
  displayName: string;
  fullPath: string;
  sessionMeta: SessionMeta;
  sessions: Session[];
}

export interface Session {
  id: string;
  summary: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  messageCount?: number;
  lastActivity?: string;
}

export interface SessionMeta {
  totalSessions: number;
  total?: number;
  recentSession?: Session;
  hasMore?: boolean;
}

// Project management operations
export interface ProjectOperations {
  onProjectSelect: (project: Project) => void;
  onSessionSelect: (session: Session) => void;
  onNewSession: (project: Project) => void;
  onSessionDelete: (sessionId: string) => void;
  onProjectDelete: (projectName: string) => void;
  onRefresh: () => Promise<void>;
}

// Project state
export interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  selectedSession: Session | null;
  isLoading: boolean;
  error: string | null;
}

// Project creation/editing
export interface ProjectFormData {
  name: string;
  displayName: string;
  path: string;
  description?: string;
}

// Session operations
export interface SessionOperations {
  createSession: (projectName: string, title?: string) => Promise<Session>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionSummary: (sessionId: string, summary: string) => Promise<void>;
  loadSessionHistory: (sessionId: string) => Promise<any[]>;
}

// Project API responses
export interface ProjectsResponse {
  projects: Project[];
  total: number;
}

export interface SessionsResponse {
  sessions: Session[];
  total: number;
  hasMore: boolean;
}