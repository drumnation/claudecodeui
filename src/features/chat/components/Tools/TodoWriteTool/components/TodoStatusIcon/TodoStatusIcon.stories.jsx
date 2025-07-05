import React from 'react';
import { TodoStatusIcon } from './TodoStatusIcon';

export default {
  title: 'Features/Chat/components/Tools/TodoWriteTool/TodoStatusIcon',
  component: TodoStatusIcon,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['pending', 'in_progress', 'completed'],
      description: 'The status of the todo item',
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

export const AllStates = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <TodoStatusIcon status="pending" />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Pending</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <TodoStatusIcon status="in_progress" />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>In Progress</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <TodoStatusIcon status="completed" />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Completed</p>
      </div>
    </div>
  ),
};