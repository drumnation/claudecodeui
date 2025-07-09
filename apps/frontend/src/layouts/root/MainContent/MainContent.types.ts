import {ReactNode} from 'react';

export type TabId = 'chat' | 'files' | 'shell' | 'git' | 'backlog' | 'preview';

export interface Project {
  id: string;
  displayName: string;
  fullPath: string;
  path: string;
}

export interface Session {
  id: string;
  summary?: string;
  timestamp: string;
  isActive?: boolean;
}

export interface ConnectionHealth {
  status: 'connected' | 'disconnected' | 'connecting';
  lastPing?: number;
  error?: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  toolCalls?: any[];
}

export interface ServerStatus {
  running: boolean;
  port?: number;
  pid?: number;
  script?: string;
}

export interface GitStatus {
  branch?: string;
  modified?: string[];
  staged?: string[];
  untracked?: string[];
  ahead?: number;
  behind?: number;
}

export interface EditingFile {
  path: string;
  content?: string;
  projectPath: string;
  diffInfo?: any;
}

export interface MainContentProps {
  selectedProject: Project | null;
  selectedSession: Session | null;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  ws: WebSocket | null;
  sendMessage: (message: any) => void;
  messages: Message[];
  connectionHealth: ConnectionHealth;
  isMobile: boolean;
  onMenuClick: () => void;
  isLoading: boolean;
  onInputFocusChange: (focused: boolean) => void;

  // Session Protection Props
  onSessionActive: () => void;
  onSessionInactive: () => void;
  onReplaceTemporarySession: (oldId: string, newId: string) => void;
  onNavigateToSession: (projectId: string, sessionId: string) => void;
  onShowSettings: () => void;

  // Settings
  autoExpandTools: boolean;
  showRawParameters: boolean;
  autoScrollToBottom: boolean;
}
