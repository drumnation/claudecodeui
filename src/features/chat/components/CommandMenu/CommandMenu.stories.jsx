import React, { useState } from 'react';
import { CommandMenu } from './CommandMenu';

export default {
  title: 'Features/Chat/components/CommandMenu',
  component: CommandMenu,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    commands: {
      control: 'object',
      description: 'Array of command objects with command and description properties',
    },
    selectedIndex: {
      control: 'number',
      description: 'Index of the currently selected command',
    },
    onSelectCommand: {
      action: 'onSelectCommand',
      description: 'Callback when a command is selected',
    },
    position: {
      control: 'object',
      description: 'Position object for menu placement',
    },
  },
};

const defaultCommands = [
  { command: '/help', description: 'Show available commands and their usage' },
  { command: '/clear', description: 'Clear the current conversation' },
  { command: '/new', description: 'Start a new conversation' },
  { command: '/export', description: 'Export conversation as markdown' },
  { command: '/theme', description: 'Toggle between light and dark theme' },
  { command: '/settings', description: 'Open settings panel' },
  { command: '/shortcuts', description: 'Show keyboard shortcuts' },
];

export const Default = {
  args: {
    commands: defaultCommands,
    selectedIndex: 0,
  },
};

export const WithSelectedItem = {
  args: {
    commands: defaultCommands,
    selectedIndex: 2,
  },
};

export const EmptyState = {
  args: {
    commands: [],
    selectedIndex: -1,
  },
};

export const FewCommands = {
  args: {
    commands: defaultCommands.slice(0, 3),
    selectedIndex: 1,
  },
};

export const ManyCommands = {
  args: {
    commands: [
      ...defaultCommands,
      { command: '/save', description: 'Save current conversation' },
      { command: '/load', description: 'Load a saved conversation' },
      { command: '/share', description: 'Share conversation link' },
      { command: '/copy', description: 'Copy conversation to clipboard' },
      { command: '/reset', description: 'Reset all settings to default' },
      { command: '/feedback', description: 'Send feedback to developers' },
      { command: '/debug', description: 'Show debug information' },
    ],
    selectedIndex: 0,
  },
};

// Interactive example with state management
export const Interactive = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCommand, setSelectedCommand] = useState(null);

  const handleSelectCommand = (cmd) => {
    setSelectedCommand(cmd);
    console.log('Selected command:', cmd);
  };

  // Simulate keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => 
          prev < defaultCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : defaultCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        handleSelectCommand(defaultCommands[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  return (
    <div>
      <CommandMenu
        commands={defaultCommands}
        selectedIndex={selectedIndex}
        onSelectCommand={handleSelectCommand}
      />
      {selectedCommand && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          Selected: <strong>{selectedCommand.command}</strong> - {selectedCommand.description}
        </div>
      )}
    </div>
  );
};