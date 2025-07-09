import {MouseEvent, TouchEvent} from 'react';

export type TabId = 'chat' | 'files' | 'shell' | 'git' | 'backlog' | 'preview';

export interface Project {
  id: string;
  displayName: string;
  fullPath: string;
  path: string;
}

export interface Session {
  id: string;
  summary: string;
  timestamp: string;
}

export interface ProjectHeaderProps {
  selectedProject: Project;
  selectedSession: Session | null;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isMobile: boolean;
  onMenuClick: () => void;
}
