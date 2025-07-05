import React from 'react';
import { Terminal } from '@/features/terminal/Terminal/Terminal';

export default {
  title: 'Features/Terminal/Terminal',
  component: Terminal,
  parameters: {
    docs: {
      description: {
        component: 'Terminal display component that renders the xterm.js instance.'
      }
    }
  },
  argTypes: {
    terminalRef: {
      description: 'React ref for the terminal container',
      control: false
    },
    isInitialized: {
      description: 'Whether the terminal has been initialized',
      control: { type: 'boolean' }
    }
  }
};

export const Initialized = {
  args: {
    terminalRef: { current: null },
    isInitialized: true
  }
};

export const Loading = {
  args: {
    terminalRef: { current: null },
    isInitialized: false
  }
};