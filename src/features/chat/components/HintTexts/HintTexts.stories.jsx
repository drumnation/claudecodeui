import React from 'react';
import HintTexts from '@/features/chat/components/HintTexts';

export default {
  title: 'Features/Chat/components/HintTexts',
  component: HintTexts,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Default = {
  args: {
    isInputFocused: false,
  },
};

export const InputFocused = {
  args: {
    isInputFocused: true,
  },
};

export const DarkMode = {
  args: {
    isInputFocused: false,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ width: '600px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export const DarkModeInputFocused = {
  args: {
    isInputFocused: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ width: '600px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};