import React, { useState } from 'react';
import { MobileNav } from '@/layouts/root/MobileNav/MobileNav';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from 'vitest';

export default {
  title: 'Layouts/Root/MobileNav',
  component: MobileNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Mobile navigation component with tab switching functionality for mobile devices.'
      }
    }
  },
  argTypes: {
    activeTab: {
      control: { type: 'select' },
      options: ['chat', 'shell', 'files', 'git', 'preview'],
      description: 'Currently active tab',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'chat' }
      }
    },
    isInputFocused: {
      control: 'boolean',
      description: 'Whether an input field is focused (hides navigation)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    setActiveTab: {
      action: 'setActiveTab',
      description: 'Callback function to change active tab',
      table: {
        type: { summary: 'function' }
      }
    }
  }
};

// Template with state management
const Template = (args) => {
  const [activeTab, setActiveTab] = useState(args.activeTab || 'chat');
  
  return (
    <div style={{ height: '100vh', position: 'relative', background: '#f3f4f6' }}>
      <div style={{ padding: '20px' }}>
        <h2>Mobile Navigation Demo</h2>
        <p>Current tab: <strong>{activeTab}</strong></p>
      </div>
      <MobileNav
        {...args}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  activeTab: 'chat',
  isInputFocused: false
};

export const ShellTabActive = Template.bind({});
ShellTabActive.args = {
  activeTab: 'shell',
  isInputFocused: false
};

export const FilesTabActive = Template.bind({});
FilesTabActive.args = {
  activeTab: 'files',
  isInputFocused: false
};

export const GitTabActive = Template.bind({});
GitTabActive.args = {
  activeTab: 'git',
  isInputFocused: false
};

export const PreviewTabActive = Template.bind({});
PreviewTabActive.args = {
  activeTab: 'preview',
  isInputFocused: false
};

export const InputFocused = Template.bind({});
InputFocused.args = {
  activeTab: 'chat',
  isInputFocused: true
};
InputFocused.parameters = {
  docs: {
    description: {
      story: 'Navigation hidden when input is focused to prevent keyboard overlap on mobile devices.'
    }
  }
};

// Dark mode variant
export const DarkMode = Template.bind({});
DarkMode.args = {
  activeTab: 'chat',
  isInputFocused: false
};
DarkMode.decorators = [
  (Story) => {
    React.useEffect(() => {
      document.documentElement.classList.add('dark');
      return () => document.documentElement.classList.remove('dark');
    }, []);
    
    return (
      <div style={{ background: '#1f2937', minHeight: '100vh' }}>
        <Story />
      </div>
    );
  }
];
DarkMode.parameters = {
  docs: {
    description: {
      story: 'Mobile navigation in dark mode with appropriate color adjustments.'
    }
  }
};

// Interactive story with all states
export const Interactive = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div style={{ 
      height: '100vh', 
      position: 'relative', 
      background: isDarkMode ? '#1f2937' : '#f3f4f6',
      color: isDarkMode ? '#fff' : '#000'
    }}>
      <div style={{ padding: '20px' }}>
        <h2>Interactive Mobile Navigation Demo</h2>
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
            />
            {' '}Dark Mode
          </label>
          <label>
            <input
              type="checkbox"
              checked={isInputFocused}
              onChange={(e) => setIsInputFocused(e.target.checked)}
            />
            {' '}Simulate Input Focus
          </label>
          <p>Current tab: <strong>{activeTab}</strong></p>
        </div>
      </div>
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isInputFocused={isInputFocused}
      />
    </div>
  );
};
Interactive.parameters = {
  docs: {
    description: {
      story: 'Fully interactive demo with toggleable dark mode and input focus simulation.'
    }
  }
};

// Play function for testing interactions
export const WithInteractions = Template.bind({});
WithInteractions.args = {
  activeTab: 'chat',
  isInputFocused: false
};
WithInteractions.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  
  // Test clicking on shell tab
  const shellButton = await canvas.findByLabelText('Shell');
  await userEvent.click(shellButton);
  
  // Test clicking on files tab
  const filesButton = await canvas.findByLabelText('Files');
  await userEvent.click(filesButton);
  
  // Test clicking on git tab
  const gitButton = await canvas.findByLabelText('Git');
  await userEvent.click(gitButton);
  
  // Test clicking on preview tab
  const previewButton = await canvas.findByLabelText('Preview');
  await userEvent.click(previewButton);
  
  // Return to chat tab
  const chatButton = await canvas.findByLabelText('Chat');
  await userEvent.click(chatButton);
};