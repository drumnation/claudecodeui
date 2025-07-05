import React from 'react';
import { ShellHeader } from '@/features/terminal/ShellHeader/ShellHeader';

export default {
  title: 'Features/Terminal/ShellHeader',
  component: ShellHeader,
  parameters: {
    docs: {
      description: {
        component: 'Header component for the Shell showing connection status and controls.'
      }
    }
  },
  argTypes: {
    isConnected: {
      description: 'Whether the shell is connected',
      control: { type: 'boolean' }
    },
    selectedSession: {
      description: 'The currently selected session',
      control: { type: 'object' }
    },
    isInitialized: {
      description: 'Whether the terminal is initialized',
      control: { type: 'boolean' }
    },
    isRestarting: {
      description: 'Whether the shell is restarting',
      control: { type: 'boolean' }
    },
    onDisconnect: {
      description: 'Callback when disconnect button is clicked',
      action: 'disconnected'
    },
    onRestart: {
      description: 'Callback when restart button is clicked',
      action: 'restarted'
    }
  }
};

const mockSession = {
  id: 'session-123',
  summary: 'Implementing authentication flow with JWT tokens',
  timestamp: new Date().toISOString()
};

export const Connected = {
  args: {
    isConnected: true,
    selectedSession: mockSession,
    isInitialized: true,
    isRestarting: false
  }
};

export const Disconnected = {
  args: {
    isConnected: false,
    selectedSession: mockSession,
    isInitialized: true,
    isRestarting: false
  }
};

export const Initializing = {
  args: {
    isConnected: false,
    selectedSession: null,
    isInitialized: false,
    isRestarting: false
  }
};

export const Restarting = {
  args: {
    isConnected: false,
    selectedSession: mockSession,
    isInitialized: true,
    isRestarting: true
  }
};

export const NewSession = {
  args: {
    isConnected: true,
    selectedSession: null,
    isInitialized: true,
    isRestarting: false
  }
};