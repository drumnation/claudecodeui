import React from 'react';
import { TodoList } from './TodoList';

export default {
  title: 'Features/Chat/components/Tools/TodoWriteTool/TodoList',
  component: TodoList,
  tags: ['autodocs'],
  argTypes: {
    todos: {
      description: 'Array of todo objects',
    },
    isResult: {
      control: { type: 'boolean' },
      description: 'Whether to show the result header with item count',
    },
  },
};

const sampleTodos = [
  {
    id: '1',
    content: 'Set up development environment',
    status: 'completed',
    priority: 'high',
  },
  {
    id: '2',
    content: 'Implement authentication module',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: '3',
    content: 'Write unit tests for core functionality',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: '4',
    content: 'Update documentation',
    status: 'pending',
    priority: 'low',
  },
];

export const Default = {
  args: {
    todos: sampleTodos,
    isResult: false,
  },
};

export const WithResultHeader = {
  args: {
    todos: sampleTodos,
    isResult: true,
  },
};

export const EmptyList = {
  args: {
    todos: [],
    isResult: true,
  },
};

export const SingleItem = {
  args: {
    todos: [sampleTodos[0]],
    isResult: true,
  },
};

export const AllPendingTasks = {
  args: {
    todos: [
      {
        id: '1',
        content: 'Research new framework options',
        status: 'pending',
        priority: 'high',
      },
      {
        id: '2',
        content: 'Create proof of concept',
        status: 'pending',
        priority: 'medium',
      },
      {
        id: '3',
        content: 'Schedule team meeting',
        status: 'pending',
        priority: 'low',
      },
    ],
    isResult: false,
  },
};

export const MixedPriorities = {
  args: {
    todos: [
      {
        id: '1',
        content: 'Fix production bug',
        status: 'in_progress',
        priority: 'high',
      },
      {
        id: '2',
        content: 'Code review for PR #123',
        status: 'pending',
        priority: 'high',
      },
      {
        id: '3',
        content: 'Refactor legacy module',
        status: 'pending',
        priority: 'medium',
      },
      {
        id: '4',
        content: 'Update team wiki',
        status: 'completed',
        priority: 'low',
      },
      {
        id: '5',
        content: 'Optimize database queries',
        status: 'in_progress',
        priority: 'medium',
      },
    ],
    isResult: true,
  },
};

export const NullTodos = {
  args: {
    todos: null,
    isResult: false,
  },
};

export const InvalidTodos = {
  args: {
    todos: 'not-an-array',
    isResult: false,
  },
};