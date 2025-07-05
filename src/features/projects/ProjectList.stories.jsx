import React from 'react';
import { ProjectList } from './ProjectList';

export default {
  title: 'Features/Projects',
  component: ProjectList,
  parameters: {
    layout: 'fullscreen',
    docs: {
      autodocs: true,
      description: {
        component: 'The ProjectList component displays all projects and their sessions with management capabilities.'
      }
    }
  },
  argTypes: {
    projects: {
      description: 'Array of project objects with sessions',
    },
    selectedProject: {
      description: 'Currently selected project',
    },
    selectedSession: {
      description: 'Currently selected session',
    },
    isLoading: {
      description: 'Loading state for projects',
      control: 'boolean'
    },
    onProjectSelect: {
      description: 'Callback when a project is selected',
      action: 'projectSelected'
    },
    onSessionSelect: {
      description: 'Callback when a session is selected',
      action: 'sessionSelected'
    },
    onNewSession: {
      description: 'Callback to create a new session',
      action: 'newSession'
    },
    onSessionDelete: {
      description: 'Callback when a session is deleted',
      action: 'sessionDeleted'
    },
    onProjectDelete: {
      description: 'Callback when a project is deleted',
      action: 'projectDeleted'
    },
    onRefresh: {
      description: 'Callback to refresh projects',
      action: 'refresh'
    },
    onShowSettings: {
      description: 'Callback to show settings',
      action: 'showSettings'
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
  },
  {
    name: 'empty-project',
    displayName: 'Empty Project',
    fullPath: '/Users/developer/projects/empty',
    sessions: [],
    sessionMeta: {
      hasMore: false,
      total: 0
    }
  }
];

export const Default = {
  args: {
    projects: mockProjects,
    selectedProject: mockProjects[0],
    selectedSession: mockProjects[0].sessions[0],
    isLoading: false
  }
};

export const Loading = {
  args: {
    projects: [],
    selectedProject: null,
    selectedSession: null,
    isLoading: true
  }
};

export const Empty = {
  args: {
    projects: [],
    selectedProject: null,
    selectedSession: null,
    isLoading: false
  }
};

export const WithActiveSession = {
  args: {
    projects: [
      {
        ...mockProjects[0],
        sessions: [
          {
            id: 'active-session',
            summary: 'Currently working on feature',
            lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            messageCount: 5
          },
          ...mockProjects[0].sessions
        ]
      },
      ...mockProjects.slice(1)
    ],
    selectedProject: mockProjects[0],
    selectedSession: null,
    isLoading: false
  }
};

export const MobileView = {
  args: {
    projects: mockProjects,
    selectedProject: null,
    selectedSession: null,
    isLoading: false
  },
  parameters: {
    viewport: {
      defaultViewport: 'iphone12'
    }
  }
};