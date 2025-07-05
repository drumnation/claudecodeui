import React from 'react';
import { ProjectItem } from './ProjectItem';

export default {
  title: 'Features/Projects/Components/ProjectItem',
  component: ProjectItem,
  parameters: {
    layout: 'padded',
    docs: {
      autodocs: true,
      description: {
        component: 'ProjectItem displays a single project with its sessions and management controls.'
      }
    }
  },
  argTypes: {
    project: {
      description: 'Project object containing name, sessions, and metadata'
    },
    isExpanded: {
      description: 'Whether the project folder is expanded',
      control: 'boolean'
    },
    isSelected: {
      description: 'Whether the project is currently selected',
      control: 'boolean'
    },
    hasActiveSession: {
      description: 'Whether the project has an active session (within 10 minutes)',
      control: 'boolean'
    },
    editingProject: {
      description: 'Name of the project being edited (null if none)'
    },
    editingName: {
      description: 'Current value of the edit input',
      control: 'text'
    },
    onToggleProject: {
      description: 'Callback when project is expanded/collapsed',
      action: 'toggleProject'
    },
    onProjectSelect: {
      description: 'Callback when project is selected',
      action: 'selectProject'
    },
    onStartEditing: {
      description: 'Callback to start editing project name',
      action: 'startEditing'
    },
    onCancelEditing: {
      description: 'Callback to cancel editing',
      action: 'cancelEditing'
    },
    onSaveProjectName: {
      description: 'Callback to save project name',
      action: 'saveProjectName'
    },
    onDeleteProject: {
      description: 'Callback to delete project',
      action: 'deleteProject'
    }
  }
};

const mockProject = {
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
};

const mockEmptyProject = {
  name: 'empty-project',
  displayName: 'Empty Project',
  fullPath: '/Users/developer/projects/empty',
  sessions: [],
  sessionMeta: {
    hasMore: false,
    total: 0
  }
};

const Template = (args) => (
  <div style={{ width: '100%', maxWidth: '400px' }}>
    <ProjectItem {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  project: mockProject,
  isExpanded: false,
  isSelected: false,
  hasActiveSession: false,
  editingProject: null,
  editingName: '',
  initialSessionsLoaded: new Set(['claude-code-ui']),
  additionalSessions: {},
  loadingSessions: {},
  currentTime: new Date(),
  getAllSessions: (project) => project.sessions || [],
  formatTimeAgo: (date) => '5 mins ago',
  setEditingName: () => {},
  setEditingSession: () => {},
  setEditingSessionName: () => {},
  handleTouchClick: (cb) => cb
};

export const Expanded = Template.bind({});
Expanded.args = {
  ...Default.args,
  isExpanded: true
};

export const Selected = Template.bind({});
Selected.args = {
  ...Default.args,
  isSelected: true,
  isExpanded: true
};

export const WithActiveSession = Template.bind({});
WithActiveSession.args = {
  ...Default.args,
  hasActiveSession: true,
  project: {
    ...mockProject,
    sessions: [
      {
        id: 'active-session',
        summary: 'Currently active session',
        lastActivity: new Date().toISOString(),
        messageCount: 3
      },
      ...mockProject.sessions
    ]
  }
};

export const EmptyProject = Template.bind({});
EmptyProject.args = {
  ...Default.args,
  project: mockEmptyProject,
  isExpanded: true
};

export const Editing = Template.bind({});
Editing.args = {
  ...Default.args,
  editingProject: 'claude-code-ui',
  editingName: 'Claude Code UI - Renamed'
};

export const Loading = Template.bind({});
Loading.args = {
  ...Default.args,
  isExpanded: true,
  initialSessionsLoaded: new Set(),
  loadingSessions: { 'claude-code-ui': true }
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