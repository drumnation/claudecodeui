import React from 'react';
import { ImageViewer } from '@/features/files/components/ImageViewer/ImageViewer';

export default {
  title: 'Features/Files/components/ImageViewer',
  component: ImageViewer,
  parameters: {
    docs: {
      description: {
        component: 'A modal component for viewing images with error handling and loading states.'
      }
    }
  },
  argTypes: {
    file: {
      description: 'File object containing projectName, path, and name',
      control: { type: 'object' }
    },
    onClose: {
      description: 'Callback function called when closing the viewer',
      action: 'closed'
    }
  }
};

const Template = (args) => <ImageViewer {...args} />;

export const Default = Template.bind({});
Default.args = {
  file: {
    projectName: 'my-project',
    path: '/images/sample.jpg',
    name: 'sample.jpg'
  }
};

export const LongFileName = Template.bind({});
LongFileName.args = {
  file: {
    projectName: 'my-project',
    path: '/assets/images/very-long-file-name-that-might-overflow.jpg',
    name: 'very-long-file-name-that-might-overflow.jpg'
  }
};

export const WithError = Template.bind({});
WithError.args = {
  file: {
    projectName: 'my-project',
    path: '/images/non-existent.jpg',
    name: 'non-existent.jpg'
  }
};
WithError.parameters = {
  docs: {
    description: {
      story: 'Shows the error state when an image fails to load'
    }
  }
};

export const DarkMode = Template.bind({});
DarkMode.args = {
  file: {
    projectName: 'my-project',
    path: '/images/dark-mode-sample.jpg',
    name: 'dark-mode-sample.jpg'
  }
};
DarkMode.parameters = {
  backgrounds: { default: 'dark' },
  docs: {
    description: {
      story: 'ImageViewer in dark mode'
    }
  }
};