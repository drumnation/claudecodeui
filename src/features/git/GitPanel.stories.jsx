import React from 'react';
import { GitPanel } from '@/features/git/GitPanel';

export default {
  title: 'Features/Git',
  component: GitPanel,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    isMobile: {
      control: 'boolean',
      description: 'Toggle mobile view',
    },
  },
};

const mockProject = {
  id: '1',
  name: 'test-project',
  path: '/Users/test/projects/test-project',
  technology: 'JavaScript',
  description: 'A test project',
};

const Template = (args) => (
  <div style={{ height: '100vh', display: 'flex' }}>
    <GitPanel {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  selectedProject: mockProject,
  isMobile: false,
};

export const Mobile = Template.bind({});
Mobile.args = {
  selectedProject: mockProject,
  isMobile: true,
};

export const NoProject = Template.bind({});
NoProject.args = {
  selectedProject: null,
  isMobile: false,
};

export const WithMockData = () => {
  // This story would need mock API responses to show actual git data
  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      <GitPanel selectedProject={mockProject} isMobile={false} />
    </div>
  );
};
WithMockData.parameters = {
  docs: {
    description: {
      story: 'This story requires mock API responses to display git status data.',
    },
  },
};