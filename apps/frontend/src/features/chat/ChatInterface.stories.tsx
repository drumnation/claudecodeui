import React from 'react';
import {ChatInterface} from '@/features/chat/ChatInterface';
import {ChatInterfaceComponentProps} from './ChatInterface.types';

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

const mockMessages = [
  {
    id: 'msg-1',
    role: 'user' as const,
    content: 'Hello Claude!',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 'msg-2',
    role: 'assistant' as const,
    content: 'Hello! How can I help you today?',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    tools: [],
  },
];

const mockSessionHistory = [
  {
    id: 'session-1',
    projectName: 'claude-code-ui',
    title: 'Main Session',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    messages: mockMessages,
  },
];

export default {
  title: 'Features/Chat/ChatInterface',
  component: ChatInterface,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main chat interface component for interacting with Claude AI.',
      },
    },
  },
  argTypes: {
    selectedProject: {
      description: 'Currently selected project with full structure',
    },
    sessionHistory: {
      description: 'Array of session history items',
    },
    sessionId: {
      description: 'Current session ID',
    },
    sendMessage: {
      description: 'Function to send messages',
      action: 'sendMessage',
    },
    messages: {
      description: 'Array of chat messages with proper role field',
    },
    connectionHealth: {
      description: 'Connection health status with isConnected boolean',
    },
    onFileOpen: {
      description: 'Callback when file is opened',
      action: 'fileOpened',
    },
    onInputFocusChange: {
      description: 'Callback when input focus changes',
      action: 'inputFocusChanged',
    },
    onSessionActive: {
      description: 'Callback when session becomes active',
      action: 'sessionActive',
    },
    onSessionInactive: {
      description: 'Callback when session becomes inactive',
      action: 'sessionInactive',
    },
    onReplaceTemporarySession: {
      description: 'Callback to replace temporary session',
      action: 'replaceTemporarySession',
    },
    onNavigateToSession: {
      description: 'Callback to navigate to session',
      action: 'navigateToSession',
    },
    onShowSettings: {
      description: 'Callback to show settings',
      action: 'showSettings',
    },
    autoExpandTools: {
      description: 'Whether to auto-expand tool outputs',
      control: 'boolean',
    },
    showRawParameters: {
      description: 'Whether to show raw parameters',
      control: 'boolean',
    },
    autoScrollToBottom: {
      description: 'Whether to auto-scroll to bottom',
      control: 'boolean',
    },
  },
};

// Messages with tool use (extending the base messages)
const mockMessagesWithTools = [
  ...mockMessages,
  {
    id: 'msg-3',
    role: 'user' as const,
    content: 'Can you read the main App component?',
    timestamp: new Date(Date.now() - 30 * 1000),
  },
  {
    id: 'msg-4',
    role: 'assistant' as const,
    content: "I'll read the App component for you.",
    timestamp: new Date(Date.now() - 15 * 1000),
    tools: [
      {
        type: 'tool_use',
        name: 'Read',
        input: {
          file_path: '/src/App.tsx',
        },
        output:
          'import React from \'react\';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;',
        status: 'success' as const,
        timestamp: new Date(Date.now() - 15 * 1000),
      },
    ],
  },
];

// Default story
export const Default = {
  args: {
    selectedProject: mockProject,
    sessionHistory: mockSessionHistory,
    sessionId: 'session-1',
    sendMessage: (message: any) => console.log('Send message:', message),
    messages: [],
    connectionHealth: mockConnectionHealth,
    onFileOpen: (file: any) => console.log('Open file:', file),
    onInputFocusChange: (focused: any) => console.log('Input focus:', focused),
    onSessionActive: (sessionId: any) =>
      console.log('Session active:', sessionId),
    onSessionInactive: (sessionId: any) =>
      console.log('Session inactive:', sessionId),
    onReplaceTemporarySession: (tempId: any, realId: any) =>
      console.log('Replace temp session:', tempId, realId),
    onNavigateToSession: (sessionId: any) =>
      console.log('Navigate to session:', sessionId),
    onShowSettings: () => console.log('Show settings'),
    onSessionHistoryLoad: () => console.log('Loading session history'),
    autoExpandTools: true,
    showRawParameters: false,
    autoScrollToBottom: true,
  },
};

// No project selected
export const NoProjectSelected = {
  args: {
    ...Default.args,
    selectedProject: null,
    sessionHistory: [],
    sessionId: undefined,
  },
};

// With active session
export const WithActiveSession = {
  args: {
    ...Default.args,
    sessionId: 'session-1',
    messages: mockMessages,
  },
};

// Loading state
export const Loading = {
  args: {
    ...Default.args,
    selectedSession: mockSession,
    messages: [
      ...mockMessages,
      {
        id: 'msg-loading',
        type: 'assistant',
        content: 'Let me think about that...',
        timestamp: new Date().toISOString(),
        isLoading: true,
      },
    ],
  },
};

// With tool use
export const WithToolUse = {
  args: {
    ...Default.args,
    selectedSession: mockSession,
    messages: mockMessagesWithTools,
  },
};

// Error state
export const WithError = {
  args: {
    ...Default.args,
    selectedSession: mockSession,
    messages: [
      ...mockMessages,
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
  },
};

// Dark mode
export const DarkMode = {
  args: {
    ...Default.args,
    selectedSession: mockSession,
    messages: mockMessages,
  },
  parameters: {
    backgrounds: {default: 'dark'},
  },
  decorators: [
    (Story: any) => (
      <div className="dark min-h-screen bg-gray-900">
        <Story />
      </div>
    ),
  ],
};

// Mobile view
export const Mobile = {
  args: {
    ...Default.args,
    selectedSession: mockSession,
    messages: mockMessages,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
