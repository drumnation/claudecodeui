import React from 'react';
import { NewProjectModal } from './NewProjectModal';

export default {
  title: 'Features/Projects/Components/NewProjectModal',
  component: NewProjectModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      autodocs: true,
      description: {
        component: 'NewProjectModal provides a form to create new projects with both desktop and mobile layouts.'
      }
    }
  },
  argTypes: {
    newProjectPath: {
      description: 'Current value of the project path input',
      control: 'text'
    },
    creatingProject: {
      description: 'Whether the project is currently being created',
      control: 'boolean'
    },
    setNewProjectPath: {
      description: 'Callback to update the project path',
      action: 'pathChanged'
    },
    onCreateProject: {
      description: 'Callback to create the project',
      action: 'createProject'
    },
    onCancel: {
      description: 'Callback to cancel project creation',
      action: 'cancel'
    }
  }
};

const Template = (args) => (
  <div style={{ height: '400px', position: 'relative' }}>
    <NewProjectModal {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  newProjectPath: '',
  creatingProject: false,
  setNewProjectPath: () => {}
};

export const WithPath = Template.bind({});
WithPath.args = {
  ...Default.args,
  newProjectPath: '/Users/developer/new-project'
};

export const Creating = Template.bind({});
Creating.args = {
  ...Default.args,
  newProjectPath: '/Users/developer/new-project',
  creatingProject: true
};

export const EmptyPath = Template.bind({});
EmptyPath.args = {
  ...Default.args,
  newProjectPath: ''
};

export const RelativePath = Template.bind({});
RelativePath.args = {
  ...Default.args,
  newProjectPath: 'my-new-project'
};

export const LongPath = Template.bind({});
LongPath.args = {
  ...Default.args,
  newProjectPath: '/Users/developer/projects/very/long/path/to/my/new/project/folder'
};

export const MobileView = Template.bind({});
MobileView.args = {
  ...Default.args
};
MobileView.parameters = {
  viewport: {
    defaultViewport: 'iphone12'
  }
};