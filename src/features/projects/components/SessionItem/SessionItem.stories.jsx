import React from 'react';
import { SessionItem } from './SessionItem';

export default {
  title: 'Features/Projects/Components/SessionItem',
  component: SessionItem,
  parameters: {
    layout: 'padded',
    docs: {
      autodocs: true,
      description: {
        component: 'SessionItem displays a single session with its information and controls.'
      }
    }
  }
};

const mockProject = {
  name: 'claude-code-ui',
  displayName: 'Claude Code UI'
};

const mockSession = {
  id: 'session-1',
  summary: 'Implementing dark mode toggle',
  lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  messageCount: 12
};

const activeSession = {
  id: 'active-session',
  summary: 'Currently active session',
  lastActivity: new Date().toISOString(),
  messageCount: 3
};

const Template = (args) => (
  <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#f5f5f5', padding: '1rem' }}>
    <SessionItem {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  session: mockSession,
  project: mockProject,
  isSelected: false,
  isEditing: false,
  editingSessionName: '',
  isGeneratingSummary: false,
  currentTime: new Date(),
  formatTimeAgo: () => '5 mins ago',
  onProjectSelect: () => {},
  onSessionSelect: () => {},
  onDeleteSession: () => {},
  onGenerateSessionSummary: () => {},
  onUpdateSessionSummary: () => {},
  setEditingSession: () => {},
  setEditingSessionName: () => {},
  handleTouchClick: (cb) => cb
};

export const Selected = Template.bind({});
Selected.args = {
  ...Default.args,
  isSelected: true
};

export const Active = Template.bind({});
Active.args = {
  ...Default.args,
  session: activeSession,
  formatTimeAgo: () => 'Just now'
};

export const ActiveAndSelected = Template.bind({});
ActiveAndSelected.args = {
  ...Default.args,
  session: activeSession,
  isSelected: true,
  formatTimeAgo: () => 'Just now'
};

export const Editing = Template.bind({});
Editing.args = {
  ...Default.args,
  isEditing: true,
  editingSessionName: 'Renamed Session'
};

export const GeneratingSummary = Template.bind({});
GeneratingSummary.args = {
  ...Default.args,
  isGeneratingSummary: true
};

export const NoSummary = Template.bind({});
NoSummary.args = {
  ...Default.args,
  session: {
    ...mockSession,
    summary: null
  }
};

export const NoMessages = Template.bind({});
NoMessages.args = {
  ...Default.args,
  session: {
    ...mockSession,
    messageCount: 0
  }
};

export const LongSummary = Template.bind({});
LongSummary.args = {
  ...Default.args,
  session: {
    ...mockSession,
    summary: 'This is a very long session summary that should be truncated properly in the UI to prevent layout issues'
  }
};

export const MobileView = Template.bind({});
MobileView.args = {
  ...Default.args
};
MobileView.parameters = {
  viewport: {
    defaultViewport: 'iphone12'
  }
};