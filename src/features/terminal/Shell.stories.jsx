import React from 'react';
import { Shell } from '@/features/terminal/Shell';

export default {
  title: 'Features/Terminal',
  component: Shell,
  parameters: {
    docs: {
      description: {
        component: 'Interactive terminal shell component that connects to a WebSocket backend to provide real-time command execution in project directories.'
      }
    }
  },
  argTypes: {
    selectedProject: {
      description: 'The currently selected project',
      control: { type: 'object' }
    },
    selectedSession: {
      description: 'The currently selected session',
      control: { type: 'object' }
    },
    isActive: {
      description: 'Whether the shell tab is currently active',
      control: { type: 'boolean' }
    }
  }
};

const mockProject = {
  name: 'my-project',
  displayName: 'My Project',
  path: '/home/user/projects/my-project',
  fullPath: '/home/user/projects/my-project'
};

const mockSession = {
  id: 'session-123',
  summary: 'Implementing authentication flow with JWT tokens',
  timestamp: new Date().toISOString()
};

export const Default = {
  args: {
    selectedProject: mockProject,
    selectedSession: null,
    isActive: true
  }
};

export const WithSession = {
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
    isActive: true
  }
};

export const NoProject = {
  args: {
    selectedProject: null,
    selectedSession: null,
    isActive: true
  }
};

export const Inactive = {
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
    isActive: false
  }
};

export const LongSessionSummary = {
  args: {
    selectedProject: mockProject,
    selectedSession: {
      ...mockSession,
      summary: 'This is a very long session summary that should be truncated in the UI to prevent overflow and maintain clean visual design'
    },
    isActive: true
  }
};