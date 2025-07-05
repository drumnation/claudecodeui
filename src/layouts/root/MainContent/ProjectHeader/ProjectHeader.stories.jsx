/**
 * ProjectHeader.stories.jsx - Storybook stories for ProjectHeader component
 */

import React from 'react';
import { ProjectHeader } from '@/layouts/root/MainContent/ProjectHeader/ProjectHeader';

export default {
  title: 'Layouts/Root/MainContent/ProjectHeader',
  component: ProjectHeader,
};

const mockProject = {
  name: 'test-project',
  displayName: 'Test Project',
  fullPath: '/Users/test/projects/test-project'
};

const mockSession = {
  id: 'session-123',
  summary: 'Building a React app with TypeScript'
};

const Template = (args) => <ProjectHeader {...args} />;

export const Default = Template.bind({});
Default.args = {
  selectedProject: mockProject,
  selectedSession: mockSession,
  activeTab: 'chat',
  onTabChange: (tab) => console.log('Tab changed to:', tab),
  isMobile: false,
  onMenuClick: () => console.log('Menu clicked')
};

export const NewSession = Template.bind({});
NewSession.args = {
  ...Default.args,
  selectedSession: null
};

export const FilesTab = Template.bind({});
FilesTab.args = {
  ...Default.args,
  activeTab: 'files'
};

export const MobileView = Template.bind({});
MobileView.args = {
  ...Default.args,
  isMobile: true
};

export const GitTab = Template.bind({});
GitTab.args = {
  ...Default.args,
  activeTab: 'git'
};