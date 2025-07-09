import React from 'react';
import {ToolsSettings} from '@/features/settings/ToolsSettings';
import {ThemeProvider} from '@/contexts/ThemeContext';

export default {
  title: 'Features/Settings/Mobile/ToolsSettings',
  component: ToolsSettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      autodocs: true,
      description: {
        component:
          'Mobile version of comprehensive settings modal for managing tool permissions, appearance preferences, and allowed/disallowed tools configuration.',
      },
    },
  },
  globals: {
    viewport: {
      value: 'iphone12',
      isRotated: false,
    },
  },
  decorators: [
    (Story: any) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the settings modal is visible',
    },
    onClose: {
      action: 'onClose',
      description: 'Callback function when the modal is closed',
    },
  },
};

// Default story
export const Default = {
  args: {
    isOpen: true,
  },
};

// With pre-configured tools
export const WithConfiguredTools = {
  args: {
    isOpen: true,
  },
  decorators: [
    (Story: any) => {
      // Pre-populate localStorage with some tools
      React.useEffect(() => {
        localStorage.setItem(
          'claude-tools-settings',
          JSON.stringify({
            allowedTools: ['Bash(git log:*)', 'Write', 'Read'],
            disallowedTools: ['Bash(rm:*)', 'Bash(sudo:*)'],
            skipPermissions: false,
            lastUpdated: new Date().toISOString(),
          }),
        );
      }, []);

      return (
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

// Dark mode
export const DarkMode = {
  args: {
    isOpen: true,
  },
  decorators: [
    (Story: any) => {
      React.useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => {
          document.documentElement.classList.remove('dark');
        };
      }, []);

      return (
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

// Closed state
export const Closed = {
  args: {
    isOpen: false,
  },
};
