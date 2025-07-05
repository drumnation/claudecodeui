import React from 'react';
import { useProjectList } from './ProjectList.hook';
import { formatTimeAgo } from './ProjectList.logic';
import { ScrollArea } from '@/shared-components/ScrollArea/ScrollArea';
import { Button } from '@/shared-components/Button/Button';
import { ClaudeLogo } from '@/shared-components/ClaudeLogo/ClaudeLogo';
import { NewProjectModal } from './components/NewProjectModal';
import { ProjectItem } from './components/ProjectItem';
import { 
  Folder, 
  RefreshCw, 
  FolderPlus, 
  Settings 
} from 'lucide-react';
import * as S from './ProjectList.styles';

export const ProjectList = ({
  projects,
  selectedProject,
  selectedSession,
  onProjectSelect,
  onSessionSelect,
  onNewSession,
  onSessionDelete,
  onProjectDelete,
  isLoading,
  onRefresh,
  onShowSettings
}) => {
  const {
    expandedProjects,
    editingProject,
    showNewProject,
    editingName,
    newProjectPath,
    creatingProject,
    loadingSessions,
    additionalSessions,
    initialSessionsLoaded,
    currentTime,
    isRefreshing,
    editingSession,
    editingSessionName,
    generatingSummary,
    setEditingName,
    setNewProjectPath,
    setShowNewProject,
    setEditingSession,
    setEditingSessionName,
    handleTouchClick,
    toggleProject,
    startEditing,
    cancelEditing,
    saveProjectName,
    deleteSession,
    generateSessionSummary,
    updateSessionSummary,
    deleteProject,
    createNewProject,
    cancelNewProject,
    loadMoreSessions,
    getAllSessions,
    hasActiveSessions,
    handleRefresh
  } = useProjectList({
    projects,
    selectedProject,
    selectedSession,
    onProjectSelect,
    onSessionSelect,
    onNewSession,
    onSessionDelete,
    onProjectDelete,
    isLoading,
    onRefresh,
    onShowSettings
  });

  return (
    <S.Container>
      <S.Header>
        <S.DesktopHeader>
          <S.LogoSection>
            <S.LogoWrapper>
              <ClaudeLogo className="w-5 h-5" />
            </S.LogoWrapper>
            <S.TitleWrapper>
              <S.Title>Claude Code UI</S.Title>
            </S.TitleWrapper>
          </S.LogoSection>
          <S.ActionButtons>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 px-0 hover:bg-accent transition-colors duration-200 group"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh projects and sessions (Ctrl+R)"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} hover:rotate-180 transition-transform duration-300`} />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-9 w-9 px-0 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => setShowNewProject(true)}
              title="Create new project (Ctrl+N)"
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
          </S.ActionButtons>
        </S.DesktopHeader>
        
        <S.MobileHeader>
          <S.LogoSection>
            <S.LogoWrapper>
              <ClaudeLogo className="w-5 h-5" />
            </S.LogoWrapper>
            <S.TitleWrapper>
              <S.MobileTitle>Claude Code UI</S.MobileTitle>
              <S.MobileSubtitle>Projects</S.MobileSubtitle>
            </S.TitleWrapper>
          </S.LogoSection>
          <S.ActionButtons>
            <S.RefreshButton
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 text-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            </S.RefreshButton>
            <S.NewProjectButton
              onClick={() => setShowNewProject(true)}
            >
              <FolderPlus className="w-4 h-4" />
            </S.NewProjectButton>
          </S.ActionButtons>
        </S.MobileHeader>
      </S.Header>
      
      {showNewProject && (
        <NewProjectModal
          newProjectPath={newProjectPath}
          setNewProjectPath={setNewProjectPath}
          creatingProject={creatingProject}
          onCreateProject={createNewProject}
          onCancel={cancelNewProject}
        />
      )}
      
      <ScrollArea className="flex-1 md:px-2 md:py-3">
        <S.ProjectsList>
          {isLoading ? (
            <S.LoadingState>
              <S.LoadingIcon>
                <S.Spinner />
              </S.LoadingIcon>
              <S.LoadingTitle>Loading projects...</S.LoadingTitle>
              <S.LoadingText>
                Fetching your Claude projects and sessions
              </S.LoadingText>
            </S.LoadingState>
          ) : projects.length === 0 ? (
            <S.EmptyState>
              <S.EmptyIcon>
                <Folder className="w-6 h-6 text-muted-foreground" />
              </S.EmptyIcon>
              <S.EmptyTitle>No projects found</S.EmptyTitle>
              <S.EmptyText>
                Run Claude CLI in a project directory to get started
              </S.EmptyText>
            </S.EmptyState>
          ) : (
            projects.map((project) => (
              <ProjectItem
                key={project.name}
                project={project}
                isExpanded={expandedProjects.has(project.name)}
                isSelected={selectedProject?.name === project.name}
                selectedSession={selectedSession}
                hasActiveSession={hasActiveSessions(project)}
                editingProject={editingProject}
                editingName={editingName}
                editingSession={editingSession}
                editingSessionName={editingSessionName}
                generatingSummary={generatingSummary}
                loadingSessions={loadingSessions}
                additionalSessions={additionalSessions}
                initialSessionsLoaded={initialSessionsLoaded}
                currentTime={currentTime}
                getAllSessions={getAllSessions}
                formatTimeAgo={formatTimeAgo}
                onToggleProject={toggleProject}
                onProjectSelect={onProjectSelect}
                onSessionSelect={onSessionSelect}
                onNewSession={onNewSession}
                onStartEditing={startEditing}
                onCancelEditing={cancelEditing}
                onSaveProjectName={saveProjectName}
                onDeleteProject={deleteProject}
                onDeleteSession={deleteSession}
                onGenerateSessionSummary={generateSessionSummary}
                onUpdateSessionSummary={updateSessionSummary}
                onLoadMoreSessions={loadMoreSessions}
                setEditingName={setEditingName}
                setEditingSession={setEditingSession}
                setEditingSessionName={setEditingSessionName}
                handleTouchClick={handleTouchClick}
              />
            ))
          )}
        </S.ProjectsList>
      </ScrollArea>
      
      <S.SettingsSection>
        <S.MobileSettings>
          <S.MobileSettingsButton onClick={onShowSettings}>
            <S.MobileSettingsIcon>
              <Settings className="w-5 h-5 text-muted-foreground" />
            </S.MobileSettingsIcon>
            <S.MobileSettingsText>Settings</S.MobileSettingsText>
          </S.MobileSettingsButton>
        </S.MobileSettings>
        
        <Button
          variant="ghost"
          className="hidden md:flex w-full justify-start gap-2 p-2 h-auto font-normal text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
          onClick={onShowSettings}
        >
          <Settings className="w-3 h-3" />
          <span className="text-xs">Tools Settings</span>
        </Button>
      </S.SettingsSection>
    </S.Container>
  );
};