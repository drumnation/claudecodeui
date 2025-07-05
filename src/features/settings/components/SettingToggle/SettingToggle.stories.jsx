import React from 'react';
import { SettingToggle } from './SettingToggle';

export default {
  title: 'Features/Settings/Components/SettingToggle',
  component: SettingToggle,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the toggle is checked',
    },
    onChange: {
      action: 'changed',
      description: 'Handler for when the toggle state changes',
    },
    title: {
      control: 'text',
      description: 'The title of the setting',
    },
    description: {
      control: 'text',
      description: 'The description of the setting',
    },
  },
};

export const Default = {
  args: {
    title: 'Enable Feature',
    description: 'This allows the application to use this feature',
    checked: false,
  },
};

export const Checked = {
  args: {
    title: 'Enable Feature',
    description: 'This allows the application to use this feature',
    checked: true,
  },
};

export const LongDescription = {
  args: {
    title: 'Complex Setting',
    description: 'This is a very long description that explains in detail what this setting does and how it affects the application behavior when enabled',
    checked: false,
  },
};

export const NoDescription = {
  args: {
    title: 'Simple Toggle',
    description: '',
    checked: false,
  },
};