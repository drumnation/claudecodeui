import React from 'react';
import { Button } from '@/components/atoms/Button';

interface TestToolButtonProps {
  onAddTestMessage: (message: any) => void;
}

export const TestToolButton: React.FC<TestToolButtonProps> = ({ onAddTestMessage }) => {
  const testTools = [
    {
      name: 'TodoWrite',
      message: {
        type: 'assistant',
        content: '',
        id: `test-todo-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tool_name: 'TodoWrite',
        toolName: 'TodoWrite',
        tool_input: JSON.stringify({
          todos: [
            { content: "Fix tool visualization", status: "completed", priority: "high", id: "1" },
            { content: "Test the changes", status: "in_progress", priority: "medium", id: "2" },
            { content: "Deploy to production", status: "pending", priority: "low", id: "3" }
          ]
        }),
        toolInput: JSON.stringify({
          todos: [
            { content: "Fix tool visualization", status: "completed", priority: "high", id: "1" },
            { content: "Test the changes", status: "in_progress", priority: "medium", id: "2" },
            { content: "Deploy to production", status: "pending", priority: "low", id: "3" }
          ]
        }),
        isToolUse: true
      }
    },
    {
      name: 'Edit',
      message: {
        type: 'assistant',
        content: '',
        id: `test-edit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tool_name: 'Edit',
        toolName: 'Edit',
        tool_input: JSON.stringify({
          file_path: '/src/components/Test.tsx',
          old_string: 'const message = "Hello";',
          new_string: 'const message = "Hello World!";'
        }),
        toolInput: JSON.stringify({
          file_path: '/src/components/Test.tsx',
          old_string: 'const message = "Hello";',
          new_string: 'const message = "Hello World!";'
        }),
        isToolUse: true
      }
    },
    {
      name: 'Write',
      message: {
        type: 'assistant',
        content: '',
        id: `test-write-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tool_name: 'Write',
        toolName: 'Write',
        tool_input: JSON.stringify({
          file_path: '/src/components/NewFile.tsx',
          content: 'export const NewComponent = () => {\n  return <div>Hello World!</div>;\n};'
        }),
        toolInput: JSON.stringify({
          file_path: '/src/components/NewFile.tsx',
          content: 'export const NewComponent = () => {\n  return <div>Hello World!</div>;\n};'
        }),
        isToolUse: true
      }
    }
  ];

  // Helper function to log incoming messages to console
  const logIncomingMessage = () => {
    console.log('%c📥 MONITORING INCOMING MESSAGES - Check console for claude-response logs', 'background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px;');
  };

  return (
    <div className="flex gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
      <span className="text-sm text-gray-600 dark:text-gray-400">Test Tools:</span>
      {testTools.map(tool => (
        <Button
          key={tool.name}
          size="sm"
          variant="outline"
          onClick={() => onAddTestMessage(tool.message)}
        >
          Test {tool.name}
        </Button>
      ))}
      <Button
        size="sm"
        variant="default"
        onClick={logIncomingMessage}
        className="ml-auto bg-red-600 hover:bg-red-700"
      >
        📥 Monitor Messages
      </Button>
    </div>
  );
};