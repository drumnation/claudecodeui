import React from 'react';
import MessageStates from '@/features/chat/components/MessageStates';

export default {
  title: 'Features/Chat/components/MessageStates',
  component: MessageStates,
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

export const Loading = {
  args: {
    isLoadingSessionMessages: true,
    chatMessages: [],
  },
};

export const Empty = {
  args: {
    isLoadingSessionMessages: false,
    chatMessages: [],
  },
};

export const WithMessages = {
  args: {
    isLoadingSessionMessages: false,
    chatMessages: [{ id: 1, content: 'Test message' }],
  },
};

export const DarkModeLoading = {
  args: {
    isLoadingSessionMessages: true,
    chatMessages: [],
  },
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

export const DarkModeEmpty = {
  args: {
    isLoadingSessionMessages: false,
    chatMessages: [],
  },
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