import React from 'react';
import ClaudeStatus from '@/features/chat/components/ClaudeStatus/ClaudeStatus/ClaudeStatus';

export default {
  title: 'Features/Chat/Components/ClaudeStatus',
  component: ClaudeStatus,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Whether Claude is currently processing',
    },
    status: {
      control: 'object',
      description: 'Status object with text, tokens, and can_interrupt',
    },
    onAbort: {
      action: 'aborted',
      description: 'Callback when abort button is clicked',
    },
  },
};

// Base template
const Template = (args) => (
  <div style={{ width: '800px' }}>
    <ClaudeStatus {...args} />
  </div>
);

// Default state
export const Default = Template.bind({});
Default.args = {
  isLoading: true,
  status: null,
  onAbort: () => console.log('Aborted'),
};

// With custom status text
export const WithCustomStatus = Template.bind({});
WithCustomStatus.args = {
  isLoading: true,
  status: {
    text: 'Generating code',
    tokens: 1250,
    can_interrupt: true,
  },
  onAbort: () => console.log('Aborted'),
};

// Non-interruptible
export const NonInterruptible = Template.bind({});
NonInterruptible.args = {
  isLoading: true,
  status: {
    text: 'Finalizing response',
    tokens: 5000,
    can_interrupt: false,
  },
  onAbort: () => console.log('Aborted'),
};

// With high token count
export const HighTokenCount = Template.bind({});
HighTokenCount.args = {
  isLoading: true,
  status: {
    text: 'Deep analysis in progress',
    tokens: 125000,
    can_interrupt: true,
  },
  onAbort: () => console.log('Aborted'),
};

// Mobile view
export const MobileView = Template.bind({});
MobileView.args = {
  isLoading: true,
  status: {
    text: 'Processing',
    tokens: 500,
    can_interrupt: true,
  },
  onAbort: () => console.log('Aborted'),
};
MobileView.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};

// Not loading (hidden)
export const NotLoading = Template.bind({});
NotLoading.args = {
  isLoading: false,
  status: null,
  onAbort: () => console.log('Aborted'),
};