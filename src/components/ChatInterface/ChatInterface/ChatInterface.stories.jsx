import ChatInterface from './ChatInterface';

export default {
  title: 'Components/ChatInterface',
  component: ChatInterface,
  parameters: {
    layout: 'fullscreen',
  },
};

// Mock data
const mockProject = {
  name: 'test-project',
  path: '/test-project',
  fullPath: '/Users/test/projects/test-project'
};

const mockSession = {
  id: 'session-123',
  name: 'Test Session'
};

const mockMessages = [];

// Default story
export const Default = {
  args: {
    selectedProject: mockProject,
    selectedSession: null,
    sendMessage: (message) => console.log('Send message:', message),
    messages: mockMessages,
    onFileOpen: (file) => console.log('Open file:', file),
    onInputFocusChange: (focused) => console.log('Input focus:', focused),
    onSessionActive: (sessionId) => console.log('Session active:', sessionId),
    onSessionInactive: (sessionId) => console.log('Session inactive:', sessionId),
    onReplaceTemporarySession: (sessionId) => console.log('Replace temp session:', sessionId),
    onNavigateToSession: (sessionId) => console.log('Navigate to session:', sessionId),
    onShowSettings: () => console.log('Show settings'),
    autoExpandTools: true,
    showRawParameters: false,
    autoScrollToBottom: true
  }
};

// No project selected
export const NoProjectSelected = {
  args: {
    ...Default.args,
    selectedProject: null
  }
};

// With active session
export const WithActiveSession = {
  args: {
    ...Default.args,
    selectedSession: mockSession
  }
};

// Loading state
export const Loading = {
  args: {
    ...Default.args,
    messages: [
      {
        type: 'claude-status',
        data: {
          message: 'Processing your request...',
          tokens: 150,
          can_interrupt: true
        }
      }
    ]
  }
};

// With messages
export const WithMessages = {
  args: {
    ...Default.args,
    messages: [
      {
        type: 'claude-response',
        data: {
          content: 'Hello! How can I help you today?'
        }
      }
    ]
  }
};

// With tool use
export const WithToolUse = {
  args: {
    ...Default.args,
    messages: [
      {
        type: 'claude-response',
        data: {
          content: [
            {
              type: 'text',
              text: 'Let me check that for you.'
            },
            {
              type: 'tool_use',
              id: 'tool-123',
              name: 'Read',
              input: {
                file_path: '/test/file.js'
              }
            }
          ]
        }
      }
    ]
  }
};

// Error state
export const WithError = {
  args: {
    ...Default.args,
    messages: [
      {
        type: 'claude-error',
        error: 'Failed to connect to Claude API'
      }
    ]
  }
};