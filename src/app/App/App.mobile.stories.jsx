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
  title: 'App/Mobile',
  component: AppWithRouter,
  parameters: {
    layout: 'fullscreen',
    docs: {
      autodocs: true,
      description: {
        component: 'Mobile version of the main App component with hamburger menu navigation.'
      }
    }
  },
  globals: {
    viewport: {
      value: 'iphone12',
      isRotated: false
    }
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
  name: 'Default Mobile Layout',
  parameters: {
    docs: {
      description: {
        story: 'Default mobile app layout with no projects loaded',
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
  name: 'With Projects (Mobile)',
  parameters: {
    docs: {
      description: {
        story: 'Mobile app layout with multiple projects and sessions',
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

export const Loading = {
  name: 'Loading State (Mobile)',
  parameters: {
    docs: {
      description: {
        story: 'Mobile app in loading state',
      },
    },
  },
  decorators: [
    (Story) => {
      window.__storybookProjectsData = [];
      window.__storybookFetchBehavior = 'loading';
      
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
  name: 'Dark Mode (Mobile)',
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Mobile app layout with dark theme enabled',
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