import { useRef } from 'react';
import { PreviewFrame } from '@/features/preview/PreviewFrame/PreviewFrame';

export default {
  title: 'Features/Preview/PreviewFrame',
  component: PreviewFrame,
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    )
  ]
};

const mockScripts = ['dev', 'start', 'build', 'test', 'lint'];

export const ServerRunning = {
  args: {
    serverStatus: 'running',
    serverUrl: 'http://localhost:3000',
    url: 'http://localhost:3000',
    iframeKey: 0,
    iframeRef: { current: null },
    isLoading: false,
    error: null,
    showDevServerAnyway: false,
    isCurrentProjectServer: false,
    availableScripts: mockScripts,
    onIframeLoad: () => console.log('Iframe loaded'),
    onIframeError: (e) => console.log('Iframe error:', e),
    onRefresh: () => console.log('Refresh'),
    onShowDevServerAnyway: () => console.log('Show dev server anyway')
  }
};

export const Loading = {
  args: {
    ...ServerRunning.args,
    isLoading: true
  }
};

export const WithError = {
  args: {
    ...ServerRunning.args,
    error: 'Failed to load the preview. The server might be down or the URL is incorrect.'
  }
};

export const ServerStopped = {
  args: {
    ...ServerRunning.args,
    serverStatus: 'stopped'
  }
};

export const ServerStarting = {
  args: {
    ...ServerRunning.args,
    serverStatus: 'starting'
  }
};

export const ServerError = {
  args: {
    ...ServerRunning.args,
    serverStatus: 'error'
  }
};

export const NoScriptsAvailable = {
  args: {
    ...ServerRunning.args,
    serverStatus: 'stopped',
    availableScripts: []
  }
};

export const CurrentProjectServer = {
  args: {
    ...ServerRunning.args,
    isCurrentProjectServer: true,
    showDevServerAnyway: false,
    serverStatus: 'stopped'
  }
};

export const CurrentProjectServerShowing = {
  args: {
    ...ServerRunning.args,
    isCurrentProjectServer: true,
    showDevServerAnyway: true
  }
};