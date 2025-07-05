import React from 'react';
import { Sidebar } from './Sidebar';

export default {
  title: 'Layouts/Root/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Sidebar is a layout component that renders the ProjectList feature.'
      }
    }
  }
};

const mockProjects = [
  {
    name: 'claude-code-ui',
    displayName: 'Claude Code UI',
    fullPath: '/Users/developer/projects/claude-code-ui',
    sessions: [
      {
        id: 'session-1',
        summary: 'Implementing dark mode toggle',
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        messageCount: 12
      },
      {
        id: 'session-2',
        summary: 'Bug fix: Memory leak in message renderer',
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        messageCount: 8
      }
    ],
    sessionMeta: {
      hasMore: true,
      total: 5
    }
  },
  {
    name: 'my-api',
    displayName: 'My API Service',
    fullPath: '/Users/developer/projects/my-api',
    sessions: [
      {
        id: 'session-3',
        summary: 'Add authentication middleware',
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        messageCount: 15
      }
    ],
    sessionMeta: {
      hasMore: false,
      total: 1
    }
  }
];

export const Default = {
  args: {
    projects: mockProjects,
    selectedProject: mockProjects[0],
    selectedSession: mockProjects[0].sessions[0],
    isLoading: false,
    onProjectSelect: () => {},
    onSessionSelect: () => {},
    onNewSession: () => {},
    onSessionDelete: () => {},
    onProjectDelete: () => {},
    onRefresh: () => {},
    onShowSettings: () => {}
  }
};

export const Loading = {
  args: {
    ...Default.args,
    projects: [],
    selectedProject: null,
    selectedSession: null,
    isLoading: true
  }
};

export const Empty = {
  args: {
    ...Default.args,
    projects: [],
    selectedProject: null,
    selectedSession: null,
    isLoading: false
  }
};