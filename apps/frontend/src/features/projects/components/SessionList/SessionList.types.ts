import {Session, ProjectWithSessions} from '../ProjectItem/ProjectItem.types';

export interface SessionListProps {
  project: ProjectWithSessions;
  sessions: Session[];
  selectedSession: Session | null;
  editingSession: string | null;
  editingSessionName: string;
  generatingSummary: Record<string, boolean>;
  regeneratingTitle: Record<string, boolean>;
  loadingSessions: Record<string, boolean>;
  initialSessionsLoaded: Set<string>;
  currentTime: number;
  formatTimeAgo: (timestamp: number, currentTime: number) => string;
  hasMore: boolean;
  onProjectSelect: (project: ProjectWithSessions) => void;
  onSessionSelect: (session: Session) => void;
  onNewSession: (project: ProjectWithSessions) => void;
  onDeleteSession: (projectName: string, sessionId: string) => void;
  onGenerateSessionSummary: (projectName: string, sessionId: string) => void;
  onUpdateSessionSummary: (
    projectName: string,
    sessionId: string,
    summary: string,
  ) => void;
  onRegenerateSessionTitle: (projectName: string, sessionId: string) => void;
  onLoadMoreSessions: (project: ProjectWithSessions) => void;
  setEditingSession: (sessionId: string | null) => void;
  setEditingSessionName: (name: string) => void;
  handleTouchClick: (callback: (e: any) => void) => (e: any) => void;
}
