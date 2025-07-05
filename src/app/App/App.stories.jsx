import React from 'react';
import { App } from './App';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default {
  title: 'App/App',
  component: App,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
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
  play: async ({ canvasElement }) => {
    // Mock fetch to return sample projects
    global.fetch = async (url) => {
      if (url === '/api/projects') {
        return {
          json: async () => [
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
                  summary: 'Added JWT authentication',
                },
                {
                  id: 'session-2',
                  title: 'Fix navigation bugs',
                  created_at: '2024-01-02T10:00:00Z',
                  updated_at: '2024-01-02T11:00:00Z',
                  summary: 'Fixed router issues',
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
                  summary: 'Created REST API endpoints',
                },
              ],
            },
          ],
        };
      }
      return { json: async () => ({}) };
    };
  },
};

export const MobileView = {
  name: 'Mobile View',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'App layout on mobile devices with hamburger menu',
      },
    },
  },
};

export const TabletView = {
  name: 'Tablet View',
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'App layout on tablet devices',
      },
    },
  },
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
      React.useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => document.documentElement.classList.remove('dark');
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
  play: async () => {
    // Mock fetch to simulate loading
    global.fetch = () => new Promise(() => {}); // Never resolves
  },
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
  play: async () => {
    // Mock fetch to simulate error
    global.fetch = async () => {
      throw new Error('Failed to fetch projects');
    };
  },
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
    (Story) => (
      <MemoryRouter initialEntries={['/session/session-1']}>
        <Story />
      </MemoryRouter>
    ),
  ],
  play: async () => {
    // Mock fetch to return sample projects
    global.fetch = async (url) => {
      if (url === '/api/projects') {
        return {
          json: async () => [
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
                  summary: 'Added JWT authentication',
                },
              ],
            },
          ],
        };
      }
      return { json: async () => ({}) };
    };
  },
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
  play: async ({ canvasElement }) => {
    // Wait for app to load
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(100);
    
    // Find and click settings button
    const settingsButton = canvasElement.querySelector('[aria-label*="Settings"]');
    if (settingsButton) {
      settingsButton.click();
    }
  },
};