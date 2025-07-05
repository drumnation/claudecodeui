import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import '../src/index.css';

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
      test: "todo"
    }
  },
  globalTypes: {
    outline: {
      name: 'Outline',
      description: 'Show outlines around elements for debugging',
      defaultValue: false,
      toolbar: {
        icon: 'outline',
        items: [
          { value: false, title: 'Hide outlines' },
          { value: true, title: 'Show outlines' }
        ],
        showName: true
      }
    },
    viewport: {
      name: 'Viewport',
      description: 'Viewport for responsive testing',
      defaultValue: 'responsive',
      toolbar: {
        icon: 'tablet',
        items: [
          { value: 'responsive', title: 'Responsive' },
          { value: 'mobile', title: 'Mobile' },
          { value: 'tablet', title: 'Tablet' }
        ],
        showName: true
      }
    },
    measureEnabled: {
      name: 'Measure',
      description: 'Enable measuring tool',
      defaultValue: false,
      toolbar: {
        icon: 'ruler',
        items: [
          { value: false, title: 'Disable measuring' },
          { value: true, title: 'Enable measuring' }
        ],
        showName: true
      }
    },
    backgrounds: {
      name: 'Background',
      description: 'Background color for the preview',
      defaultValue: 'default',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Default' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' }
        ],
        showName: true
      }
    }
  },
  decorators: [
    (Story) => {
      return React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(
            BrowserRouter,
            { 
              future: { 
                v7_startTransition: true,
                v7_relativeSplatPath: true 
              } 
            },
            React.createElement(
              'div',
              { id: 'root', className: 'h-full' },
              React.createElement(Story)
            )
          )
        )
      );
    },
  ],
};

export default preview;