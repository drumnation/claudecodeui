import React from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Check, 
  X
} from 'lucide-react';
import { SessionList } from '../SessionList';
import * as S from './ProjectItem.styles';
import { WorktreeBadge, ProjectLanguageBadge } from '@/components/WorktreeBadge/WorktreeBadge';

export const ProjectItemMobile = ({
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
  setEditingName,
  setEditingSession,
  setEditingSessionName,
  handleTouchClick
}) => {
  const sessions = getAllSessions(project);
  const sessionCount = project.sessionMeta?.total || sessions.length;
  const hasMore = sessionCount > sessions.length;
  const displayCount = hasMore && sessionCount >= 5 ? `${sessionCount}+` : sessionCount;

  return (
    <S.ProjectContainer>
      <S.ProjectHeader>
        <S.MobileProjectItem
          isSelected={isSelected}
          onClick={() => onToggleProject(project.name)}
          onTouchEnd={handleTouchClick(() => onToggleProject(project.name))}
          style={{ position: 'relative' }}
        >
          <S.MobileProjectContent>
            <S.ProjectInfo>
              <S.ProjectIconWrapper isExpanded={isExpanded} hasActiveSession={hasActiveSession}>
                {isExpanded ? (
                  <FolderOpen className={`w-4 h-4 ${hasActiveSession ? 'text-green-600 dark:text-green-500' : 'text-primary'}`} />
                ) : (
                  <Folder className={`w-4 h-4 ${hasActiveSession ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`} />
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
                      <span>{`${displayCount} session${displayCount === 1 ? '' : 's'}`}</span>
                      <ProjectLanguageBadge language={project.language} />
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
          {project.isWorktree && <WorktreeBadge isMobile={true} />}
        </S.MobileProjectItem>
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
    </S.ProjectContainer>
  );
};