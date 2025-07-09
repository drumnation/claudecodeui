import React, {useState} from 'react';
import {
  Folder,
  FolderOpen,
  Edit3,
  Trash2,
  Check,
  X,
  MoreVertical,
  GitBranch,
  Brain,
} from 'lucide-react';
import {SessionList} from '../SessionList';
import * as S from './ProjectItem.styles';
import {
  WorktreeBadge,
  ProjectLanguageBadge,
  ProjectMonorepoBadge,
} from '@/components/WorktreeBadge/WorktreeBadge';
import {GitBranchBadge} from '@/features/projects/components/GitBranchBadge';
import {ProjectActionMenuProps, ProjectItemProps} from './ProjectItem.types';

// Component for mobile action menu modal
const ProjectActionMenu = ({
  isOpen,
  onClose,
  project,
  sessionCount,
  onStartEditing,
  onDeleteProject,
  onCreateWorktree,
  onRemoveWorktree,
  onPlanFeature,
}: ProjectActionMenuProps) => {
  if (!isOpen) return null;

  return (
    <S.MobileActionOverlay onClick={onClose}>
      <S.MobileActionModal onClick={(e) => e.stopPropagation()}>
        <S.MobileActionHeader>
          <S.MobileActionTitle>Project Actions</S.MobileActionTitle>
          <S.MobileActionCloseButton onClick={onClose}>
            <X className="w-4 h-4" />
          </S.MobileActionCloseButton>
        </S.MobileActionHeader>

        <S.MobileActionList>
          <S.MobileActionButton
            onClick={() => {
              onStartEditing(project);
              onClose();
            }}
          >
            <Edit3 className="w-5 h-5" />
            <span>Edit Project Name</span>
          </S.MobileActionButton>

          <S.MobileActionButton
            onClick={() => {
              onPlanFeature(project);
              onClose();
            }}
          >
            <Brain className="w-5 h-5" />
            <span>Plan Feature</span>
          </S.MobileActionButton>

          {!project.isWorktree && (
            <S.MobileActionButton
              onClick={() => {
                onCreateWorktree(project);
                onClose();
              }}
            >
              <GitBranch className="w-5 h-5" />
              <span>Create Worktree</span>
            </S.MobileActionButton>
          )}

          {project.isWorktree && (
            <S.MobileActionButton
              onClick={() => {
                onRemoveWorktree(project);
                onClose();
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
              <span>Remove Worktree</span>
            </S.MobileActionButton>
          )}

          {sessionCount === 0 && !project.isWorktree && (
            <S.MobileActionButton
              onClick={() => {
                onDeleteProject(project.name);
                onClose();
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Empty Project</span>
            </S.MobileActionButton>
          )}
        </S.MobileActionList>
      </S.MobileActionModal>
    </S.MobileActionOverlay>
  );
};

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
  onCreateWorktree,
  onRemoveWorktree,
  onPlanFeature,
  setEditingName,
  setEditingSession,
  setEditingSessionName,
  handleTouchClick,
}: ProjectItemProps) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const sessions = getAllSessions(project);
  const sessionCount = project.sessionMeta?.total || sessions.length;
  const hasMore = sessionCount > sessions.length;
  const displayCount =
    hasMore && sessionCount >= 5 ? `${sessionCount}+` : sessionCount;

  return (
    <S.ProjectContainer>
      <S.ProjectHeader>
        <S.MobileProjectItem
          isSelected={isSelected}
          onClick={() => onToggleProject(project.name)}
          onTouchEnd={handleTouchClick(() => onToggleProject(project.name))}
          style={{position: 'relative'}}
        >
          <S.MobileProjectContent>
            <S.ProjectInfo>
              <S.ProjectIconWrapper
                isExpanded={isExpanded}
                hasActiveSession={hasActiveSession}
              >
                {isExpanded ? (
                  <FolderOpen
                    className={`w-4 h-4 ${hasActiveSession ? 'text-green-600 dark:text-green-500' : 'text-primary'}`}
                  />
                ) : (
                  <Folder
                    className={`w-4 h-4 ${hasActiveSession ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}
                  />
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
                      borderRadius: '8px',
                    }}
                  />
                ) : (
                  <>
                    <S.ProjectName>{project.displayName}</S.ProjectName>
                    <S.ProjectMeta
                      style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '10px',
                        marginTop: '14px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>{`${displayCount} session${displayCount === 1 ? '' : 's'}`}</span>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexWrap: 'wrap',
                          }}
                        >
                          {project.isWorktree && (
                            <WorktreeBadge isMobile={true} />
                          )}
                          <ProjectLanguageBadge language={project.language} />
                          {project.isMonorepo && (
                            <ProjectMonorepoBadge
                              isMonorepo={project.isMonorepo}
                            />
                          )}
                        </div>
                      </div>
                      {project.gitBranch && (
                        <div style={{marginTop: '6px'}}>
                          <GitBranchBadge
                            branch={project.gitBranch}
                            gitStatus={project.gitStatus}
                          />
                        </div>
                      )}
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
                    onTouchEnd={handleTouchClick((e) => {
                      e.stopPropagation();
                      onSaveProjectName(project.name);
                    })}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </S.SaveButton>
                  <S.CancelButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelEditing();
                    }}
                    onTouchEnd={handleTouchClick((e) => {
                      e.stopPropagation();
                      onCancelEditing();
                    })}
                  >
                    <X className="w-4 h-4 text-white" />
                  </S.CancelButton>
                </>
              ) : (
                <>
                  <S.MenuButton
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowActionMenu(true);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowActionMenu(true);
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </S.MenuButton>
                </>
              )}
            </S.ProjectActions>
          </S.MobileProjectContent>
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

      {/* Action Menu Modal */}
      <ProjectActionMenu
        isOpen={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        project={project}
        sessionCount={sessionCount}
        onStartEditing={onStartEditing}
        onDeleteProject={onDeleteProject}
        onCreateWorktree={onCreateWorktree}
        onRemoveWorktree={onRemoveWorktree}
        onPlanFeature={onPlanFeature}
      />
    </S.ProjectContainer>
  );
};
