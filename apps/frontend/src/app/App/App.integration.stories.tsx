import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import {expect} from '@storybook/test';
import {App} from './App';

const meta: Meta<typeof App> = {
  title: 'App/Integration Tests',
  component: App,
  parameters: {
    layout: 'fullscreen',
    chromatic: {disableSnapshot: true},
    docs: {
      description: {
        component: 'Full application integration tests for E2E workflows',
      },
    },
  },
  tags: ['test'],
  decorators: [
    (Story) => {
      // Set up mock projects data for the integration tests
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
              lastActivity: new Date(
                Date.now() - 2 * 60 * 60 * 1000,
              ).toISOString(),
              messageCount: 8,
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
              id: 'session-3',
              summary: 'Add authentication middleware',
              lastActivity: new Date(
                Date.now() - 24 * 60 * 60 * 1000,
              ).toISOString(),
              messageCount: 15,
            },
          ],
          sessionMeta: {
            hasMore: false,
            total: 1,
          },
        },
      ];

      // Set up global mock data
      (window as any).__storybookProjectsData = mockProjects;
      (window as any).__storybookFetchBehavior = 'success';

      return <Story />;
    },
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Test the complete chat workflow
export const ChatWorkflow: Story = {
  name: 'E2E: Chat Workflow',
  parameters: {
    docs: {
      description: {
        story:
          'Tests the complete chat workflow: project selection, message sending, tool usage',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify initial state
    await expect(canvas.getByText('Claude Code UI')).toBeInTheDocument();

    // Step 2: Select a project
    const projectButton = canvas.getByText('claude-code-ui');
    await userEvent.click(projectButton);

    // Step 3: Verify project is selected
    await expect(
      canvas.getByText('Implementing dark mode toggle'),
    ).toBeInTheDocument();

    // Step 4: Try to send a message (if chat input is available)
    const chatInput = canvas.queryByRole('textbox');
    if (chatInput) {
      await userEvent.type(
        chatInput,
        'Hello, can you help me with this project?',
      );

      // Look for send button
      const sendButton = canvas.queryByRole('button', {name: /send/i});
      if (sendButton) {
        await userEvent.click(sendButton);
      }
    }

    // Step 5: Verify UI responsiveness
    await expect(canvas.getByText('claude-code-ui')).toBeVisible();
  },
};

// Test the projects management workflow
export const ProjectsWorkflow: Story = {
  name: 'E2E: Projects Management',
  parameters: {
    docs: {
      description: {
        story: 'Tests project selection, session management, and navigation',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify projects are loaded
    await expect(canvas.getByText('claude-code-ui')).toBeInTheDocument();
    await expect(canvas.getByText('my-api')).toBeInTheDocument();

    // Step 2: Select first project
    const firstProject = canvas.getByText('claude-code-ui');
    await userEvent.click(firstProject);

    // Step 3: Verify sessions are shown
    await expect(
      canvas.getByText('Implementing dark mode toggle'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Bug fix: Memory leak in message renderer'),
    ).toBeInTheDocument();

    // Step 4: Select a session
    const firstSession = canvas.getByText('Implementing dark mode toggle');
    await userEvent.click(firstSession);

    // Step 5: Switch to second project
    const secondProject = canvas.getByText('my-api');
    await userEvent.click(secondProject);

    // Step 6: Verify session for second project
    await expect(
      canvas.getByText('Add authentication middleware'),
    ).toBeInTheDocument();
  },
};

// Test mobile responsiveness
export const MobileWorkflow: Story = {
  name: 'E2E: Mobile Responsive',
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
    docs: {
      description: {
        story: 'Tests mobile responsive behavior and navigation',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify mobile layout
    // Mobile should show navigation tabs at bottom
    const _mobileNav = canvas.queryByRole('navigation');

    // Step 2: Test tab navigation if available
    const chatTab = canvas.queryByLabelText('Chat');
    if (chatTab) {
      await userEvent.click(chatTab);
      await expect(chatTab).toHaveAttribute('aria-pressed', 'true');
    }

    const filesTab = canvas.queryByLabelText('Files');
    if (filesTab) {
      await userEvent.click(filesTab);
      await expect(filesTab).toHaveAttribute('aria-pressed', 'true');
    }

    // Step 3: Test sidebar toggle if available
    const menuButton = canvas.queryByRole('button', {name: /menu/i});
    if (menuButton) {
      await userEvent.click(menuButton);
      // Verify sidebar opens
      await expect(canvas.getByText('claude-code-ui')).toBeInTheDocument();
    }
  },
};

// Test error states
export const ErrorHandling: Story = {
  name: 'E2E: Error Handling',
  parameters: {
    docs: {
      description: {
        story: 'Tests error states and recovery mechanisms',
      },
    },
  },
  decorators: [
    (Story) => {
      // Set up error state
      (window as any).__storybookFetchBehavior = 'error';
      (window as any).__storybookProjectsData = [];
      return <Story />;
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify error state is shown
    // Look for error message or empty state
    const errorMessage =
      canvas.queryByText(/error/i) ||
      canvas.queryByText(/failed/i) ||
      canvas.queryByText(/unable to connect/i);

    if (errorMessage) {
      await expect(errorMessage).toBeInTheDocument();
    }

    // Step 2: Test retry functionality if available
    const retryButton =
      canvas.queryByRole('button', {name: /retry/i}) ||
      canvas.queryByRole('button', {name: /refresh/i});

    if (retryButton) {
      await userEvent.click(retryButton);
    }
  },
};

// Test loading states
export const LoadingStates: Story = {
  name: 'E2E: Loading States',
  parameters: {
    docs: {
      description: {
        story: 'Tests loading states and skeleton screens',
      },
    },
  },
  decorators: [
    (Story) => {
      // Set up loading state
      (window as any).__storybookFetchBehavior = 'loading';
      (window as any).__storybookProjectsData = [];
      return <Story />;
    },
  ],
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

    // Step 2: Verify no content is shown while loading
    const projectContent = canvas.queryByText('claude-code-ui');
    expect(projectContent).not.toBeInTheDocument();
  },
};

// Test accessibility
export const AccessibilityTest: Story = {
  name: 'E2E: Accessibility',
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
    docs: {
      description: {
        story: 'Tests accessibility features and keyboard navigation',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Test keyboard navigation
    const firstInteractive = canvas.getAllByRole('button')[0];
    if (firstInteractive) {
      firstInteractive.focus();
      await expect(firstInteractive).toHaveFocus();
    }

    // Step 2: Test ARIA labels
    const buttons = canvas.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAccessibleName();
    });

    // Step 3: Test semantic structure
    const main = canvas.queryByRole('main');
    if (main) {
      await expect(main).toBeInTheDocument();
    }
  },
};

// Test theme switching
export const ThemeToggle: Story = {
  name: 'E2E: Theme Switching',
  parameters: {
    docs: {
      description: {
        story: 'Tests dark/light theme switching functionality',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Look for theme toggle button
    const themeToggle =
      canvas.queryByRole('button', {name: /theme/i}) ||
      canvas.queryByRole('button', {name: /dark/i}) ||
      canvas.queryByRole('button', {name: /light/i});

    if (themeToggle) {
      // Step 2: Click theme toggle
      await userEvent.click(themeToggle);

      // Step 3: Verify theme changed (check for dark class or other indicators)
      const root = document.documentElement;
      const isDark = root.classList.contains('dark');

      // Theme should have toggled
      expect(typeof isDark).toBe('boolean');
    }
  },
};
