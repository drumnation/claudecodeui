import React from 'react';
import { ConnectOverlay } from '@/features/terminal/ConnectOverlay/ConnectOverlay';

export default {
  title: 'Features/Terminal/ConnectOverlay',
  component: ConnectOverlay,
  parameters: {
    docs: {
      description: {
        component: 'Overlay component that shows connection state and connect button for the Shell.'
      }
    },
    layout: 'fullscreen'
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '400px', backgroundColor: '#1e1e1e' }}>
        {Story()}
      </div>
    )
  ],
  argTypes: {
    isInitialized: {
      description: 'Whether the terminal is initialized',
      control: { type: 'boolean' }
    },
    isConnected: {
      description: 'Whether the shell is connected',
      control: { type: 'boolean' }
    },
    isConnecting: {
      description: 'Whether the shell is currently connecting',
      control: { type: 'boolean' }
    },
    onConnect: {
      description: 'Callback when connect button is clicked',
      action: 'connect'
    },
    selectedSession: {
      description: 'The currently selected session',
      control: { type: 'object' }
    },
    projectName: {
      description: 'Name of the current project',
      control: { type: 'text' }
    }
  }
};

const mockSession = {
  id: 'session-123',
  summary: 'Implementing authentication flow with JWT tokens and refresh token rotation',
  timestamp: new Date().toISOString()
};

export const ReadyToConnect = {
  args: {
    isInitialized: true,
    isConnected: false,
    isConnecting: false,
    selectedSession: null,
    projectName: 'My Project'
  }
};

export const ReadyToConnectWithSession = {
  args: {
    isInitialized: true,
    isConnected: false,
    isConnecting: false,
    selectedSession: mockSession,
    projectName: 'My Project'
  }
};

export const Connecting = {
  args: {
    isInitialized: true,
    isConnected: false,
    isConnecting: true,
    selectedSession: mockSession,
    projectName: 'My Project'
  }
};

export const Hidden = {
  args: {
    isInitialized: false,
    isConnected: false,
    isConnecting: false,
    selectedSession: null,
    projectName: 'My Project'
  }
};