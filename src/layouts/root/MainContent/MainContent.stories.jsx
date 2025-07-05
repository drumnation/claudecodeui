/**
 * MainContent.stories.jsx - Storybook stories for MainContent component
 */

import React from 'react';
import { MainContent } from '@/layouts/root/MainContent/MainContent';

export default {
  title: 'Layouts/Root/MainContent',
  component: MainContent,
  parameters: {
    layout: 'fullscreen',
  },
};

const mockProject = {
  name: 'test-project',
  displayName: 'Test Project',
  fullPath: '/Users/test/projects/test-project',
  path: '/Users/test/projects/test-project'
};

const mockSession = {
  id: 'session-123',
  summary: 'Building a React app with TypeScript',
  timestamp: Date.now()
};

const mockMessages = [];

const Template = (args) => <MainContent {...args} />;

export const Default = Template.bind({});
Default.args = {
  selectedProject: mockProject,
  selectedSession: mockSession,
  activeTab: 'chat',
  setActiveTab: () => {},
  ws: { readyState: WebSocket.OPEN },
  sendMessage: () => {},
  messages: mockMessages,
  isMobile: false,
  onMenuClick: () => {},
  isLoading: false,
  onInputFocusChange: () => {},
  onSessionActive: () => {},
  onSessionInactive: () => {},
  onReplaceTemporarySession: () => {},
  onNavigateToSession: () => {},
  onShowSettings: () => {},
  autoExpandTools: true,
  showRawParameters: false,
  autoScrollToBottom: true
};

export const Loading = Template.bind({});
Loading.args = {
  ...Default.args,
  isLoading: true
};

export const NoProject = Template.bind({});
NoProject.args = {
  ...Default.args,
  selectedProject: null,
  isLoading: false
};

export const MobileView = Template.bind({});
MobileView.args = {
  ...Default.args,
  isMobile: true
};

export const FilesTab = Template.bind({});
FilesTab.args = {
  ...Default.args,
  activeTab: 'files'
};

export const ShellTab = Template.bind({});
ShellTab.args = {
  ...Default.args,
  activeTab: 'shell'
};

export const GitTab = Template.bind({});
GitTab.args = {
  ...Default.args,
  activeTab: 'git'
};

export const PreviewTab = Template.bind({});
PreviewTab.args = {
  ...Default.args,
  activeTab: 'preview'
};