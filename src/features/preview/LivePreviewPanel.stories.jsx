import { LivePreviewPanel } from '@/features/preview/LivePreviewPanel';

export default {
  title: 'Features/Preview',
  component: LivePreviewPanel,
  parameters: {
    layout: 'fullscreen'
  },
  argTypes: {
    serverStatus: {
      control: { type: 'select' },
      options: ['stopped', 'starting', 'running', 'stopping', 'error']
    },
    isMobile: {
      control: { type: 'boolean' }
    }
  }
};

const mockScripts = ['dev', 'start', 'build', 'test', 'lint'];
const mockLogs = [
  { message: 'Server starting...', type: 'info' },
  { message: 'Listening on port 3000', type: 'info' },
  { message: 'Compiled successfully!', type: 'info' }
];

export const Default = {
  args: {
    selectedProject: 'my-project',
    serverStatus: 'stopped',
    serverUrl: 'http://localhost:3000',
    availableScripts: mockScripts,
    currentScript: '',
    isMobile: false,
    serverLogs: [],
    onStartServer: (script) => console.log('Starting server with script:', script),
    onStopServer: () => console.log('Stopping server'),
    onScriptSelect: (script) => console.log('Selected script:', script),
    onClose: () => console.log('Closing panel'),
    onClearLogs: () => console.log('Clearing logs')
  }
};

export const ServerRunning = {
  args: {
    ...Default.args,
    serverStatus: 'running',
    currentScript: 'dev',
    serverLogs: mockLogs
  }
};

export const ServerStarting = {
  args: {
    ...Default.args,
    serverStatus: 'starting',
    currentScript: 'dev',
    serverLogs: [{ message: 'Server starting...', type: 'info' }]
  }
};

export const ServerError = {
  args: {
    ...Default.args,
    serverStatus: 'error',
    currentScript: 'dev',
    serverLogs: [
      { message: 'Failed to start server', type: 'error' },
      { message: 'Port 3000 is already in use', type: 'error' }
    ]
  }
};

export const Mobile = {
  args: {
    ...Default.args,
    isMobile: true,
    serverStatus: 'running',
    currentScript: 'dev'
  }
};

export const WithManyLogs = {
  args: {
    ...ServerRunning.args,
    serverLogs: Array(50).fill(null).map((_, i) => ({
      message: `Log entry ${i + 1}: This is a sample log message with some content`,
      type: i % 10 === 0 ? 'error' : 'info'
    }))
  }
};

export const NoScriptsAvailable = {
  args: {
    ...Default.args,
    availableScripts: []
  }
};