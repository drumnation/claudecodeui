// QuickSettingsPanel.stories.jsx
import React, { useState } from 'react';
import { QuickSettingsPanel } from '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default {
  title: 'Features/Chat/components/QuickSettingsPanel',
  component: QuickSettingsPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A slide-out settings panel that provides quick access to appearance and behavior settings including dark mode, tool display options, view options, and whisper dictation modes.'
      }
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', position: 'relative' }}>
          <Story />
        </div>
      </ThemeProvider>
    )
  ],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the panel is open or closed'
    },
    onToggle: {
      action: 'toggle',
      description: 'Callback when the panel is toggled'
    },
    autoExpandTools: {
      control: 'boolean',
      description: 'Whether tools should auto-expand'
    },
    onAutoExpandChange: {
      action: 'autoExpandChange',
      description: 'Callback when auto-expand setting changes'
    },
    showRawParameters: {
      control: 'boolean',
      description: 'Whether to show raw parameters'
    },
    onShowRawParametersChange: {
      action: 'showRawParametersChange',
      description: 'Callback when show raw parameters setting changes'
    },
    autoScrollToBottom: {
      control: 'boolean',
      description: 'Whether to auto-scroll to bottom'
    },
    onAutoScrollChange: {
      action: 'autoScrollChange',
      description: 'Callback when auto-scroll setting changes'
    },
    isMobile: {
      control: 'boolean',
      description: 'Whether the panel is in mobile mode'
    }
  }
};

const Template = (args) => {
  const [isOpen, setIsOpen] = useState(args.isOpen);
  const [autoExpandTools, setAutoExpandTools] = useState(args.autoExpandTools);
  const [showRawParameters, setShowRawParameters] = useState(args.showRawParameters);
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(args.autoScrollToBottom);

  return (
    <QuickSettingsPanel
      {...args}
      isOpen={isOpen}
      onToggle={(newState) => {
        setIsOpen(newState);
        args.onToggle(newState);
      }}
      autoExpandTools={autoExpandTools}
      onAutoExpandChange={(value) => {
        setAutoExpandTools(value);
        args.onAutoExpandChange(value);
      }}
      showRawParameters={showRawParameters}
      onShowRawParametersChange={(value) => {
        setShowRawParameters(value);
        args.onShowRawParametersChange(value);
      }}
      autoScrollToBottom={autoScrollToBottom}
      onAutoScrollChange={(value) => {
        setAutoScrollToBottom(value);
        args.onAutoScrollChange(value);
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  isOpen: false,
  autoExpandTools: true,
  showRawParameters: false,
  autoScrollToBottom: true,
  isMobile: false
};

export const Open = Template.bind({});
Open.args = {
  ...Default.args,
  isOpen: true
};

export const Mobile = Template.bind({});
Mobile.args = {
  ...Default.args,
  isMobile: true
};
Mobile.parameters = {
  viewport: {
    defaultViewport: 'mobile1'
  }
};

export const MobileOpen = Template.bind({});
MobileOpen.args = {
  ...Mobile.args,
  isOpen: true
};
MobileOpen.parameters = {
  viewport: {
    defaultViewport: 'mobile1'
  }
};

export const WithAllSettingsEnabled = Template.bind({});
WithAllSettingsEnabled.args = {
  isOpen: true,
  autoExpandTools: true,
  showRawParameters: true,
  autoScrollToBottom: true,
  isMobile: false
};

export const DarkMode = Template.bind({});
DarkMode.args = {
  ...Default.args,
  isOpen: true
};
DarkMode.parameters = {
  backgrounds: { default: 'dark' }
};
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider defaultTheme="dark">
      <div style={{ height: '100vh', position: 'relative', backgroundColor: '#1a1a1a' }}>
        <Story />
      </div>
    </ThemeProvider>
  )
];

export const InteractiveDemo = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [autoExpandTools, setAutoExpandTools] = useState(true);
  const [showRawParameters, setShowRawParameters] = useState(false);
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(true);

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '600px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Interactive QuickSettingsPanel Demo</h2>
        <p style={{ marginBottom: '10px' }}>Current Settings:</p>
        <ul style={{ marginBottom: '20px' }}>
          <li>Panel Open: {isOpen ? 'Yes' : 'No'}</li>
          <li>Auto-expand Tools: {autoExpandTools ? 'Yes' : 'No'}</li>
          <li>Show Raw Parameters: {showRawParameters ? 'Yes' : 'No'}</li>
          <li>Auto-scroll to Bottom: {autoScrollToBottom ? 'Yes' : 'No'}</li>
        </ul>
        <p>Click the tab on the right to toggle the settings panel!</p>
      </div>
      
      <QuickSettingsPanel
        isOpen={isOpen}
        onToggle={setIsOpen}
        autoExpandTools={autoExpandTools}
        onAutoExpandChange={setAutoExpandTools}
        showRawParameters={showRawParameters}
        onShowRawParametersChange={setShowRawParameters}
        autoScrollToBottom={autoScrollToBottom}
        onAutoScrollChange={setAutoScrollToBottom}
        isMobile={false}
      />
    </div>
  );
};
InteractiveDemo.parameters = {
  docs: {
    description: {
      story: 'A fully interactive demo showing how settings persist and update in real-time.'
    }
  }
};