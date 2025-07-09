// QuickSettingsPanel.mobile.stories.jsx
import React, {useState} from 'react';
import {QuickSettingsPanel} from '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel';
import {ThemeProvider} from '@/contexts/ThemeContext';

export default {
  title: 'Features/Chat/Components/Mobile/QuickSettingsPanel',
  component: QuickSettingsPanel,
  parameters: {
    layout: 'padded',
    docs: {
      autodocs: true,
      description: {
        component:
          'Mobile version of a slide-out settings panel that provides quick access to appearance and behavior settings including dark mode, tool display options, view options, and whisper dictation modes.',
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
        <div style={{height: '100vh', position: 'relative'}}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the panel is open or closed',
    },
    onToggle: {
      action: 'toggle',
      description: 'Callback when the panel is toggled',
    },
    autoExpandTools: {
      control: 'boolean',
      description: 'Whether tools should auto-expand',
    },
    onAutoExpandChange: {
      action: 'autoExpandChange',
      description: 'Callback when auto-expand setting changes',
    },
    showRawParameters: {
      control: 'boolean',
      description: 'Whether to show raw parameters',
    },
    onShowRawParametersChange: {
      action: 'showRawParametersChange',
      description: 'Callback when show raw parameters setting changes',
    },
    autoScrollToBottom: {
      control: 'boolean',
      description: 'Whether to auto-scroll to bottom',
    },
    onAutoScrollChange: {
      action: 'autoScrollChange',
      description: 'Callback when auto-scroll setting changes',
    },
    isMobile: {
      control: 'boolean',
      description: 'Whether the panel is in mobile mode',
    },
  },
};

const Template = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.isOpen);
  const [autoExpandTools, setAutoExpandTools] = useState(args.autoExpandTools);
  const [showRawParameters, setShowRawParameters] = useState(
    args.showRawParameters,
  );
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(
    args.autoScrollToBottom,
  );

  return (
    <QuickSettingsPanel
      {...args}
      isOpen={isOpen}
      onToggle={(newState: any) => {
        setIsOpen(newState);
        args.onToggle(newState);
      }}
      autoExpandTools={autoExpandTools}
      onAutoExpandChange={(value: any) => {
        setAutoExpandTools(value);
        args.onAutoExpandChange(value);
      }}
      showRawParameters={showRawParameters}
      onShowRawParametersChange={(value: any) => {
        setShowRawParameters(value);
        args.onShowRawParametersChange(value);
      }}
      autoScrollToBottom={autoScrollToBottom}
      onAutoScrollChange={(value: any) => {
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
  isMobile: true,
};

export const Open = Template.bind({});
Open.args = {
  ...Default.args,
  isOpen: true,
};

export const WithAllSettingsEnabled = Template.bind({});
WithAllSettingsEnabled.args = {
  isOpen: true,
  autoExpandTools: true,
  showRawParameters: true,
  autoScrollToBottom: true,
  isMobile: true,
};

export const DarkMode = Template.bind({});
DarkMode.args = {
  ...Default.args,
  isOpen: true,
};
DarkMode.decorators = [
  (Story: any) => {
    React.useEffect(() => {
      document.documentElement.classList.add('dark');
      return () => {
        document.documentElement.classList.remove('dark');
      };
    }, []);

    return (
      <ThemeProvider>
        <div style={{height: '100vh', position: 'relative'}}>
          <Story />
        </div>
      </ThemeProvider>
    );
  },
];

export const InteractiveDemo = Template.bind({});
InteractiveDemo.args = {
  isOpen: false,
  autoExpandTools: true,
  showRawParameters: false,
  autoScrollToBottom: true,
  isMobile: true,
};
