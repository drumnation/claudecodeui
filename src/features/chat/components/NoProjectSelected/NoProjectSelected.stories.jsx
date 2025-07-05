import React from 'react';
import NoProjectSelected from '@/features/chat/components/NoProjectSelected';

export default {
  title: 'Features/Chat/components/NoProjectSelected',
  component: NoProjectSelected,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', height: '400px', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

export const Default = {
  args: {},
};

export const DarkMode = {
  args: {},
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ width: '600px', height: '400px', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};