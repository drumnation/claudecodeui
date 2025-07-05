import React from 'react';
import ScrollToBottomButton from '@/features/chat/components/ScrollToBottomButton/ScrollToBottomButton';

export default {
  title: 'Features/Chat/components/ScrollToBottomButton',
  component: ScrollToBottomButton,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '400px', height: '300px', backgroundColor: '#f3f4f6' }}>
        <Story />
      </div>
    ),
  ],
};

export const Default = {
  args: {
    isUserScrolledUp: true,
    chatMessages: [{ id: 1, content: 'Message 1' }],
    scrollToBottom: () => console.log('Scroll to bottom clicked'),
  },
};

export const Hidden = {
  args: {
    isUserScrolledUp: false,
    chatMessages: [{ id: 1, content: 'Message 1' }],
    scrollToBottom: () => console.log('Scroll to bottom clicked'),
  },
};

export const NoMessages = {
  args: {
    isUserScrolledUp: true,
    chatMessages: [],
    scrollToBottom: () => console.log('Scroll to bottom clicked'),
  },
};

export const Interactive = {
  args: {
    isUserScrolledUp: true,
    chatMessages: [{ id: 1, content: 'Message 1' }],
    scrollToBottom: () => alert('Scrolling to bottom!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Click the button to see an alert demonstrating the scroll action.',
      },
    },
  },
};