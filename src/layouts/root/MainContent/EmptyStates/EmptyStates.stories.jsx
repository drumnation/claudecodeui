/**
 * EmptyStates.stories.jsx - Storybook stories for EmptyStates component
 */

import React from 'react';
import { NoProjectSelected } from '@/layouts/root/MainContent/EmptyStates/EmptyStates';

export default {
  title: 'Layouts/Root/MainContent/EmptyStates',
  component: NoProjectSelected,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template = (args) => <NoProjectSelected {...args} />;

export const Desktop = Template.bind({});
Desktop.args = {
  isMobile: false,
  onMenuClick: () => console.log('Menu clicked')
};

export const Mobile = Template.bind({});
Mobile.args = {
  isMobile: true,
  onMenuClick: () => console.log('Menu clicked')
};