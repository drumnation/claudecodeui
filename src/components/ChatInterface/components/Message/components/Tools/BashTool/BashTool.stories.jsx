import React from 'react';
import BashTool from './BashTool';

export default {
  title: 'ChatInterface/Message/Tools/BashTool',
  component: BashTool,
  parameters: {
    layout: 'padded',
  },
};

const defaultRenderDefaultTool = () => <div>Default tool fallback</div>;

export const Default = {
  args: {
    toolInput: JSON.stringify({
      command: 'npm install react',
      description: 'Installing React package'
    }),
    autoExpandTools: true,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const WithLongCommand = {
  args: {
    toolInput: JSON.stringify({
      command: 'git log --pretty=format:"%h %ad | %s%d [%an]" --graph --date=short --all',
      description: 'Viewing git history with custom formatting'
    }),
    autoExpandTools: true,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const Collapsed = {
  args: {
    toolInput: JSON.stringify({
      command: 'ls -la',
      description: 'List all files with details'
    }),
    autoExpandTools: false,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const WithRawParameters = {
  args: {
    toolInput: JSON.stringify({
      command: 'echo "Hello World"',
      description: 'Simple echo command'
    }),
    autoExpandTools: true,
    showRawParameters: true,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const NoDescription = {
  args: {
    toolInput: JSON.stringify({
      command: 'pwd'
    }),
    autoExpandTools: true,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const InvalidInput = {
  args: {
    toolInput: 'invalid json',
    autoExpandTools: true,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};