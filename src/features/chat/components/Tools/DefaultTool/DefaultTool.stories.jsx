import React from 'react';
import DefaultTool from '@/features/chat/components/Tools/DefaultTool/DefaultTool';

export default {
  title: 'Features/Chat/components/Tools/DefaultTool',
  component: DefaultTool,
  parameters: {
    layout: 'padded',
  },
};

export const Default = {
  args: {
    toolInput: JSON.stringify({ param1: 'value1', param2: 'value2' }, null, 2),
    autoExpandTools: true,
  },
};

export const Collapsed = {
  args: {
    toolInput: JSON.stringify({ param1: 'value1', param2: 'value2' }, null, 2),
    autoExpandTools: false,
  },
};

export const WithComplexInput = {
  args: {
    toolInput: JSON.stringify({
      files: ['file1.js', 'file2.js'],
      options: {
        recursive: true,
        force: false,
      },
      metadata: {
        timestamp: '2024-01-01T00:00:00Z',
        user: 'admin',
      }
    }, null, 2),
    autoExpandTools: true,
  },
};

export const WithPlainText = {
  args: {
    toolInput: 'Plain text input without JSON formatting',
    autoExpandTools: true,
  },
};