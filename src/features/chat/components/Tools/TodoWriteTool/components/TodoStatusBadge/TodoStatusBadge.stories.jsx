import React from 'react';
import { TodoStatusBadge } from './TodoStatusBadge';

export default {
  title: 'Features/Chat/components/Tools/TodoWriteTool/TodoStatusBadge',
  component: TodoStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['pending', 'in_progress', 'completed'],
      description: 'The status to display in the badge',
    },
  },
};

export const Pending = {
  args: {
    status: 'pending',
  },
};

export const InProgress = {
  args: {
    status: 'in_progress',
  },
};

export const Completed = {
  args: {
    status: 'completed',
  },
};

export const AllStatuses = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <TodoStatusBadge status="pending" />
      <TodoStatusBadge status="in_progress" />
      <TodoStatusBadge status="completed" />
    </div>
  ),
};