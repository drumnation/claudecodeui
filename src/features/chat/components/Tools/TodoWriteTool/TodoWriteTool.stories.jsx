import React from 'react';
import TodoWriteTool from '@/features/chat/components/Tools/TodoWriteTool/TodoWriteTool';

export default {
  title: 'Features/Chat/Components/Message/Tools/TodoWriteTool',
  component: TodoWriteTool,
  parameters: {
    layout: 'padded',
  },
};

const defaultRenderDefaultTool = () => <div>Default tool fallback</div>;

export const Default = {
  args: {
    toolInput: JSON.stringify({
      todos: [
        { id: '1', content: 'Complete the refactoring', status: 'in_progress', priority: 'high' },
        { id: '2', content: 'Write unit tests', status: 'pending', priority: 'medium' },
        { id: '3', content: 'Update documentation', status: 'pending', priority: 'low' },
      ]
    }),
    autoExpandTools: true,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const WithCompletedTasks = {
  args: {
    toolInput: JSON.stringify({
      todos: [
        { id: '1', content: 'Set up project', status: 'completed', priority: 'high' },
        { id: '2', content: 'Configure build tools', status: 'completed', priority: 'high' },
        { id: '3', content: 'Add styling', status: 'in_progress', priority: 'medium' },
        { id: '4', content: 'Deploy to production', status: 'pending', priority: 'low' },
      ]
    }),
    autoExpandTools: true,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const Collapsed = {
  args: {
    toolInput: JSON.stringify({
      todos: [
        { id: '1', content: 'Task 1', status: 'pending', priority: 'medium' },
        { id: '2', content: 'Task 2', status: 'pending', priority: 'medium' },
      ]
    }),
    autoExpandTools: false,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const WithRawParameters = {
  args: {
    toolInput: JSON.stringify({
      todos: [
        { id: '1', content: 'Review PR', status: 'pending', priority: 'high' },
      ]
    }),
    autoExpandTools: true,
    showRawParameters: true,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const EmptyTodos = {
  args: {
    toolInput: JSON.stringify({
      todos: []
    }),
    autoExpandTools: true,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const InvalidInput = {
  args: {
    toolInput: 'invalid json',
    autoExpandTools: true,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};