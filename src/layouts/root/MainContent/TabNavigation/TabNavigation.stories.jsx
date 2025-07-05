/**
 * TabNavigation.stories.jsx - Storybook stories for TabNavigation component
 */

import React from 'react';
import { TabNavigation } from '@/layouts/root/MainContent/TabNavigation/TabNavigation';

export default {
  title: 'Layouts/Root/MainContent/TabNavigation',
  component: TabNavigation,
};

const Template = (args) => <TabNavigation {...args} />;

export const Default = Template.bind({});
Default.args = {
  activeTab: 'chat',
  onTabChange: (tab) => console.log('Tab changed to:', tab)
};

export const ShellActive = Template.bind({});
ShellActive.args = {
  activeTab: 'shell',
  onTabChange: (tab) => console.log('Tab changed to:', tab)
};

export const FilesActive = Template.bind({});
FilesActive.args = {
  activeTab: 'files',
  onTabChange: (tab) => console.log('Tab changed to:', tab)
};

export const GitActive = Template.bind({});
GitActive.args = {
  activeTab: 'git',
  onTabChange: (tab) => console.log('Tab changed to:', tab)
};

export const PreviewActive = Template.bind({});
PreviewActive.args = {
  activeTab: 'preview',
  onTabChange: (tab) => console.log('Tab changed to:', tab)
};