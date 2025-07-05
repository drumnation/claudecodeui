import React from 'react';
import { ProjectList } from '@/features/projects';
import * as S from './Sidebar.styles';

export const Sidebar = ({
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
  return (
    <S.Container>
      <ProjectList
        projects={projects}
        selectedProject={selectedProject}
        selectedSession={selectedSession}
        onProjectSelect={onProjectSelect}
        onSessionSelect={onSessionSelect}
        onNewSession={onNewSession}
        onSessionDelete={onSessionDelete}
        onProjectDelete={onProjectDelete}
        isLoading={isLoading}
        onRefresh={onRefresh}
        onShowSettings={onShowSettings}
      />
    </S.Container>
  );
};