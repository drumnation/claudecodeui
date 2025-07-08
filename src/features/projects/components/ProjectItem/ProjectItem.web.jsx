import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  MoreVertical,
  GitBranch,
  Brain
} from 'lucide-react';
import { Button } from '@/shared-components/Button/Button';
import { SessionList } from '../SessionList';
import { cn } from '@/lib/utils';
import * as S from './ProjectItem.styles';
import { WorktreeBadge, ProjectLanguageBadge, ProjectMonorepoBadge } from '@/components/WorktreeBadge/WorktreeBadge';
import { GitBranchBadge } from '@/features/projects/components/GitBranchBadge';

// Desktop context menu component
const ProjectContextMenu = ({ 
  isOpen, 
  onClose, 
  project, 
  sessionCount, 
  onStartEditing, 
  onDeleteProject, 
  onCreateWorktree, 
  onRemoveWorktree,
  onPlanFeature,
  position 
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <S.DesktopContextMenu ref={menuRef} style={{ top: position.y, left: position.x }}>
      <S.DesktopContextItem
        onClick={() => {
          onStartEditing(project);
          onClose();
        }}
      >
        <Edit3 className="w-4 h-4" />
        <span>Edit Project Name</span>
      </S.DesktopContextItem>
      
      <S.DesktopContextItem
        onClick={() => {
          onPlanFeature(project);
          onClose();
        }}
      >
        <Brain className="w-4 h-4" />
        <span>Plan Feature</span>
      </S.DesktopContextItem>
      
      {!project.isWorktree && (
        <S.DesktopContextItem
          onClick={() => {
            onCreateWorktree(project);
            onClose();
          }}
        >
          <GitBranch className="w-4 h-4" />
          <span>Create Worktree</span>
        </S.DesktopContextItem>
      )}

      {project.isWorktree && (
        <S.DesktopContextItem
          onClick={() => {
            onRemoveWorktree(project);
            onClose();
          }}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
          <span>Remove Worktree</span>
        </S.DesktopContextItem>
      )}
      
      {sessionCount === 0 && !project.isWorktree && (
        <S.DesktopContextItem
          onClick={() => {
            onDeleteProject(project.name);
            onClose();
          }}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Empty Project</span>
        </S.DesktopContextItem>
      )}
    </S.DesktopContextMenu>
  );
};

export const ProjectItemWeb = ({
  project,
  isExpanded,
  isSelected,
  selectedSession,
  hasActiveSession,
  editingProject,
  editingName,
  editingSession,
  editingSessionName,
  generatingSummary,
  regeneratingTitle,
  loadingSessions,
  additionalSessions,
  initialSessionsLoaded,
  currentTime,
  getAllSessions,
  formatTimeAgo,
  onToggleProject,
  onProjectSelect,
  onSessionSelect,
  onNewSession,
  onStartEditing,
  onCancelEditing,
  onSaveProjectName,
  onDeleteProject,
  onDeleteSession,
  onGenerateSessionSummary,
  onUpdateSessionSummary,
  onRegenerateSessionTitle,
  onLoadMoreSessions,
  onCreateWorktree,
  onRemoveWorktree,
  onPlanFeature,
  setEditingName,
  setEditingSession,
  setEditingSessionName,
  handleTouchClick
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const sessions = getAllSessions(project);
  const sessionCount = project.sessionMeta?.total || sessions.length;
  const hasMore = sessionCount > sessions.length;
  const displayCount = hasMore && sessionCount >= 5 ? `${sessionCount}+` : sessionCount;

  return (
    <S.ProjectContainer>
      <S.ProjectHeader className="group">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between font-normal hover:bg-accent/50 min-h-fit h-auto",
            isSelected && "bg-accent text-accent-foreground"
          )}
          onClick={() => {
            if (!isSelected) {
              onProjectSelect(project);
            }
            onToggleProject(project.name);
          }}
        >
          <div className="flex items-center justify-between w-full py-4 px-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
            {isExpanded ? (
              <FolderOpen className={cn(
                "w-4 h-4 flex-shrink-0",
                hasActiveSession ? "text-green-600 dark:text-green-500" : "text-primary"
              )} />
            ) : (
              <Folder className={cn(
                "w-4 h-4 flex-shrink-0",
                hasActiveSession ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
              )} />
            )}
            <div className="min-w-0 flex-1 text-left">
              {editingProject === project.name ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary/20"
                    placeholder="Project name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSaveProjectName(project.name);
                      if (e.key === 'Escape') onCancelEditing();
                    }}
                  />
                  <div className="text-xs text-muted-foreground truncate" title={project.fullPath}>
                    {project.fullPath}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-semibold truncate text-foreground" title={project.displayName}>
                    {project.displayName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{displayCount} session{displayCount === 1 ? '' : 's'}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {project.isWorktree && <WorktreeBadge />}
                      <ProjectLanguageBadge language={project.language} />
                      <ProjectMonorepoBadge isMonorepo={project.isMonorepo} />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <GitBranchBadge branch={project.gitBranch} gitStatus={project.gitStatus} />
                  </div>
                </div>
              )}
            </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
            {editingProject === project.name ? (
              <>
                <S.DesktopHoverActions
                  className="text-green-600 hover:text-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveProjectName(project.name);
                  }}
                >
                  <Check className="w-3 h-3" />
                </S.DesktopHoverActions>
                <S.DesktopHoverActions
                  className="text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelEditing();
                  }}
                >
                  <X className="w-3 h-3" />
                </S.DesktopHoverActions>
              </>
            ) : (
              <>
                <S.DesktopEditAction
                  className="group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditing(project);
                  }}
                >
                  <Edit3 className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </S.DesktopEditAction>
                {sessionCount === 0 && !project.isWorktree && (
                  <S.DesktopDeleteAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project.name);
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-600" />
                  </S.DesktopDeleteAction>
                )}
                <S.DesktopContextTrigger
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setContextMenuPosition({
                      x: rect.left - 150, // Position menu to the left of the button
                      y: rect.bottom + 5
                    });
                    setShowContextMenu(true);
                  }}
                >
                  <MoreVertical className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </S.DesktopContextTrigger>
                <ChevronRight className={cn(
                  "w-3 h-3 transition-transform text-muted-foreground",
                  isExpanded && "rotate-90"
                )} />
              </>
            )}
            </div>
          </div>
        </Button>
      </S.ProjectHeader>

      {/* Sessions List */}
      {isExpanded && (
        <S.SessionsContainer>
          <SessionList
            project={project}
            sessions={sessions}
            selectedSession={selectedSession}
            editingSession={editingSession}
            editingSessionName={editingSessionName}
            generatingSummary={generatingSummary}
            regeneratingTitle={regeneratingTitle}
            loadingSessions={loadingSessions}
            initialSessionsLoaded={initialSessionsLoaded}
            currentTime={currentTime}
            formatTimeAgo={formatTimeAgo}
            hasMore={hasMore}
            onProjectSelect={onProjectSelect}
            onSessionSelect={onSessionSelect}
            onNewSession={onNewSession}
            onDeleteSession={onDeleteSession}
            onGenerateSessionSummary={onGenerateSessionSummary}
            onUpdateSessionSummary={onUpdateSessionSummary}
            onRegenerateSessionTitle={onRegenerateSessionTitle}
            onLoadMoreSessions={onLoadMoreSessions}
            setEditingSession={setEditingSession}
            setEditingSessionName={setEditingSessionName}
            handleTouchClick={handleTouchClick}
          />
        </S.SessionsContainer>
      )}

      {/* Desktop Context Menu */}
      <ProjectContextMenu
        isOpen={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        project={project}
        sessionCount={sessionCount}
        onStartEditing={onStartEditing}
        onDeleteProject={onDeleteProject}
        onCreateWorktree={onCreateWorktree}
        onRemoveWorktree={onRemoveWorktree}
        onPlanFeature={onPlanFeature}
        position={contextMenuPosition}
      />
    </S.ProjectContainer>
  );
};