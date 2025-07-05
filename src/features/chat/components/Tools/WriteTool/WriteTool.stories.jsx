import React from 'react';
import WriteTool from '@/features/chat/components/Tools/WriteTool/WriteTool';

export default {
  title: 'Features/Chat/Components/Message/Tools/WriteTool',
  component: WriteTool,
  parameters: {
    layout: 'padded',
  },
};

const defaultCreateDiff = (oldString, newString) => {
  const newLines = newString.split('\n');
  return newLines.map(line => ({ type: 'added', content: line }));
};

const defaultRenderDefaultTool = () => <div>Default tool fallback</div>;

export const Default = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/src/components/NewComponent.jsx',
      content: 'import React from "react";\n\nconst NewComponent = () => {\n  return <div>Hello World</div>;\n};\n\nexport default NewComponent;'
    }),
    autoExpandTools: true,
    showRawParameters: false,
    onFileOpen: (path, diff) => console.log('File open:', path, diff),
    createDiff: defaultCreateDiff,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const WithLongContent = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/src/utils/helper.js',
      content: `// Helper utilities
export function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}`
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
      file_path: '/README.md',
      content: '# My Project\n\nThis is a sample project.'
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
      file_path: '/package.json',
      content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}'
    }),
    autoExpandTools: true,
    showRawParameters: true,
    onFileOpen: (path, diff) => console.log('File open:', path, diff),
    createDiff: defaultCreateDiff,
    renderDefaultTool: defaultRenderDefaultTool,
  },
};

export const EmptyFile = {
  args: {
    toolInput: JSON.stringify({
      file_path: '/.gitignore',
      content: ''
    }),
    autoExpandTools: true,
    showRawParameters: false,
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