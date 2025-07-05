import React from 'react';
import { App } from './App';
import { MemoryRouter } from 'react-router-dom';

// Wrap App component with MemoryRouter for all stories
const AppWithRouter = (props) => (
  <MemoryRouter initialEntries={[props.initialRoute || '/']}>
    <App {...props} />
  </MemoryRouter>
);

export default {
  title: 'App/App',
  component: AppWithRouter,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    chromatic: { disableSnapshot: true },
  },
};

// Mock WebSocket connection
const mockWebSocket = {
  send: () => {},
  close: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  readyState: WebSocket.OPEN,
};

// Mock WebSocket module
window.WebSocket = class MockWebSocket {
  constructor() {
    return mockWebSocket;
  }
};

export const Default = {
  name: 'Default Layout',
  parameters: {
    docs: {
      description: {
        story: 'Default app layout with no projects loaded',
      },
    },
  },
  decorators: [
    (Story) => {
      // Set up empty projects before component mounts
      window.__storybookProjectsData = [];
      window.__storybookFetchBehavior = null;
      
      React.useEffect(() => {
        return () => {
          delete window.__storybookProjectsData;
          delete window.__storybookFetchBehavior;
        };
      }, []);
      
      return <Story />;
    },
  ],
};

export const WithProjects = {
  name: 'With Projects',
  parameters: {
    docs: {
      description: {
        story: 'App layout with multiple projects and sessions',
      },
    },
  },
  decorators: [
    (Story) => {
      // Set up projects data before component mounts
      window.__storybookProjectsData = [
        {
          name: 'my-react-app',
          displayName: 'My React App',
          fullPath: '/Users/demo/projects/my-react-app',
          sessionMeta: { total: 3, recent: 2 },
          sessions: [
            {
              id: 'session-1',
              title: 'Implement authentication',
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T11:00:00Z',
              lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
              summary: 'Added JWT authentication',
              messageCount: 24,
              isActive: false,
            },
            {
              id: 'session-2',
              title: 'Fix navigation bugs',
              created_at: '2024-01-02T10:00:00Z',
              updated_at: '2024-01-02T11:00:00Z',
              lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
              summary: 'Fixed router issues',
              messageCount: 15,
              isActive: false,
            },
          ],
        },
        {
          name: 'backend-api',
          displayName: 'Backend API',
          fullPath: '/Users/demo/projects/backend-api',
          sessionMeta: { total: 1, recent: 1 },
          sessions: [
            {
              id: 'session-3',
              title: 'Add user endpoints',
              created_at: '2024-01-03T10:00:00Z',
              updated_at: '2024-01-03T11:00:00Z',
              lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
              summary: 'Created REST API endpoints',
              messageCount: 8,
              isActive: true,
            },
          ],
        },
      ];
      window.__storybookFetchBehavior = null;
      
      React.useEffect(() => {
        return () => {
          delete window.__storybookProjectsData;
          delete window.__storybookFetchBehavior;
        };
      }, []);
      
      return <Story />;
    },
  ],
};


export const LightMode = {
  name: 'Light Mode',
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'App layout with light theme enabled',
      },
    },
  },
  decorators: [
    (Story) => {
      document.documentElement.classList.remove('dark');
      window.__storybookProjectsData = [];
      window.__storybookFetchBehavior = null;
      
      React.useEffect(() => {
        return () => {
          delete window.__storybookProjectsData;
          delete window.__storybookFetchBehavior;
        };
      }, []);
      
      return <Story />;
    },
  ],
};

export const DarkMode = {
  name: 'Dark Mode',
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'App layout with dark theme enabled',
      },
    },
  },
  decorators: [
    (Story) => {
      document.documentElement.classList.add('dark');
      window.__storybookProjectsData = [];
      window.__storybookFetchBehavior = null;
      
      React.useEffect(() => {
        return () => {
          document.documentElement.classList.remove('dark');
          delete window.__storybookProjectsData;
          delete window.__storybookFetchBehavior;
        };
      }, []);
      
      return <Story />;
    },
  ],
};

export const Loading = {
  name: 'Loading State',
  parameters: {
    docs: {
      description: {
        story: 'App layout while projects are being loaded',
      },
    },
  },
  decorators: [
    (Story) => {
      // Set loading behavior before component mounts
      window.__storybookFetchBehavior = 'loading';
      
      React.useEffect(() => {
        return () => {
          delete window.__storybookFetchBehavior;
        };
      }, []);
      
      return <Story />;
    },
  ],
};

export const ErrorState = {
  name: 'Error State',
  parameters: {
    docs: {
      description: {
        story: 'App layout when projects fail to load',
      },
    },
  },
  decorators: [
    (Story) => {
      // Set error behavior before component mounts
      window.__storybookFetchBehavior = 'error';
      
      React.useEffect(() => {
        return () => {
          delete window.__storybookFetchBehavior;
        };
      }, []);
      
      return <Story />;
    },
  ],
};

export const WithActiveSession = {
  name: 'With Active Session',
  parameters: {
    docs: {
      description: {
        story: 'App layout with an active chat session',
      },
    },
  },
  decorators: [
    (Story) => {
      // Set up projects data before component mounts
      window.__storybookProjectsData = [
        {
          name: 'my-react-app',
          displayName: 'My React App',
          fullPath: '/Users/demo/projects/my-react-app',
          sessionMeta: { total: 1, recent: 1 },
          sessions: [
            {
              id: 'session-1',
              title: 'Implement authentication',
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T11:00:00Z',
              lastActivity: new Date().toISOString(), // Just now
              summary: 'Added JWT authentication',
              messageCount: 24,
              isActive: true,
            },
          ],
        },
      ];
      window.__storybookFetchBehavior = null;
      
      React.useEffect(() => {
        return () => {
          delete window.__storybookProjectsData;
          delete window.__storybookFetchBehavior;
        };
      }, []);
      
      return <Story args={{ initialRoute: '/session/session-1' }} />;
    },
  ],
};

export const WithSettingsOpen = {
  name: 'With Settings Panel Open',
  parameters: {
    docs: {
      description: {
        story: 'App layout with tools settings modal open',
      },
    },
  },
  decorators: [
    (Story) => {
      // Set up empty projects data before component mounts
      window.__storybookProjectsData = [];
      window.__storybookFetchBehavior = null;
      
      React.useEffect(() => {
        // Wait for component to mount and then click the settings button
        const timer = setTimeout(() => {
          const settingsButton = document.querySelector('button:has(span:contains("Tools Settings"))') || 
                                 document.querySelector('[aria-label*="Settings"]') ||
                                 Array.from(document.querySelectorAll('button')).find(btn => 
                                   btn.textContent.includes('Tools Settings')
                                 );
          if (settingsButton) {
            settingsButton.click();
          }
        }, 100);
        
        return () => {
          clearTimeout(timer);
          delete window.__storybookProjectsData;
          delete window.__storybookFetchBehavior;
        };
      }, []);
      
      return <Story />;
    },
  ],
};

export const WithQuickSettingsOpen = {
  name: 'With Quick Settings Panel Open',
  parameters: {
    docs: {
      description: {
        story: 'App layout with quick settings panel expanded',
      },
    },
  },
  decorators: [
    (Story) => {
      // Set up empty projects data before component mounts
      window.__storybookProjectsData = [];
      window.__storybookFetchBehavior = null;
      
      React.useEffect(() => {
        // Wait for component to mount and then click the quick settings button
        const timer = setTimeout(() => {
          const quickSettingsButton = document.querySelector('[aria-label="Open settings panel"]') ||
                                     document.querySelector('button[title*="settings"]') ||
                                     Array.from(document.querySelectorAll('button')).find(btn => {
                                       const svg = btn.querySelector('svg');
                                       return svg && !btn.textContent.trim();
                                     });
          if (quickSettingsButton) {
            quickSettingsButton.click();
          }
        }, 100);
        
        return () => {
          clearTimeout(timer);
          delete window.__storybookProjectsData;
          delete window.__storybookFetchBehavior;
        };
      }, []);
      
      return <Story />;
    },
  ],
};