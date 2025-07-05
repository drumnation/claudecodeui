import React from 'react';
import TaskTool from '@/features/chat/components/Tools/TaskTool/TaskTool';

export default {
  title: 'Features/Chat/components/Tools/TaskTool',
  component: TaskTool,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A beautiful component for displaying AI task information with structured content.'
      }
    }
  },
  argTypes: {
    taskData: {
      control: 'object',
      description: 'Task data containing description and prompt'
    },
    timestamp: {
      control: 'text',
      description: 'ISO timestamp for when the task was created'
    }
  }
};

const Template = (args) => <TaskTool {...args} />;

export const RefactorTask = Template.bind({});
RefactorTask.args = {
  taskData: {
    description: "Refactor ChatInterface Core",
    prompt: `You are RefactorRogue Agent #1 - Core ChatInterface Specialist

Your mission: Refactor the main ChatInterface component following the bulletproof React architecture.

CRITICAL FILES TO CREATE:
1. src/components/ChatInterface/ChatInterface.jsx - Only JSX, import hook and styles
2. src/components/ChatInterface/ChatInterface.hook.js - Extract ALL stateful logic (700+ lines)
3. src/components/ChatInterface/ChatInterface.logic.js - Extract pure functions (flattenFileTree, etc.)
4. src/components/ChatInterface/ChatInterface.styles.js - Convert ALL Tailwind to @emotion/styled
5. src/components/ChatInterface/ChatInterface.stories.jsx - Comprehensive stories with autodocs
6. src/components/ChatInterface/index.ts - Barrel export with named exports

KEY REQUIREMENTS:
- Preserve ALL performance optimizations (React.memo, useMemo, useCallback, message windowing)
- Add ARIA attributes (role="main", aria-label="Chat interface")
- Convert to named export: export const ChatInterface
- Move 700+ lines of logic to the hook file
- Extract the inline <style> block to styled components
- Preserve WebSocket handling, session protection, error handling
- Update src/components/MainContent.jsx import to use named import

Work relentlessly and ensure zero deviation from the standards!`
  },
  timestamp: new Date().toISOString()
};

export const BugFixTask = Template.bind({});
BugFixTask.args = {
  taskData: {
    description: "Fix WebSocket Connection Bug",
    prompt: `Fix the WebSocket reconnection issue in production environment.

The WebSocket connection drops after 5 minutes of inactivity and doesn't properly reconnect.

REQUIREMENTS:
- Implement exponential backoff for reconnection attempts
- Add connection state indicator
- Preserve message queue during disconnection
- Add proper error handling and logging
- Test with network interruptions`
  },
  timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
};

export const SearchTask = Template.bind({});
SearchTask.args = {
  taskData: {
    description: "Search for Configuration Files",
    prompt: `Search the codebase for all configuration files and document their purpose.

Look for:
- webpack.config.js
- vite.config.js
- tailwind.config.js
- tsconfig.json
- .env files
- babel configurations

Document the purpose of each file and any important settings.`
  },
  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
};

export const TestTask = Template.bind({});
TestTask.args = {
  taskData: {
    description: "Write Unit Tests for Message Component",
    prompt: `Write comprehensive unit tests for the Message component.

Test coverage should include:
- All message types (user, assistant, error)
- Tool use rendering
- Interactive prompts
- Markdown rendering
- Performance with large messages
- Accessibility requirements

Use React Testing Library and aim for 95% coverage.`
  },
  timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
};

export const OptimizeTask = Template.bind({});
OptimizeTask.args = {
  taskData: {
    description: "Optimize Bundle Size",
    prompt: `Analyze and optimize the application bundle size.

Tasks:
- Run bundle analyzer
- Identify large dependencies
- Implement code splitting
- Add lazy loading for routes
- Optimize images and assets
- Remove unused dependencies

Target: Reduce bundle size by 30%`
  },
  timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
};

export const SimpleTask = Template.bind({});
SimpleTask.args = {
  taskData: {
    description: "Update Documentation",
    prompt: "Update the README.md file with the latest installation instructions and API documentation."
  },
  timestamp: new Date().toISOString()
};