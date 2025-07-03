/**
 * App-Level Types - Global type definitions shared across features
 * Following Bulletproof React pattern for shared contracts
 */

// Re-export feature types at app level for cross-feature communication
export type { Project, Session, SessionMeta } from '@/features/projects/types';
export type { ChatMessage } from '@/features/chat/types';
export type { FileItem, EditableFile } from '@/features/files/types';

// App-level routing types
export interface AppRoute {
  path: string;
  component: React.ComponentType;
  feature: 'chat' | 'projects' | 'files' | 'shell' | 'settings';
  requiresProject?: boolean;
  requiresSession?: boolean;
}

// Global app state
export interface AppState {
  selectedProject: Project | null;
  selectedSession: Session | null;
  currentRoute: string;
  isLoading: boolean;
  error: string | null;
}

// Navigation actions
export interface NavigationActions {
  navigateToProject: (projectName: string) => void;
  navigateToSession: (sessionId: string) => void;
  navigateToRoute: (route: string) => void;
  goBack: () => void;
  goForward: () => void;
}

// App configuration
export interface AppConfig {
  apiBaseUrl: string;
  wsUrl: string;
  features: {
    chat: boolean;
    files: boolean;
    shell: boolean;
    git: boolean;
    preview: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    sidebarWidth: number;
    autoSave: boolean;
    autoExpandTools: boolean;
    showRawParameters: boolean;
    autoScrollToBottom: boolean;
  };
}

// Mobile navigation
export type MobileNavTab = 'chat' | 'files' | 'shell' | 'git' | 'preview';

export interface MobileNavState {
  activeTab: MobileNavTab;
  isInputFocused: boolean;
  sidebarOpen: boolean;
}

// Error handling
export interface AppError {
  code: string;
  message: string;
  feature?: string;
  context?: Record<string, any>;
  timestamp: number;
  recoverable: boolean;
}

// Feature permissions
export interface FeaturePermissions {
  chat: {
    sendMessages: boolean;
    loadHistory: boolean;
    deleteMessages: boolean;
  };
  projects: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  files: {
    read: boolean;
    write: boolean;
    create: boolean;
    delete: boolean;
    execute: boolean;
  };
  shell: {
    execute: boolean;
    installPackages: boolean;
    modifySystem: boolean;
  };
  settings: {
    modify: boolean;
    export: boolean;
    import: boolean;
  };
}