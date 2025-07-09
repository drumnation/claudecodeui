import React from 'react';
import {SessionList} from './SessionList';

export default {
  title: 'Features/Projects/components/Web/SessionList',
  component: SessionList,
  parameters: {
    layout: 'padded',
    viewport: {
      defaultViewport: 'responsive',
    },
    docs: {
      autodocs: true,
      description: {
        component:
          'Web version of SessionList displays all sessions for a project with management capabilities.',
      },
    },
  },
};

const mockProject = {
  name: 'claude-code-ui',
  displayName: 'Claude Code UI',
  fullPath: '/Users/developer/projects/claude-code-ui',
};

const mockSessions = [
  {
    id: 'session-1',
    summary: 'Implementing dark mode toggle',
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    messageCount: 12,
  },
  {
    id: 'session-2',
    summary: 'Bug fix: Memory leak in message renderer',
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messageCount: 8,
  },
  {
    id: 'session-3',
    summary: 'Adding unit tests for chat interface',
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    messageCount: 15,
  },
];

const Template = (args: any) => (
  <div
    style={{
      width: '100%',
      maxWidth: '600px',
      backgroundColor: '#f5f5f5',
      padding: '1rem',
    }}
  >
    <SessionList {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  project: mockProject,
  sessions: mockSessions,
  selectedSession: null,
  editingSession: null,
  editingSessionName: '',
  generatingSummary: {},
  loadingSessions: {},
  initialSessionsLoaded: new Set(['claude-code-ui']),
  currentTime: new Date(),
  formatTimeAgo: (date: any) => '5 mins ago',
  hasMore: true,
  onProjectSelect: () => {},
  onSessionSelect: () => {},
  onNewSession: () => {},
  onDeleteSession: () => {},
  onGenerateSessionSummary: () => {},
  onUpdateSessionSummary: () => {},
  onLoadMoreSessions: () => {},
  setEditingSession: () => {},
  setEditingSessionName: () => {},
  handleTouchClick: (cb: any) => cb,
};

export const Loading = Template.bind({});
Loading.args = {
  ...Default.args,
  initialSessionsLoaded: new Set(),
  sessions: [],
};

export const Empty = Template.bind({});
Empty.args = {
  ...Default.args,
  sessions: [],
  hasMore: false,
};

export const WithSelectedSession = Template.bind({});
WithSelectedSession.args = {
  ...Default.args,
  selectedSession: mockSessions[0],
};

export const LoadingMore = Template.bind({});
LoadingMore.args = {
  ...Default.args,
  loadingSessions: {'claude-code-ui': true},
};

export const NoMoreSessions = Template.bind({});
NoMoreSessions.args = {
  ...Default.args,
  hasMore: false,
};
