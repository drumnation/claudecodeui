export interface AppProps {
  // Add any specific app props here if needed
}

export interface AppState {
  selectedProject: Project | null;
  selectedSession: Session | null;
  sessions: Session[];
  messages: Message[];
  connectionHealth: ConnectionHealth;
  isLoading: boolean;
  error: string | null;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  fullPath: string;
  displayName: string;
  type?: 'git' | 'folder';
  lastModified?: Date;
  branch?: string;
  remote?: string;
  sessionMeta?: any;
  sessions?: Session[];
}

export interface Session {
  id: string;
  projectName?: string;
  title?: string;
  summary?: string;
  timestamp: string;
  messages?: Message[];
  isActive?: boolean;
  isTempId?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  tools?: any[];
  error?: boolean;
}

export interface ConnectionHealth {
  isConnected: boolean;
  latency?: number;
  lastError?: string;
  reconnectAttempts?: number;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  projects?: Project[];
  sessions?: Session[];
  sessionId?: string;
  projectName?: string;
  refreshProjects?: boolean;
}
