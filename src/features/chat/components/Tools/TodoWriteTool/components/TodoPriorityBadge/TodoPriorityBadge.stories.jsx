import React from 'react';
import { TodoPriorityBadge } from './TodoPriorityBadge';

export default {
  title: 'Features/Chat/components/Tools/TodoWriteTool/TodoPriorityBadge',
  component: TodoPriorityBadge,
  tags: ['autodocs'],
  argTypes: {
    priority: {
      control: { type: 'select' },
      options: ['low', 'medium', 'high'],
      description: 'The priority level to display',
    },
  },
};

export const Low = {
  args: {
    priority: 'low',
  },
};

export const Medium = {
  args: {
    priority: 'medium',
  },
};

export const High = {
  args: {
    priority: 'high',
  },
};

export const AllPriorities = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <TodoPriorityBadge priority="low" />
      <TodoPriorityBadge priority="medium" />
      <TodoPriorityBadge priority="high" />
    </div>
  ),
};