import React from 'react';
import { ToolsSettings } from '@/features/settings/ToolsSettings';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default {
  title: 'Features/Settings/Tools',
  component: ToolsSettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive settings modal for managing tool permissions, appearance preferences, and allowed/disallowed tools configuration.'
      }
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    )
  ],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the settings modal is visible'
    },
    onClose: {
      action: 'onClose',
      description: 'Callback function when the modal is closed'
    }
  }
};

// Default story
export const Default = {
  args: {
    isOpen: true
  }
};

// With pre-configured tools
export const WithConfiguredTools = {
  args: {
    isOpen: true
  },
  decorators: [
    (Story) => {
      // Pre-populate localStorage with some tools
      React.useEffect(() => {
        localStorage.setItem('claude-tools-settings', JSON.stringify({
          allowedTools: ['Bash(git log:*)', 'Write', 'Read'],
          disallowedTools: ['Bash(rm:*)', 'Bash(sudo:*)'],
          skipPermissions: false,
          lastUpdated: new Date().toISOString()
        }));
      }, []);
      
      return <Story />;
    }
  ]
};

// Dark mode
export const DarkMode = {
  args: {
    isOpen: true
  },
  decorators: [
    (Story) => {
      React.useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => {
          document.documentElement.classList.remove('dark');
        };
      }, []);
      
      return <Story />;
    }
  ]
};

// Mobile view
export const Mobile = {
  args: {
    isOpen: true
  },
  parameters: {
    viewport: {
      defaultViewport: 'iphone12'
    }
  }
};

// Closed state
export const Closed = {
  args: {
    isOpen: false
  }
};