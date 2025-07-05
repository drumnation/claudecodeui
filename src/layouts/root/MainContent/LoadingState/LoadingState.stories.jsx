/**
 * LoadingState.stories.jsx - Storybook stories for LoadingState component
 */

import React from 'react';
import { LoadingState } from '@/layouts/root/MainContent/LoadingState/LoadingState';

export default {
  title: 'Layouts/Root/MainContent/LoadingState',
  component: LoadingState,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template = (args) => <LoadingState {...args} />;

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