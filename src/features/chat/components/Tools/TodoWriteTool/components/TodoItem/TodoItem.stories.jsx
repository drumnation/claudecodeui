import React from 'react';
import { TodoItem } from './TodoItem';

export default {
  title: 'Features/Chat/components/Tools/TodoWriteTool/TodoItem',
  component: TodoItem,
  tags: ['autodocs'],
  argTypes: {
    todo: {
      description: 'Todo object containing id, content, status, and priority',
    },
  },
};

const todoTemplate = {
  id: '1',
  content: 'Implement user authentication system with OAuth support',
};

export const PendingLowPriority = {
  args: {
    todo: {
      ...todoTemplate,
      status: 'pending',
      priority: 'low',
    },
  },
};

export const PendingMediumPriority = {
  args: {
    todo: {
      ...todoTemplate,
      status: 'pending',
      priority: 'medium',
    },
  },
};

export const PendingHighPriority = {
  args: {
    todo: {
      ...todoTemplate,
      status: 'pending',
      priority: 'high',
    },
  },
};

export const InProgressMediumPriority = {
  args: {
    todo: {
      ...todoTemplate,
      id: '2',
      content: 'Refactor database schema for better performance',
      status: 'in_progress',
      priority: 'medium',
    },
  },
};

export const CompletedHighPriority = {
  args: {
    todo: {
      ...todoTemplate,
      id: '3',
      content: 'Fix critical security vulnerability in login endpoint',
      status: 'completed',
      priority: 'high',
    },
  },
};

export const LongContent = {
  args: {
    todo: {
      id: '4',
      content: 'This is a very long todo item content that should demonstrate how the component handles text wrapping and layout when the content exceeds typical length expectations and needs to flow across multiple lines',
      status: 'pending',
      priority: 'medium',
    },
  },
};

export const AllVariations = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <TodoItem
        todo={{
          id: '1',
          content: 'High priority pending task',
          status: 'pending',
          priority: 'high',
        }}
      />
      <TodoItem
        todo={{
          id: '2',
          content: 'Medium priority in-progress task',
          status: 'in_progress',
          priority: 'medium',
        }}
      />
      <TodoItem
        todo={{
          id: '3',
          content: 'Low priority completed task',
          status: 'completed',
          priority: 'low',
        }}
      />
    </div>
  ),
};