import React from 'react';
import { CodeEditor } from '@/shared-components/CodeEditor/CodeEditor';

export default {
  title: 'Shared Components/CodeEditor',
  component: CodeEditor,
  parameters: {
    layout: 'fullscreen',
  },
};

// Mock file data
const mockJavaScriptFile = {
  name: 'example.js',
  path: '/src/components/example.js',
  projectName: 'my-project',
  diffInfo: null
};

const mockPythonFile = {
  name: 'script.py',
  path: '/scripts/script.py',
  projectName: 'my-project',
  diffInfo: null
};

const mockFileWithDiff = {
  name: 'updated.jsx',
  path: '/src/components/updated.jsx',
  projectName: 'my-project',
  diffInfo: {
    old_string: 'const oldValue = "hello";',
    new_string: 'const newValue = "world";'
  }
};

// Template
const Template = (args) => <CodeEditor {...args} />;

// Stories
export const JavaScript = Template.bind({});
JavaScript.args = {
  file: mockJavaScriptFile,
  projectPath: '/Users/demo/projects/my-project',
  onClose: () => console.log('Editor closed')
};

export const Python = Template.bind({});
Python.args = {
  file: mockPythonFile,
  projectPath: '/Users/demo/projects/my-project',
  onClose: () => console.log('Editor closed')
};

export const WithDiffInfo = Template.bind({});
WithDiffInfo.args = {
  file: mockFileWithDiff,
  projectPath: '/Users/demo/projects/my-project',
  onClose: () => console.log('Editor closed')
};

export const DarkMode = Template.bind({});
DarkMode.args = {
  file: mockJavaScriptFile,
  projectPath: '/Users/demo/projects/my-project',
  onClose: () => console.log('Editor closed')
};
DarkMode.parameters = {
  backgrounds: { default: 'dark' }
};

export const LightMode = Template.bind({});
LightMode.args = {
  file: mockJavaScriptFile,
  projectPath: '/Users/demo/projects/my-project',
  onClose: () => console.log('Editor closed')
};
LightMode.parameters = {
  backgrounds: { default: 'light' }
};

export const FullscreenMode = Template.bind({});
FullscreenMode.args = {
  file: mockJavaScriptFile,
  projectPath: '/Users/demo/projects/my-project',
  onClose: () => console.log('Editor closed')
};
FullscreenMode.play = async ({ canvasElement }) => {
  // Simulate clicking fullscreen button after mount
  setTimeout(() => {
    const fullscreenBtn = canvasElement.querySelector('[title="Fullscreen"]');
    if (fullscreenBtn) fullscreenBtn.click();
  }, 1000);
};

export const LoadingState = () => {
  // Mock a loading state by providing a component that stays in loading
  const LoadingEditor = () => {
    const [loading] = React.useState(true);
    
    if (loading) {
      return (
        <div className="fixed inset-0 z-50 md:bg-black/50 md:flex md:items-center md:justify-center">
          <div className="w-full h-full md:rounded-lg md:w-auto md:h-auto p-8 flex items-center justify-center bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-white">Loading example.js...</span>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return <LoadingEditor />;
};

export const ErrorState = Template.bind({});
ErrorState.args = {
  file: {
    name: 'error.js',
    path: '/nonexistent/error.js',
    projectName: 'error-project',
    diffInfo: null
  },
  projectPath: '/nonexistent/path',
  onClose: () => console.log('Editor closed')
};