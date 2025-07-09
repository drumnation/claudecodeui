import React, {useEffect} from 'react';
import {ThemeProvider} from '../src/contexts/ThemeContext';
import {INITIAL_VIEWPORTS} from 'storybook/viewport';
import '../src/index.css';

// Storybook theme wrapper that syncs with the toolbar
const StorybookThemeWrapper = ({theme, children}) => {
  useEffect(() => {
    const root = document.documentElement;

    // Clear any saved theme preference for Storybook
    localStorage.removeItem('theme');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'auto') {
      // Check system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  return children;
};

// Global fetch mock for Storybook
const originalFetch = window.fetch;

// Function to get mock data based on story context
const getMockData = (url) => {
  if (url === '/api/projects') {
    // Check if custom behavior is set for this story
    if (window.__storybookFetchBehavior === 'error') {
      throw new Error('Network error: Unable to connect to server');
    }
    if (window.__storybookFetchBehavior === 'loading') {
      return new Promise(() => {}); // Never resolves
    }

    // Return custom data if set, otherwise empty array
    return {
      ok: true,
      json: async () => window.__storybookProjectsData || [],
    };
  }

  // Default response for other API endpoints
  return {
    ok: true,
    json: async () => ({}),
  };
};

window.fetch = async (url, options) => {
  // Only mock API calls
  if (url && url.includes('/api/')) {
    return getMockData(url);
  }

  // For non-API calls, use original fetch
  return originalFetch(url, options);
};

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          {value: 'light', title: 'Light', icon: 'sun'},
          {value: 'dark', title: 'Dark', icon: 'moon'},
          {value: 'auto', title: 'Auto', icon: 'browser'},
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
    outline: {
      name: 'Outline',
      description: 'Show outlines around elements for debugging',
      defaultValue: false,
      toolbar: {
        icon: 'outline',
        items: [
          {value: false, title: 'Hide outlines'},
          {value: true, title: 'Show outlines'},
        ],
        showName: true,
      },
    },
    measureEnabled: {
      name: 'Measure',
      description: 'Enable measuring tool',
      defaultValue: false,
      toolbar: {
        icon: 'ruler',
        items: [
          {value: false, title: 'Disable measuring'},
          {value: true, title: 'Enable measuring'},
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const {theme} = context.globals;

      return React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          StorybookThemeWrapper,
          {theme},
          React.createElement(
            ThemeProvider,
            null,
            React.createElement(
              'div',
              {id: 'root', className: 'h-full'},
              React.createElement(Story),
            ),
          ),
        ),
      );
    },
  ],
};

export default preview;
