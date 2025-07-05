import React from 'react';
import EditTool from '@/features/chat/components/Tools/EditTool/EditTool';

export default {
  title: 'Features/Chat/Components/Message/Tools/EditTool',
  component: EditTool,
  parameters: {
    layout: 'padded',
  },
};

const defaultCreateDiff = (oldString, newString) => {
  const oldLines = oldString.split('\n');
  const newLines = newString.split('\n');
  const diff = [];
  
  // Simple diff for demo
  oldLines.forEach(line => {
    diff.push({ type: 'removed', content: line });
  });
  newLines.forEach(line => {
    diff.push({ type: 'added', content: line });
  });
  
  return diff;
};

const defaultRenderDefaultTool = () => <div>Default tool fallback</div>;

export const Default = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/src/components/Button.jsx',
      old_string: 'const Button = () => {\n  return <button>Click me</button>;\n};',
      new_string: 'const Button = ({ onClick, children }) => {\n  return <button onClick={onClick}>{children}</button>;\n};'
    }),
    autoExpandTools: true,
    showRawParameters: false,
    onFileOpen: (path, diff) => console.log('File open:', path, diff),
    createDiff: defaultCreateDiff,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const WithLongPath = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/Users/dmieloch/Dev/experiments/cc-ui/claudecodeui/src/components/ChatInterface/Message.jsx',
      old_string: 'import React from "react";',
      new_string: 'import React, { useState } from "react";'
    }),
    autoExpandTools: true,
    showRawParameters: false,
    onFileOpen: (path, diff) => console.log('File open:', path, diff),
    createDiff: defaultCreateDiff,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const Collapsed = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/src/App.js',
      old_string: 'function App() {',
      new_string: 'const App = () => {'
    }),
    autoExpandTools: false,
    showRawParameters: false,
    onFileOpen: (path, diff) => console.log('File open:', path, diff),
    createDiff: defaultCreateDiff,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const WithRawParameters = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/src/index.js',
      old_string: 'ReactDOM.render(<App />, document.getElementById("root"));',
      new_string: 'const root = ReactDOM.createRoot(document.getElementById("root"));\nroot.render(<App />);'
    }),
    autoExpandTools: true,
    showRawParameters: true,
    onFileOpen: (path, diff) => console.log('File open:', path, diff),
    createDiff: defaultCreateDiff,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const InvalidInput = {
  args: {
    toolInput: 'invalid json',
    autoExpandTools: true,
    showRawParameters: false,
    onFileOpen: (path, diff) => console.log('File open:', path, diff),
    createDiff: defaultCreateDiff,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};