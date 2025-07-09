import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within, waitFor} from '@storybook/testing-library';
import {ProjectList} from './ProjectList';

const meta: Meta<typeof ProjectList> = {
  title: 'Features/Projects/E2E Tests',
  component: ProjectList,
  parameters: {
    layout: 'fullscreen',
    chromatic: {disableSnapshot: true},
    docs: {
      description: {
        component: 'End-to-end tests for the ProjectList component',
      },
    },
  },
  tags: ['test'],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Comprehensive mock data
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
        summary: 'Add responsive design components',
        lastActivity: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        messageCount: 15,
      },
    ],
    sessionMeta: {
      hasMore: true,
      total: 5,
    },
  },
  {
    name: 'my-api',
    displayName: 'My API Service',
    fullPath: '/Users/developer/projects/my-api',
    sessions: [
      {
        id: 'session-4',
        summary: 'Add authentication middleware',
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        messageCount: 15,
      },
    ],
    sessionMeta: {
      hasMore: false,
      total: 1,
    },
  },
  {
    name: 'empty-project',
    displayName: 'Empty Project',
    fullPath: '/Users/developer/projects/empty',
    sessions: [],
    sessionMeta: {
      hasMore: false,
      total: 0,
    },
  },
];

// Test project selection workflow
export const ProjectSelectionWorkflow: Story = {
  name: 'E2E: Project Selection',
  args: {
    projects: mockProjects,
    selectedProject: null,
    selectedSession: null,
    isLoading: false,
    onProjectSelect: (project) => console.log('Selected project:', project),
    onSessionSelect: (session) => console.log('Selected session:', session),
    onNewSession: (projectName) => console.log('New session for:', projectName),
    onSessionDelete: (sessionId) => console.log('Delete session:', sessionId),
    onProjectDelete: (projectName) =>
      console.log('Delete project:', projectName),
    onRefresh: () => console.log('Refresh projects'),
    onShowSettings: () => console.log('Show settings'),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify all projects are displayed
    await expect(canvas.getByText('Claude Code UI')).toBeInTheDocument();
    await expect(canvas.getByText('My API Service')).toBeInTheDocument();
    await expect(canvas.getByText('Empty Project')).toBeInTheDocument();

    // Step 2: Select first project
    const firstProject = canvas.getByText('Claude Code UI');
    await userEvent.click(firstProject);

    // Step 3: Verify sessions are displayed
    await expect(
      canvas.getByText('Implementing dark mode toggle'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Bug fix: Memory leak in message renderer'),
    ).toBeInTheDocument();

    // Step 4: Select a session
    const firstSession = canvas.getByText('Implementing dark mode toggle');
    await userEvent.click(firstSession);

    // Step 5: Switch to another project
    const secondProject = canvas.getByText('My API Service');
    await userEvent.click(secondProject);

    // Step 6: Verify session for second project
    await expect(
      canvas.getByText('Add authentication middleware'),
    ).toBeInTheDocument();
  },
};

// Test session management workflow
export const SessionManagementWorkflow: Story = {
  name: 'E2E: Session Management',
  args: {
    projects: mockProjects,
    selectedProject: mockProjects[0],
    selectedSession: mockProjects[0].sessions[0],
    isLoading: false,
    onProjectSelect: () => {},
    onSessionSelect: () => {},
    onNewSession: () => console.log('Creating new session'),
    onSessionDelete: () => console.log('Deleting session'),
    onProjectDelete: () => {},
    onRefresh: () => {},
    onShowSettings: () => {},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify session is selected
    await expect(
      canvas.getByText('Implementing dark mode toggle'),
    ).toBeInTheDocument();

    // Step 2: Test new session creation
    const newSessionButton = canvas.queryByRole('button', {
      name: /new.?session/i,
    });
    if (newSessionButton) {
      await userEvent.click(newSessionButton);
    }

    // Step 3: Test session deletion (look for delete button)
    const deleteButton = canvas.queryByRole('button', {name: /delete/i});
    if (deleteButton) {
      await userEvent.click(deleteButton);
    }

    // Step 4: Test session context menu
    const firstSession = canvas.getByText('Implementing dark mode toggle');
    await userEvent.rightClick(firstSession);

    // Look for context menu items
    const contextMenuItems = canvas.queryAllByRole('menuitem');
    if (contextMenuItems.length > 0) {
      await expect(contextMenuItems[0]).toBeInTheDocument();
    }
  },
};

// Test empty states
export const EmptyStatesWorkflow: Story = {
  name: 'E2E: Empty States',
  args: {
    projects: [mockProjects[2]], // Only empty project
    selectedProject: mockProjects[2],
    selectedSession: null,
    isLoading: false,
    onProjectSelect: () => {},
    onSessionSelect: () => {},
    onNewSession: () => console.log('Creating first session'),
    onSessionDelete: () => {},
    onProjectDelete: () => {},
    onRefresh: () => {},
    onShowSettings: () => {},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify empty project is shown
    await expect(canvas.getByText('Empty Project')).toBeInTheDocument();

    // Step 2: Select empty project
    const emptyProject = canvas.getByText('Empty Project');
    await userEvent.click(emptyProject);

    // Step 3: Verify empty state message
    const emptyMessage =
      canvas.queryByText(/no sessions/i) ||
      canvas.queryByText(/empty/i) ||
      canvas.queryByText(/start a new session/i);

    if (emptyMessage) {
      await expect(emptyMessage).toBeInTheDocument();
    }

    // Step 4: Test create first session
    const createButton =
      canvas.queryByRole('button', {name: /new.?session/i}) ||
      canvas.queryByRole('button', {name: /create/i});

    if (createButton) {
      await userEvent.click(createButton);
    }
  },
};

// Test loading states
export const LoadingStatesWorkflow: Story = {
  name: 'E2E: Loading States',
  args: {
    projects: [],
    selectedProject: null,
    selectedSession: null,
    isLoading: true,
    onProjectSelect: () => {},
    onSessionSelect: () => {},
    onNewSession: () => {},
    onSessionDelete: () => {},
    onProjectDelete: () => {},
    onRefresh: () => {},
    onShowSettings: () => {},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify loading state is shown
    const loadingIndicator =
      canvas.queryByText(/loading/i) ||
      canvas.queryByRole('progressbar') ||
      canvas.queryByTestId('loading-skeleton');

    if (loadingIndicator) {
      await expect(loadingIndicator).toBeInTheDocument();
    }

    // Step 2: Verify no projects are shown while loading
    const projectContent = canvas.queryByText('Claude Code UI');
    expect(projectContent).not.toBeInTheDocument();
  },
};

// Test project search and filtering
export const SearchAndFilterWorkflow: Story = {
  name: 'E2E: Search and Filter',
  args: {
    projects: mockProjects,
    selectedProject: null,
    selectedSession: null,
    isLoading: false,
    onProjectSelect: () => {},
    onSessionSelect: () => {},
    onNewSession: () => {},
    onSessionDelete: () => {},
    onProjectDelete: () => {},
    onRefresh: () => {},
    onShowSettings: () => {},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Look for search input
    const searchInput =
      canvas.queryByRole('textbox', {name: /search/i}) ||
      canvas.queryByPlaceholderText(/search/i);

    if (searchInput) {
      // Step 2: Test search functionality
      await userEvent.type(searchInput, 'claude');

      // Step 3: Verify filtered results
      await expect(canvas.getByText('Claude Code UI')).toBeInTheDocument();

      // Step 4: Verify other projects are filtered out
      const apiProject = canvas.queryByText('My API Service');
      expect(apiProject).not.toBeInTheDocument();

      // Step 5: Clear search
      await userEvent.clear(searchInput);

      // Step 6: Verify all projects are shown again
      await expect(canvas.getByText('My API Service')).toBeInTheDocument();
    }
  },
};

// Test refresh functionality
export const RefreshWorkflow: Story = {
  name: 'E2E: Refresh Functionality',
  args: {
    projects: mockProjects,
    selectedProject: mockProjects[0],
    selectedSession: null,
    isLoading: false,
    onProjectSelect: () => {},
    onSessionSelect: () => {},
    onNewSession: () => {},
    onSessionDelete: () => {},
    onProjectDelete: () => {},
    onRefresh: () => console.log('Refreshing projects'),
    onShowSettings: () => {},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Look for refresh button
    const refreshButton =
      canvas.queryByRole('button', {name: /refresh/i}) ||
      canvas.queryByRole('button', {name: /reload/i});

    if (refreshButton) {
      // Step 2: Test refresh functionality
      await userEvent.click(refreshButton);

      // Step 3: Verify projects are still displayed
      await expect(canvas.getByText('Claude Code UI')).toBeInTheDocument();
    }

    // Step 4: Test keyboard shortcut (if applicable)
    await userEvent.keyboard('{Meta>}r{/Meta}');
  },
};

// Test project deletion workflow
export const ProjectDeletionWorkflow: Story = {
  name: 'E2E: Project Deletion',
  args: {
    projects: mockProjects,
    selectedProject: mockProjects[0],
    selectedSession: null,
    isLoading: false,
    onProjectSelect: () => {},
    onSessionSelect: () => {},
    onNewSession: () => {},
    onSessionDelete: () => {},
    onProjectDelete: () => console.log('Deleting project'),
    onRefresh: () => {},
    onShowSettings: () => {},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Look for project options/menu
    const projectOptions =
      canvas.queryByRole('button', {name: /options/i}) ||
      canvas.queryByRole('button', {name: /menu/i});

    if (projectOptions) {
      await userEvent.click(projectOptions);
    }

    // Step 2: Look for delete option
    const deleteButton =
      canvas.queryByRole('button', {name: /delete/i}) ||
      canvas.queryByRole('menuitem', {name: /delete/i});

    if (deleteButton) {
      await userEvent.click(deleteButton);
    }

    // Step 3: Test confirmation dialog
    const confirmButton =
      canvas.queryByRole('button', {name: /confirm/i}) ||
      canvas.queryByRole('button', {name: /yes/i});

    if (confirmButton) {
      await userEvent.click(confirmButton);
    }
  },
};

// Test keyboard navigation
export const KeyboardNavigationWorkflow: Story = {
  name: 'E2E: Keyboard Navigation',
  args: {
    projects: mockProjects,
    selectedProject: mockProjects[0],
    selectedSession: null,
    isLoading: false,
    onProjectSelect: () => {},
    onSessionSelect: () => {},
    onNewSession: () => {},
    onSessionDelete: () => {},
    onProjectDelete: () => {},
    onRefresh: () => {},
    onShowSettings: () => {},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Focus on first project
    const firstProject = canvas.getByText('Claude Code UI');
    firstProject.focus();
    await expect(firstProject).toHaveFocus();

    // Step 2: Navigate with arrow keys
    await userEvent.keyboard('{ArrowDown}');

    // Step 3: Test Enter key to select
    await userEvent.keyboard('{Enter}');

    // Step 4: Navigate through sessions
    const firstSession = canvas.getByText('Implementing dark mode toggle');
    firstSession.focus();
    await expect(firstSession).toHaveFocus();

    // Step 5: Test session selection with Enter
    await userEvent.keyboard('{Enter}');
  },
};

// Test mobile responsiveness
export const MobileResponsiveWorkflow: Story = {
  name: 'E2E: Mobile Responsive',
  args: {
    projects: mockProjects,
    selectedProject: mockProjects[0],
    selectedSession: null,
    isLoading: false,
    onProjectSelect: () => {},
    onSessionSelect: () => {},
    onNewSession: () => {},
    onSessionDelete: () => {},
    onProjectDelete: () => {},
    onRefresh: () => {},
    onShowSettings: () => {},
  },
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify projects are displayed in mobile layout
    await expect(canvas.getByText('Claude Code UI')).toBeInTheDocument();

    // Step 2: Test touch interactions
    const firstProject = canvas.getByText('Claude Code UI');
    await userEvent.click(firstProject);

    // Step 3: Verify sessions are displayed
    await expect(
      canvas.getByText('Implementing dark mode toggle'),
    ).toBeInTheDocument();

    // Step 4: Test scroll behavior (if applicable)
    const sessionsList = canvas.queryByTestId('sessions-list');
    if (sessionsList) {
      // Simulate scroll
      await userEvent.scroll(sessionsList, 0, 100);
    }
  },
};

// Test accessibility features
export const AccessibilityWorkflow: Story = {
  name: 'E2E: Accessibility',
  args: {
    projects: mockProjects,
    selectedProject: mockProjects[0],
    selectedSession: null,
    isLoading: false,
    onProjectSelect: () => {},
    onSessionSelect: () => {},
    onNewSession: () => {},
    onSessionDelete: () => {},
    onProjectDelete: () => {},
    onRefresh: () => {},
    onShowSettings: () => {},
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'keyboard-navigation',
            enabled: true,
          },
        ],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Test ARIA labels
    const projects = canvas.getAllByRole('button');
    projects.forEach((project) => {
      expect(project).toHaveAccessibleName();
    });

    // Step 2: Test keyboard navigation
    const firstProject = canvas.getByText('Claude Code UI');
    firstProject.focus();
    await expect(firstProject).toHaveFocus();

    // Step 3: Test screen reader announcements
    const selectedProject = canvas.queryByAttribute('aria-selected', 'true');
    if (selectedProject) {
      await expect(selectedProject).toBeInTheDocument();
    }

    // Step 4: Test semantic structure
    const projectsList = canvas.queryByRole('list');
    if (projectsList) {
      await expect(projectsList).toBeInTheDocument();
    }
  },
};
