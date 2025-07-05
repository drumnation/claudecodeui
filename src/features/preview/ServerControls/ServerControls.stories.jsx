import { ServerControls } from '@/features/preview/ServerControls/ServerControls';

export default {
  title: 'Features/Preview/ServerControls',
  component: ServerControls,
  parameters: {
    layout: 'padded'
  },
  argTypes: {
    serverStatus: {
      control: { type: 'select' },
      options: ['stopped', 'starting', 'running', 'stopping', 'error']
    }
  }
};

const mockScripts = ['dev', 'start', 'build', 'test', 'lint'];

export const Default = {
  args: {
    availableScripts: mockScripts,
    currentScript: '',
    serverStatus: 'stopped',
    isMobile: false,
    showLogs: false,
    onScriptChange: (e) => console.log('Script changed:', e.target.value),
    onStartServer: (script) => console.log('Starting server with:', script),
    onStopServer: () => console.log('Stopping server'),
    onToggleLogs: () => console.log('Toggle logs')
  }
};

export const ServerRunning = {
  args: {
    ...Default.args,
    serverStatus: 'running',
    currentScript: 'dev'
  }
};

export const ServerStarting = {
  args: {
    ...Default.args,
    serverStatus: 'starting',
    currentScript: 'dev'
  }
};

export const WithLogsOpen = {
  args: {
    ...Default.args,
    serverStatus: 'running',
    currentScript: 'dev',
    showLogs: true
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

export const NoScripts = {
  args: {
    ...Default.args,
    availableScripts: []
  }
};

export const Error = {
  args: {
    ...Default.args,
    serverStatus: 'error',
    currentScript: 'dev'
  }
};