import React from 'react';
import { NewBranchModal } from '@/features/git/NewBranchModal/NewBranchModal';

export default {
  title: 'Features/Git/NewBranchModal',
  component: NewBranchModal,
  parameters: {
    layout: 'centered',
  },
};

const Template = (args) => <NewBranchModal {...args} />;

export const Default = Template.bind({});
Default.args = {
  show: true,
  currentBranch: 'main',
  newBranchName: '',
  isCreating: false,
  onClose: () => console.log('Close modal'),
  onBranchNameChange: (name) => console.log('Branch name:', name),
  onCreate: () => console.log('Create branch'),
};

export const WithBranchName = Template.bind({});
WithBranchName.args = {
  ...Default.args,
  newBranchName: 'feature/new-feature',
};

export const Creating = Template.bind({});
Creating.args = {
  ...Default.args,
  newBranchName: 'feature/new-feature',
  isCreating: true,
};

export const Hidden = Template.bind({});
Hidden.args = {
  ...Default.args,
  show: false,
};