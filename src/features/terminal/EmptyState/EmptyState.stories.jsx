import React from 'react';
import { EmptyState } from '@/features/terminal/EmptyState/EmptyState';

export default {
  title: 'Features/Terminal/EmptyState',
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component: 'Empty state shown when no project is selected in the Shell.'
      }
    },
    layout: 'fullscreen'
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px', backgroundColor: '#1e1e1e' }}>
        {Story()}
      </div>
    )
  ]
};

export const Default = {
  args: {}
};