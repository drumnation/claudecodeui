import React from 'react';
import { Button } from '@/shared-components/Button/Button';
import { SessionList } from '../SessionList';
import { 
  FolderOpen, 
  Folder, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Check, 
  X, 
  Trash2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as S from './ProjectItem.styles';

export const ProjectItem = ({
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
  onLoadMoreSessions,
  setEditingName,
  setEditingSession,
  setEditingSessionName,
  handleTouchClick
}) => {
  const sessions = getAllSessions(project);
  const sessionCount = sessions.length;
  const hasMore = project.sessionMeta?.hasMore !== false;
  const displayCount = hasMore && sessionCount >= 5 ? `${sessionCount}+` : sessionCount;

  return (
    <S.ProjectContainer>
      <S.ProjectHeader className="group">
        {/* Mobile Project Item */}
        <S.MobileProjectWrapper>
          <S.MobileProjectItem
            isSelected={isSelected}
            onClick={() => onToggleProject(project.name)}
            onTouchEnd={handleTouchClick(() => onToggleProject(project.name))}
          >
            <S.MobileProjectContent>
              <S.ProjectInfo>
                <S.ProjectIconWrapper isExpanded={isExpanded} hasActiveSession={hasActiveSession}>
                  {isExpanded ? (
                    <FolderOpen className={cn(
                      "w-4 h-4",
                      hasActiveSession ? "text-green-600 dark:text-green-500" : "text-primary"
                    )} />
                  ) : (
                    <Folder className={cn(
                      "w-4 h-4",
                      hasActiveSession ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
                    )} />
                  )}
                </S.ProjectIconWrapper>
                <S.ProjectDetails>
                  {editingProject === project.name ? (
                    <S.EditInput
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Project name"
                      autoFocus
                      autoComplete="off"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSaveProjectName(project.name);
                        if (e.key === 'Escape') onCancelEditing();
                      }}
                      style={{
                        fontSize: '16px', // Prevents zoom on iOS
                        WebkitAppearance: 'none',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <>
                      <S.ProjectName>{project.displayName}</S.ProjectName>
                      <S.ProjectMeta>
                        {`${displayCount} session${displayCount === 1 ? '' : 's'}`}
                      </S.ProjectMeta>
                    </>
                  )}
                </S.ProjectDetails>
              </S.ProjectInfo>
              <S.ProjectActions>
                {editingProject === project.name ? (
                  <>
                    <S.SaveButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveProjectName(project.name);
                      }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </S.SaveButton>
                    <S.CancelButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelEditing();
                      }}
                    >
                      <X className="w-4 h-4 text-white" />
                    </S.CancelButton>
                  </>
                ) : (
                  <>
                    {sessionCount === 0 && (
                      <S.DeleteButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.name);
                        }}
                        onTouchEnd={handleTouchClick(() => onDeleteProject(project.name))}
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </S.DeleteButton>
                    )}
                    <S.EditButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartEditing(project);
                      }}
                      onTouchEnd={handleTouchClick(() => onStartEditing(project))}
                    >
                      <Edit3 className="w-4 h-4 text-primary" />
                    </S.EditButton>
                    <S.ChevronWrapper>
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      )}
                    </S.ChevronWrapper>
                  </>
                )}
              </S.ProjectActions>
            </S.MobileProjectContent>
          </S.MobileProjectItem>
        </S.MobileProjectWrapper>
        
        {/* Desktop Project Item */}
        <Button
          variant="ghost"
          className={cn(
            "hidden md:flex w-full justify-between p-2 h-auto font-normal hover:bg-accent/50",
            isSelected && "bg-accent text-accent-foreground"
          )}
          onClick={() => {
            if (!isSelected) {
              onProjectSelect(project);
            }
            onToggleProject(project.name);
          }}
          onTouchEnd={handleTouchClick(() => {
            if (!isSelected) {
              onProjectSelect(project);
            }
            onToggleProject(project.name);
          })}
        >
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
                <div>
                  <div className="text-sm font-semibold truncate text-foreground" title={project.displayName}>
                    {project.displayName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {displayCount}
                    {project.fullPath !== project.displayName && (
                      <span className="ml-1 opacity-60" title={project.fullPath}>
                        • {project.fullPath.length > 25 ? '...' + project.fullPath.slice(-22) : project.fullPath}
                      </span>
                    )}
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
                <S.DesktopHoverActions
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditing(project);
                  }}
                  title="Rename project (F2)"
                >
                  <Edit3 className="w-3 h-3" />
                </S.DesktopHoverActions>
                {sessionCount === 0 && (
                  <S.DesktopDeleteAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project.name);
                    }}
                    title="Delete empty project (Delete)"
                  >
                    <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                  </S.DesktopDeleteAction>
                )}
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </>
            )}
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
            onLoadMoreSessions={onLoadMoreSessions}
            setEditingSession={setEditingSession}
            setEditingSessionName={setEditingSessionName}
            handleTouchClick={handleTouchClick}
          />
        </S.SessionsContainer>
      )}
    </S.ProjectContainer>
  );
};