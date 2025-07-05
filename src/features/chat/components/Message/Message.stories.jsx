import React from 'react';
import Message from '@/features/chat/components/Message/Message';

// Mock createDiff function for stories
const mockCreateDiff = (oldStr, newStr) => {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  const diffLines = [];
  
  const maxLines = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (i >= oldLines.length) {
      diffLines.push({ type: 'added', content: newLines[i], lineNum: i + 1 });
    } else if (i >= newLines.length) {
      diffLines.push({ type: 'removed', content: oldLines[i], lineNum: i + 1 });
    } else if (oldLines[i] !== newLines[i]) {
      diffLines.push({ type: 'removed', content: oldLines[i], lineNum: i + 1 });
      diffLines.push({ type: 'added', content: newLines[i], lineNum: i + 1 });
    }
  }
  
  return diffLines;
};

export default {
  title: 'Features/Chat/Components/Message',
  component: Message,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    message: { control: 'object' },
    prevMessage: { control: 'object' },
    autoExpandTools: { control: 'boolean' },
    showRawParameters: { control: 'boolean' },
  },
};

const mockTimestamp = new Date().toISOString();

const Template = (args) => <Message {...args} />;

export const UserMessage = Template.bind({});
UserMessage.args = {
  message: {
    type: 'user',
    content: 'Hello Claude! Can you help me with a coding task?',
    timestamp: mockTimestamp,
  },
  index: 0,
  createDiff: mockCreateDiff,
};

export const AssistantMessage = Template.bind({});
AssistantMessage.args = {
  message: {
    type: 'assistant',
    content: 'Of course! I\'d be happy to help you with a coding task. What specifically would you like assistance with?',
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
};

export const AssistantMessageWithCode = Template.bind({});
AssistantMessageWithCode.args = {
  message: {
    type: 'assistant',
    content: 'Here\'s how you can create a simple React component:\n\n```jsx\nfunction HelloWorld() {\n  return <h1>Hello, World!</h1>;\n}\n```\n\nThis component will render a heading with the text "Hello, World!".',
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
};

export const GroupedAssistantMessages = () => (
  <div>
    <Message
      message={{
        type: 'assistant',
        content: 'Let me help you with that.',
        timestamp: mockTimestamp,
      }}
      index={0}
      prevMessage={null}
      createDiff={mockCreateDiff}
    />
    <Message
      message={{
        type: 'assistant',
        content: 'First, we need to understand the problem better.',
        timestamp: new Date(Date.now() + 1000).toISOString(),
      }}
      index={1}
      prevMessage={{
        type: 'assistant',
        content: 'Let me help you with that.',
        timestamp: mockTimestamp,
      }}
      createDiff={mockCreateDiff}
    />
  </div>
);

export const ErrorMessage = Template.bind({});
ErrorMessage.args = {
  message: {
    type: 'error',
    content: 'An error occurred while processing your request. Please try again.',
    timestamp: mockTimestamp,
  },
  index: 0,
  createDiff: mockCreateDiff,
};

export const ToolUseEditMessage = Template.bind({});
ToolUseEditMessage.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Edit',
    toolId: 'edit_123',
    toolInput: JSON.stringify({
      file_path: '/src/components/App.jsx',
      old_string: 'function App() {\n  return <div>Hello</div>;\n}',
      new_string: 'function App() {\n  return <div>Hello, World!</div>;\n}',
    }),
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
  autoExpandTools: true,
  showRawParameters: false,
  onFileOpen: (path, diff) => console.log('Open file:', path, diff),
  onShowSettings: () => console.log('Show settings'),
};

export const ToolUseWriteMessage = Template.bind({});
ToolUseWriteMessage.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Write',
    toolId: 'write_456',
    toolInput: JSON.stringify({
      file_path: '/src/components/NewComponent.jsx',
      content: 'import React from \'react\';\n\nfunction NewComponent() {\n  return <div>New Component</div>;\n}\n\nexport default NewComponent;',
    }),
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
  autoExpandTools: true,
  showRawParameters: false,
  onFileOpen: (path, diff) => console.log('Open file:', path, diff),
};

export const ToolUseBashMessage = Template.bind({});
ToolUseBashMessage.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Bash',
    toolId: 'bash_789',
    toolInput: JSON.stringify({
      command: 'npm install react-router-dom',
      description: 'Install React Router for navigation',
    }),
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
  autoExpandTools: true,
  showRawParameters: false,
};

export const ToolUseReadMessage = Template.bind({});
ToolUseReadMessage.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Read',
    toolId: 'read_101',
    toolInput: JSON.stringify({
      file_path: '/src/components/ChatInterface/Message/Message.jsx',
    }),
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
  autoExpandTools: true,
  showRawParameters: false,
};

export const ToolUseTodoWriteMessage = Template.bind({});
ToolUseTodoWriteMessage.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'TodoWrite',
    toolId: 'todo_202',
    toolInput: JSON.stringify({
      todos: [
        { id: '1', content: 'Implement user authentication', status: 'pending', priority: 'high' },
        { id: '2', content: 'Add error handling', status: 'in_progress', priority: 'medium' },
        { id: '3', content: 'Write unit tests', status: 'completed', priority: 'low' },
      ],
    }),
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
  autoExpandTools: true,
  showRawParameters: false,
};

export const ToolWithResult = Template.bind({});
ToolWithResult.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Edit',
    toolId: 'edit_303',
    toolInput: JSON.stringify({
      file_path: '/src/App.jsx',
      old_string: 'const title = "App";',
      new_string: 'const title = "My Application";',
    }),
    toolResult: {
      content: 'The file /src/App.jsx has been updated.',
      isError: false,
    },
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
  autoExpandTools: true,
  onFileOpen: (path) => console.log('Open file:', path),
};

export const ToolWithError = Template.bind({});
ToolWithError.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Bash',
    toolId: 'bash_404',
    toolInput: JSON.stringify({
      command: 'npm run build',
    }),
    toolResult: {
      content: 'Error: Command failed with exit code 1. Missing required dependencies.',
      isError: true,
    },
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
  autoExpandTools: true,
};

export const InteractivePromptMessage = Template.bind({});
InteractivePromptMessage.args = {
  message: {
    type: 'assistant',
    isInteractivePrompt: true,
    content: 'Do you want to proceed with the installation?\n❯ 1. Yes\n  2. No\n  3. Cancel',
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
};

export const ToolWithInteractivePromptResult = Template.bind({});
ToolWithInteractivePromptResult.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Bash',
    toolId: 'bash_505',
    toolInput: JSON.stringify({
      command: 'npm install',
    }),
    toolResult: {
      content: 'Installing packages...\n\nDo you want to proceed?\n1. Yes\n2. No\n> 1',
      isError: false,
    },
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
  autoExpandTools: true,
};

export const LongToolResult = Template.bind({});
LongToolResult.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Bash',
    toolId: 'bash_606',
    toolInput: JSON.stringify({
      command: 'ls -la',
    }),
    toolResult: {
      content: 'total 128\ndrwxr-xr-x  10 user  staff   320 Dec  1 10:00 .\ndrwxr-xr-x  20 user  staff   640 Dec  1 09:00 ..\n-rw-r--r--   1 user  staff   215 Dec  1 10:00 .gitignore\n-rw-r--r--   1 user  staff  1024 Dec  1 10:00 README.md\ndrwxr-xr-x   5 user  staff   160 Dec  1 10:00 public\ndrwxr-xr-x  15 user  staff   480 Dec  1 10:00 src\n-rw-r--r--   1 user  staff   512 Dec  1 10:00 package.json\n-rw-r--r--   1 user  staff 65536 Dec  1 10:00 package-lock.json\ndrwxr-xr-x   3 user  staff    96 Dec  1 10:00 .vscode\ndrwxr-xr-x   8 user  staff   256 Dec  1 10:00 node_modules\n'.repeat(3),
      isError: false,
    },
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
  autoExpandTools: true,
};

export const FileContentResult = Template.bind({});
FileContentResult.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Read',
    toolId: 'read_707',
    toolInput: JSON.stringify({
      file_path: '/src/index.js',
    }),
    toolResult: {
      content: 'cat -n /src/index.js\n     1→import React from \'react\';\n     2→import ReactDOM from \'react-dom/client\';\n     3→import App from \'./App\';\n     4→import \'./index.css\';\n     5→\n     6→const root = ReactDOM.createRoot(document.getElementById(\'root\'));\n     7→root.render(\n     8→  <React.StrictMode>\n     9→    <App />\n    10→  </React.StrictMode>\n    11→);',
      isError: false,
    },
    timestamp: mockTimestamp,
  },
  index: 1,
  createDiff: mockCreateDiff,
  autoExpandTools: true,
};