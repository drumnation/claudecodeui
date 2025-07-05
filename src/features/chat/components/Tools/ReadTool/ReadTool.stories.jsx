import React from 'react';
import ReadTool from '@/features/chat/components/Tools/ReadTool/ReadTool';

export default {
  title: 'Features/Chat/components/Tools/ReadTool',
  component: ReadTool,
  parameters: {
    layout: 'padded',
  },
};

const defaultRenderDefaultTool = () => <div>Default tool fallback</div>;

export const Default = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/src/components/Button.jsx'
    }),
    autoExpandTools: true,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const WithLongPath = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/Users/dmieloch/Dev/experiments/cc-ui/claudecodeui/src/components/ChatInterface/Message/Message.jsx'
    }),
    autoExpandTools: true,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const Collapsed = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/src/App.js'
    }),
    autoExpandTools: false,
    showRawParameters: false,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const WithRawParameters = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/src/index.js',
      offset: 0,
      limit: 100
    }),
    autoExpandTools: true,
    showRawParameters: true,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const RootFile = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/package.json'
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