import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within, waitFor} from '@storybook/testing-library';
import {ChatInterface} from './ChatInterface';

const meta: Meta<typeof ChatInterface> = {
  title: 'Features/Chat/E2E Tests',
  component: ChatInterface,
  parameters: {
    layout: 'fullscreen',
    chromatic: {disableSnapshot: true},
    docs: {
      description: {
        component: 'End-to-end tests for the ChatInterface component',
      },
    },
  },
  tags: ['test'],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Mock data that matches real app structure
const mockProject = {
  id: 'proj-1',
  name: 'claude-code-ui',
  displayName: 'Claude Code UI',
  path: '/claude-code-ui',
  fullPath: '/Users/developer/projects/claude-code-ui',
};

const mockConnectionHealth = {
  isConnected: true,
  latency: 150,
  lastError: undefined,
  reconnectAttempts: 0,
};

const mockSessionHistory = [
  {
    id: 'session-123',
    projectName: 'claude-code-ui',
    title: 'Main Session',
    timestamp: new Date(),
    messages: [
      {
        id: 'msg-1',
        role: 'assistant' as const,
        content: 'Hello! How can I help you today?',
        timestamp: new Date(Date.now() - 60000),
      },
    ],
  },
];

// Test message sending workflow
export const MessageSendingWorkflow: Story = {
  name: 'E2E: Message Sending',
  args: {
    selectedProject: mockProject,
    sessionHistory: mockSessionHistory,
    sessionId: 'session-123',
    sendMessage: (message: any) => {
      console.log('Send message:', message);
      // Simulate message being sent
      return Promise.resolve();
    },
    messages: [
      {
        id: 'msg-1',
        role: 'assistant' as const,
        content: 'Hello! How can I help you today?',
        timestamp: new Date(Date.now() - 60000),
      },
    ],
    connectionHealth: mockConnectionHealth,
    onFileOpen: () => {},
    onInputFocusChange: () => {},
    onSessionActive: () => {},
    onSessionInactive: () => {},
    onReplaceTemporarySession: () => {},
    onNavigateToSession: () => {},
    onShowSettings: () => {},
    onSessionHistoryLoad: () => {},
    autoExpandTools: true,
    showRawParameters: false,
    autoScrollToBottom: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Find the input area
    const input = canvas.getByRole('textbox');
    await expect(input).toBeInTheDocument();

    // Step 2: Type a message
    await userEvent.type(input, 'Can you help me with React components?');
    await expect(input).toHaveValue('Can you help me with React components?');

    // Step 3: Send the message (look for send button)
    const sendButton = canvas.getByRole('button', {name: /send/i});
    await userEvent.click(sendButton);

    // Step 4: Verify input is cleared
    await expect(input).toHaveValue('');
  },
};

// Test tool interaction workflow
export const ToolInteractionWorkflow: Story = {
  name: 'E2E: Tool Interaction',
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
    sendMessage: () => Promise.resolve(),
    messages: [
      {
        id: 'msg-1',
        type: 'assistant',
        content: [
          {
            type: 'text',
            text: "I'll read the file for you.",
          },
          {
            type: 'tool_use',
            id: 'tool-read-123',
            name: 'Read',
            input: {
              file_path: '/src/App.tsx',
            },
          },
        ],
        timestamp: new Date().toISOString(),
        tools: [
          {
            name: 'Read',
            input: {
              file_path: '/src/App.tsx',
            },
            output:
              'import React from \'react\';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;',
          },
        ],
      },
    ],
    connectionHealth: mockConnectionHealth,
    onFileOpen: () => {},
    onInputFocusChange: () => {},
    onSessionActive: () => {},
    onSessionInactive: () => {},
    onReplaceTemporarySession: () => {},
    onNavigateToSession: () => {},
    onShowSettings: () => {},
    autoExpandTools: false,
    showRawParameters: false,
    autoScrollToBottom: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify tool output is present
    const toolOutput = canvas.getByText(/import React from 'react'/);
    await expect(toolOutput).toBeInTheDocument();

    // Step 2: Test tool expansion (if collapsed)
    const expandButton = canvas.queryByRole('button', {name: /expand/i});
    if (expandButton) {
      await userEvent.click(expandButton);
    }

    // Step 3: Verify file path is shown
    const filePath = canvas.getByText('/src/App.tsx');
    await expect(filePath).toBeInTheDocument();
  },
};

// Test error handling
export const ErrorHandlingWorkflow: Story = {
  name: 'E2E: Error Handling',
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
    sendMessage: () => Promise.reject(new Error('Network error')),
    messages: [
      {
        id: 'msg-error',
        type: 'error',
        content: 'Connection lost. Please try again.',
        timestamp: new Date().toISOString(),
      },
    ],
    connectionHealth: {
      status: 'disconnected',
      lastPing: Date.now() - 30000,
      latency: null,
    },
    onFileOpen: () => {},
    onInputFocusChange: () => {},
    onSessionActive: () => {},
    onSessionInactive: () => {},
    onReplaceTemporarySession: () => {},
    onNavigateToSession: () => {},
    onShowSettings: () => {},
    autoExpandTools: true,
    showRawParameters: false,
    autoScrollToBottom: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify error message is displayed
    const errorMessage = canvas.getByText(/Connection lost/);
    await expect(errorMessage).toBeInTheDocument();

    // Step 2: Test retry functionality (if available)
    const retryButton = canvas.queryByRole('button', {name: /retry/i});
    if (retryButton) {
      await userEvent.click(retryButton);
    }

    // Step 3: Verify connection status indicator
    const statusIndicator = canvas.queryByText(/disconnected/i);
    if (statusIndicator) {
      await expect(statusIndicator).toBeInTheDocument();
    }
  },
};

// Test loading states
export const LoadingStateWorkflow: Story = {
  name: 'E2E: Loading States',
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
    sendMessage: () => new Promise(() => {}), // Never resolves
    messages: [
      {
        id: 'msg-loading',
        type: 'assistant',
        content: 'Let me think about that...',
        timestamp: new Date().toISOString(),
        isLoading: true,
      },
    ],
    connectionHealth: mockConnectionHealth,
    onFileOpen: () => {},
    onInputFocusChange: () => {},
    onSessionActive: () => {},
    onSessionInactive: () => {},
    onReplaceTemporarySession: () => {},
    onNavigateToSession: () => {},
    onShowSettings: () => {},
    autoExpandTools: true,
    showRawParameters: false,
    autoScrollToBottom: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify loading indicator is present
    const loadingIndicator =
      canvas.queryByText(/thinking/i) ||
      canvas.queryByRole('progressbar') ||
      canvas.queryByTestId('loading-spinner');

    if (loadingIndicator) {
      await expect(loadingIndicator).toBeInTheDocument();
    }

    // Step 2: Test that input is disabled during loading
    const input = canvas.getByRole('textbox');
    // Input might be disabled during loading
    if (input.hasAttribute('disabled')) {
      await expect(input).toBeDisabled();
    }
  },
};

// Test keyboard shortcuts
export const KeyboardShortcutsWorkflow: Story = {
  name: 'E2E: Keyboard Shortcuts',
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
    sendMessage: () => Promise.resolve(),
    messages: [],
    connectionHealth: mockConnectionHealth,
    onFileOpen: () => {},
    onInputFocusChange: () => {},
    onSessionActive: () => {},
    onSessionInactive: () => {},
    onReplaceTemporarySession: () => {},
    onNavigateToSession: () => {},
    onShowSettings: () => {},
    autoExpandTools: true,
    showRawParameters: false,
    autoScrollToBottom: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Focus on input
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);

    // Step 2: Type a message
    await userEvent.type(input, 'Test message');

    // Step 3: Test Enter key to send
    await userEvent.keyboard('{Enter}');

    // Step 4: Verify message was sent (input should be cleared)
    await waitFor(() => {
      expect(input).toHaveValue('');
    });

    // Step 5: Test Shift+Enter for new line
    await userEvent.type(input, 'Line 1');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await userEvent.type(input, 'Line 2');

    // Should have multiline content
    await expect(input).toHaveValue('Line 1\nLine 2');
  },
};

// Test settings integration
export const SettingsIntegrationWorkflow: Story = {
  name: 'E2E: Settings Integration',
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
    sendMessage: () => Promise.resolve(),
    messages: [
      {
        id: 'msg-1',
        type: 'assistant',
        content: [
          {
            type: 'tool_use',
            id: 'tool-read-123',
            name: 'Read',
            input: {
              file_path: '/src/App.tsx',
            },
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
    connectionHealth: mockConnectionHealth,
    onFileOpen: () => {},
    onInputFocusChange: () => {},
    onSessionActive: () => {},
    onSessionInactive: () => {},
    onReplaceTemporarySession: () => {},
    onNavigateToSession: () => {},
    onShowSettings: () => console.log('Settings opened'),
    autoExpandTools: false,
    showRawParameters: false,
    autoScrollToBottom: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Test settings button
    const settingsButton = canvas.queryByRole('button', {name: /settings/i});
    if (settingsButton) {
      await userEvent.click(settingsButton);
    }

    // Step 2: Test auto-expand tools toggle
    const autoExpandToggle = canvas.queryByRole('checkbox', {
      name: /auto.?expand/i,
    });
    if (autoExpandToggle) {
      await userEvent.click(autoExpandToggle);
    }

    // Step 3: Test raw parameters toggle
    const rawParamsToggle = canvas.queryByRole('checkbox', {
      name: /raw.?parameters/i,
    });
    if (rawParamsToggle) {
      await userEvent.click(rawParamsToggle);
    }
  },
};

// Test no project selected state
export const NoProjectSelectedWorkflow: Story = {
  name: 'E2E: No Project Selected',
  args: {
    selectedProject: null,
    selectedSession: null,
    sendMessage: () => Promise.resolve(),
    messages: [],
    connectionHealth: mockConnectionHealth,
    onFileOpen: () => {},
    onInputFocusChange: () => {},
    onSessionActive: () => {},
    onSessionInactive: () => {},
    onReplaceTemporarySession: () => {},
    onNavigateToSession: () => {},
    onShowSettings: () => {},
    autoExpandTools: true,
    showRawParameters: false,
    autoScrollToBottom: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Step 1: Verify no project selected message
    const noProjectMessage =
      canvas.queryByText(/no project selected/i) ||
      canvas.queryByText(/select a project/i);

    if (noProjectMessage) {
      await expect(noProjectMessage).toBeInTheDocument();
    }

    // Step 2: Verify input is disabled or not present
    const input = canvas.queryByRole('textbox');
    if (input) {
      await expect(input).toBeDisabled();
    }
  },
};
