import { NavigationBar } from '@/features/preview/NavigationBar/NavigationBar';

export default {
  title: 'Features/Preview/NavigationBar',
  component: NavigationBar,
  parameters: {
    layout: 'padded'
  }
};

export const Default = {
  args: {
    url: 'http://localhost:3000',
    setUrl: (url) => console.log('URL changed:', url),
    canGoBack: false,
    canGoForward: false,
    isLoading: false,
    serverStatus: 'running',
    isCurrentProjectServer: false,
    showDevServerAnyway: false,
    isMobile: false,
    onClose: () => console.log('Close clicked'),
    onGoBack: () => console.log('Go back'),
    onGoForward: () => console.log('Go forward'),
    onRefresh: () => console.log('Refresh'),
    onUrlSubmit: (e) => {
      e.preventDefault();
      console.log('URL submitted');
    }
  }
};

export const Loading = {
  args: {
    ...Default.args,
    isLoading: true
  }
};

export const WithNavigation = {
  args: {
    ...Default.args,
    canGoBack: true,
    canGoForward: true
  }
};

export const Disabled = {
  args: {
    ...Default.args,
    serverStatus: 'stopped'
  }
};

export const Mobile = {
  args: {
    ...Default.args,
    isMobile: true
  }
};