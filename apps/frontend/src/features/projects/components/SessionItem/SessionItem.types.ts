import {Session, ProjectWithSessions} from '../ProjectItem/ProjectItem.types';

export interface SessionItemProps {
  session: Session;
  project: ProjectWithSessions;
  isSelected: boolean;
  isActive: boolean;
  isEditing: boolean;
  editingSessionName: string;
  isGeneratingSummary: boolean;
  isRegeneratingTitle: boolean;
  currentTime: number;
  formatTimeAgo: (timestamp: number, currentTime: number) => string;
  onProjectSelect: (project: ProjectWithSessions) => void;
  onSessionSelect: (session: Session) => void;
  onDeleteSession: (projectName: string, sessionId: string) => void;
  onGenerateSessionSummary: (projectName: string, sessionId: string) => void;
  onUpdateSessionSummary: (
    projectName: string,
    sessionId: string,
    summary: string,
  ) => void;
  onRegenerateSessionTitle: (projectName: string, sessionId: string) => void;
  setEditingSession: (sessionId: string | null) => void;
  setEditingSessionName: (name: string) => void;
  handleTouchClick: (callback: (e: any) => void) => (e: any) => void;
}

export interface SessionActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  project: ProjectWithSessions;
  isGeneratingSummary: boolean;
  isRegeneratingTitle: boolean;
  onGenerateSessionSummary: (projectName: string, sessionId: string) => void;
  onRegenerateSessionTitle: (projectName: string, sessionId: string) => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (projectName: string, sessionId: string) => void;
}
