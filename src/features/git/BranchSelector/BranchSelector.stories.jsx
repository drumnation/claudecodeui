import React from 'react';
import { BranchSelector } from '@/features/git/BranchSelector/BranchSelector';

export default {
  title: 'Features/Git/BranchSelector',
  component: BranchSelector,
  parameters: {
    layout: 'centered',
  },
};

const Template = (args) => (
  <div style={{ position: 'relative', padding: '20px' }}>
    <BranchSelector {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  currentBranch: 'main',
  branches: ['main', 'develop', 'feature/new-feature', 'bugfix/fix-issue'],
  showDropdown: false,
  onToggleDropdown: () => console.log('Toggle dropdown'),
  onSwitchBranch: (branch) => console.log('Switch to branch:', branch),
  onCreateNewBranch: () => console.log('Create new branch'),
};

export const WithDropdownOpen = Template.bind({});
WithDropdownOpen.args = {
  ...Default.args,
  showDropdown: true,
};

export const WithLongBranchNames = Template.bind({});
WithLongBranchNames.args = {
  currentBranch: 'feature/very-long-branch-name-that-might-overflow',
  branches: [
    'main',
    'feature/very-long-branch-name-that-might-overflow',
    'feature/another-extremely-long-branch-name',
    'bugfix/yet-another-super-long-branch-name',
  ],
  showDropdown: true,
};