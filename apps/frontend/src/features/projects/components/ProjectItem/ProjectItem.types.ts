import {Project} from '../../ProjectList.types';

export interface Session {
  id: string;
  name: string;
  title?: string;
  summary?: string;
  startTime: number;
  endTime?: number;
  lastActivity?: number;
  messageCount?: number;
}

export interface SessionMeta {
  total: number;
  lastActivityTime?: number;
}

export interface ProjectWithSessions extends Project {
  displayName: string;
  sessionMeta?: SessionMeta;
  gitBranch?: string;
  gitStatus?: {
    modified: number;
    staged: number;
    untracked: number;
  };
  isWorktree?: boolean;
  language?: string;
  isMonorepo?: boolean;
}

export interface ProjectItemProps {
  project: ProjectWithSessions;
  isExpanded: boolean;
  isSelected: boolean;
  selectedSession: Session | null;
  hasActiveSession: boolean;
  editingProject: string | null;
  editingName: string;
  editingSession: string | null;
  editingSessionName: string;
  generatingSummary: Record<string, boolean>;
  regeneratingTitle: Record<string, boolean>;
  loadingSessions: Record<string, boolean>;
  additionalSessions: Record<string, Session[]>;
  initialSessionsLoaded: Set<string>;
  currentTime: number;
  getAllSessions: (project: ProjectWithSessions) => Session[];
  formatTimeAgo: (timestamp: number, currentTime: number) => string;
  onToggleProject: (projectName: string) => void;
  onProjectSelect: (project: ProjectWithSessions) => void;
  onSessionSelect: (session: Session) => void;
  onNewSession: (project: ProjectWithSessions) => void;
  onStartEditing: (project: ProjectWithSessions) => void;
  onCancelEditing: () => void;
  onSaveProjectName: (oldName: string) => void;
  onDeleteProject: (projectName: string) => void;
  onDeleteSession: (projectName: string, sessionId: string) => void;
  onGenerateSessionSummary: (projectName: string, sessionId: string) => void;
  onUpdateSessionSummary: (
    projectName: string,
    sessionId: string,
    summary: string,
  ) => void;
  onRegenerateSessionTitle: (projectName: string, sessionId: string) => void;
  onLoadMoreSessions: (project: ProjectWithSessions) => void;
  onCreateWorktree: (project: ProjectWithSessions) => void;
  onRemoveWorktree: (project: ProjectWithSessions) => void;
  onPlanFeature: (project: ProjectWithSessions) => void;
  setEditingName: (name: string) => void;
  setEditingSession: (sessionId: string | null) => void;
  setEditingSessionName: (name: string) => void;
  handleTouchClick: (callback: (e: any) => void) => (e: any) => void;
}

export interface ProjectActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithSessions;
  sessionCount: number;
  onStartEditing: (project: ProjectWithSessions) => void;
  onDeleteProject: (projectName: string) => void;
  onCreateWorktree: (project: ProjectWithSessions) => void;
  onRemoveWorktree: (project: ProjectWithSessions) => void;
  onPlanFeature: (project: ProjectWithSessions) => void;
}

export interface ProjectContextMenuProps extends ProjectActionMenuProps {
  position: {x: number; y: number};
}
