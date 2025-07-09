import {ReactNode} from 'react';

export interface Project {
  id: string;
  displayName: string;
  fullPath: string;
  path: string;
  sessions?: Session[];
}

export interface Session {
  id: string;
  summary?: string;
  timestamp: string;
  isActive?: boolean;
}

export interface SidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  selectedSession: Session | null;
  onProjectSelect: (project: Project) => void;
  onSessionSelect: (session: Session) => void;
  onNewSession: (project: Project, sessionId?: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onProjectDelete: (projectName: string) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onShowSettings: () => void;
}
