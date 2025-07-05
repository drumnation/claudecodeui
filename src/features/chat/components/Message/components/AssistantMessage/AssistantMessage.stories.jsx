import React from 'react';
import AssistantMessage from '@/features/chat/components/Message/components/AssistantMessage/AssistantMessage';

export default {
  title: 'Features/Chat/Components/Message/AssistantMessage',
  component: AssistantMessage,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onFileOpen: { action: 'file opened' },
    onShowSettings: { action: 'settings shown' },
    createDiff: { action: 'diff created' },
  },
};

const Template = (args) => <AssistantMessage {...args} />;

export const Default = Template.bind({});
Default.args = {
  message: {
    type: 'assistant',
    content: 'Hello! I can help you with your coding tasks. What would you like to work on today?',
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
  autoExpandTools: false,
  showRawParameters: false,
};

export const ErrorMessage = Template.bind({});
ErrorMessage.args = {
  message: {
    type: 'error',
    content: 'An error occurred while processing your request. Please try again.',
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
};

export const GroupedMessage = Template.bind({});
GroupedMessage.args = {
  message: {
    type: 'assistant',
    content: 'This is a grouped message that appears without the Claude header.',
    timestamp: new Date().toISOString(),
  },
  isGrouped: true,
};

export const WithMarkdown = Template.bind({});
WithMarkdown.args = {
  message: {
    type: 'assistant',
    content: `Here's some **markdown** content with various formatting:

- This is a list item
- Another item with \`inline code\`

\`\`\`javascript
// Code block
function hello() {
  console.log("Hello, world!");
}
\`\`\`

> This is a blockquote

And here's a [link](https://example.com) to learn more.`,
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
};

export const ToolUseEdit = Template.bind({});
ToolUseEdit.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Edit',
    toolId: 'edit-123',
    toolInput: {
      file_path: '/src/components/App.jsx',
      old_string: 'const greeting = "Hello";',
      new_string: 'const greeting = "Hello, World!";',
    },
    toolResult: {
      content: 'The file /src/components/App.jsx has been updated.',
      isError: false,
    },
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
  autoExpandTools: true,
};

export const ToolUseWrite = Template.bind({});
ToolUseWrite.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Write',
    toolId: 'write-456',
    toolInput: {
      file_path: '/src/components/NewComponent.jsx',
      content: 'export default function NewComponent() {\n  return <div>New Component</div>;\n}',
    },
    toolResult: {
      content: 'File created successfully',
      isError: false,
    },
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
  autoExpandTools: true,
};

export const ToolUseBash = Template.bind({});
ToolUseBash.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Bash',
    toolId: 'bash-789',
    toolInput: {
      command: 'npm install react-router-dom',
      description: 'Install React Router',
    },
    toolResult: {
      content: `+ react-router-dom@6.8.0
added 3 packages from 2 contributors and audited 1024 packages in 3.456s`,
      isError: false,
    },
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
  autoExpandTools: true,
};

export const ToolUseError = Template.bind({});
ToolUseError.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Edit',
    toolId: 'edit-error',
    toolInput: {
      file_path: '/src/components/NonExistent.jsx',
      old_string: 'foo',
      new_string: 'bar',
    },
    toolResult: {
      content: 'Error: File not found: /src/components/NonExistent.jsx',
      isError: true,
    },
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
};

export const TodoListResult = Template.bind({});
TodoListResult.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'TodoRead',
    toolId: 'todo-read',
    toolInput: {},
    toolResult: {
      content: JSON.stringify([
        {
          id: '1',
          content: 'Implement user authentication',
          status: 'completed',
          priority: 'high',
        },
        {
          id: '2',
          content: 'Add unit tests for components',
          status: 'in_progress',
          priority: 'medium',
        },
        {
          id: '3',
          content: 'Update documentation',
          status: 'pending',
          priority: 'low',
        },
      ]),
      isError: false,
    },
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
};

export const InteractivePrompt = Template.bind({});
InteractivePrompt.args = {
  message: {
    type: 'assistant',
    isInteractivePrompt: true,
    content: `Do you want to proceed with the installation?
❯ 1. Yes
  2. No
  3. Review changes first`,
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
};

export const InteractivePromptWithSelection = Template.bind({});
InteractivePromptWithSelection.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Bash',
    toolId: 'bash-interactive',
    toolInput: {
      command: 'npm update',
    },
    toolResult: {
      content: `Found 3 packages to update...

Do you want to proceed?
1. Yes
2. No

> 1`,
      isError: false,
    },
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
};

export const LongOutput = Template.bind({});
LongOutput.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Bash',
    toolId: 'bash-long',
    toolInput: {
      command: 'ls -la',
    },
    toolResult: {
      content: `total 128
drwxr-xr-x  16 user  staff   512 Jan 15 10:30 .
drwxr-xr-x   5 user  staff   160 Jan 15 09:00 ..
-rw-r--r--   1 user  staff   220 Jan 15 10:00 .eslintrc.js
-rw-r--r--   1 user  staff    45 Jan 15 10:00 .gitignore
-rw-r--r--   1 user  staff  1234 Jan 15 10:00 README.md
drwxr-xr-x  10 user  staff   320 Jan 15 10:00 node_modules
-rw-r--r--   1 user  staff  2456 Jan 15 10:00 package.json
-rw-r--r--   1 user  staff 45678 Jan 15 10:00 package-lock.json
drwxr-xr-x   8 user  staff   256 Jan 15 10:00 src
drwxr-xr-x   4 user  staff   128 Jan 15 10:00 public
-rw-r--r--   1 user  staff   789 Jan 15 10:00 vite.config.js
-rw-r--r--   1 user  staff   123 Jan 15 10:00 .env.example
-rw-r--r--   1 user  staff   456 Jan 15 10:00 tsconfig.json
drwxr-xr-x   3 user  staff    96 Jan 15 10:00 .vscode
-rw-r--r--   1 user  staff   789 Jan 15 10:00 tailwind.config.js`,
      isError: false,
    },
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
  autoExpandTools: false,
};

export const FileContent = Template.bind({});
FileContent.args = {
  message: {
    type: 'assistant',
    isToolUse: true,
    toolName: 'Read',
    toolId: 'read-file',
    toolInput: {
      file_path: '/src/components/Button.jsx',
    },
    toolResult: {
      content: `cat -n /src/components/Button.jsx
     1→import React from 'react';
     2→import PropTypes from 'prop-types';
     3→
     4→const Button = ({ children, onClick, variant = 'primary', disabled = false }) => {
     5→  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
     6→  const variantClasses = {
     7→    primary: 'bg-blue-500 text-white hover:bg-blue-600',
     8→    secondary: 'bg-gray-300 text-gray-700 hover:bg-gray-400',
     9→  };
    10→
    11→  return (
    12→    <button
    13→      className={\`\${baseClasses} \${variantClasses[variant]}\`}
    14→      onClick={onClick}
    15→      disabled={disabled}
    16→    >
    17→      {children}
    18→    </button>
    19→  );
    20→};`,
      isError: false,
    },
    timestamp: new Date().toISOString(),
  },
  isGrouped: false,
  autoExpandTools: true,
};