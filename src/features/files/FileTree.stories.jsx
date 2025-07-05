import React from 'react';
import { FileTree } from '@/features/files/FileTree';

export default {
  title: 'Features/Files/FileTree',
  component: FileTree,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    selectedProject: {
      description: 'The currently selected project object',
      control: { type: 'object' }
    }
  }
};

// Mock data for stories
const mockFileStructure = [
  {
    name: 'src',
    path: '/project/src',
    type: 'directory',
    children: [
      {
        name: 'components',
        path: '/project/src/components',
        type: 'directory',
        children: [
          { name: 'Button.jsx', path: '/project/src/components/Button.jsx', type: 'file' },
          { name: 'Card.jsx', path: '/project/src/components/Card.jsx', type: 'file' },
          { name: 'Modal.jsx', path: '/project/src/components/Modal.jsx', type: 'file' }
        ]
      },
      {
        name: 'utils',
        path: '/project/src/utils',
        type: 'directory',
        children: [
          { name: 'helpers.js', path: '/project/src/utils/helpers.js', type: 'file' },
          { name: 'constants.js', path: '/project/src/utils/constants.js', type: 'file' }
        ]
      },
      { name: 'index.js', path: '/project/src/index.js', type: 'file' },
      { name: 'App.jsx', path: '/project/src/App.jsx', type: 'file' }
    ]
  },
  {
    name: 'public',
    path: '/project/public',
    type: 'directory',
    children: [
      { name: 'index.html', path: '/project/public/index.html', type: 'file' },
      { name: 'favicon.ico', path: '/project/public/favicon.ico', type: 'file' },
      { name: 'logo.png', path: '/project/public/logo.png', type: 'file' }
    ]
  },
  { name: 'README.md', path: '/project/README.md', type: 'file' },
  { name: 'package.json', path: '/project/package.json', type: 'file' }
];

// Mock API responses
const setupMockAPI = () => {
  // @ts-ignore
  window.fetch = async (url) => {
    if (url.includes('/api/projects/')) {
      return {
        ok: true,
        json: async () => mockFileStructure,
        text: async () => JSON.stringify(mockFileStructure)
      };
    }
    return {
      ok: false,
      text: async () => 'Not found'
    };
  };
};

export const Default = {
  args: {
    selectedProject: {
      name: 'my-project',
      path: '/path/to/project'
    }
  },
  decorators: [
    (Story) => {
      setupMockAPI();
      return <Story />;
    }
  ]
};

export const Loading = {
  args: {
    selectedProject: null
  }
};

export const Empty = {
  args: {
    selectedProject: {
      name: 'empty-project',
      path: '/path/to/empty'
    }
  },
  decorators: [
    (Story) => {
      // @ts-ignore
      window.fetch = async () => ({
        ok: true,
        json: async () => [],
        text: async () => '[]'
      });
      return <Story />;
    }
  ]
};

export const Error = {
  args: {
    selectedProject: {
      name: 'error-project',
      path: '/path/to/error'
    }
  },
  decorators: [
    (Story) => {
      // @ts-ignore
      window.fetch = async () => ({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });
      return <Story />;
    }
  ]
};