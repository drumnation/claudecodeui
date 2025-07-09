import React from 'react';
import {CopyToClipboardButton} from './CopyToClipboardButton';

export default {
  title: 'Components/CopyToClipboardButton',
  component: CopyToClipboardButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A reusable copy to clipboard button component with multiple states and responsive design.',
      },
    },
  },
  argTypes: {
    size: {
      control: {type: 'select'},
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    variant: {
      control: {type: 'select'},
      options: ['default', 'success', 'error'],
      description: 'Visual variant of the button',
    },
    textToCopy: {
      control: {type: 'text'},
      description: 'Text to copy to clipboard',
    },
  },
};

// Sample message objects for testing
const sampleMessages = {
  userMessage: {
    type: 'user',
    content: 'Hello, can you help me with React components?',
  },
  assistantMessage: {
    type: 'assistant',
    content:
      "Of course! I'd be happy to help you with React components. What specific aspect would you like to learn about?",
  },
  assistantWithToolUse: {
    type: 'assistant',
    content: [
      {
        type: 'text',
        text: "I'll help you check the file system for React components.",
      },
      {
        type: 'tool_use',
        name: 'bash',
        input: {command: 'find . -name "*.jsx" -type f'},
      },
    ],
  },
  toolResult: {
    type: 'tool_result',
    content:
      './src/components/Button.jsx\n./src/components/Modal.jsx\n./src/components/Form.jsx',
  },
};

export const Default = {
  args: {
    textToCopy: 'This is some sample text to copy!',
    size: 'sm',
  },
};

export const DifferentSizes = {
  render: () => (
    <div className="flex items-center gap-4">
      <CopyToClipboardButton size="xs" textToCopy="Extra small button" />
      <CopyToClipboardButton size="sm" textToCopy="Small button" />
      <CopyToClipboardButton size="md" textToCopy="Medium button" />
      <CopyToClipboardButton size="lg" textToCopy="Large button" />
    </div>
  ),
};

export const DifferentVariants = {
  render: () => (
    <div className="flex items-center gap-4">
      <CopyToClipboardButton variant="default" textToCopy="Default variant" />
      <CopyToClipboardButton variant="success" textToCopy="Success variant" />
      <CopyToClipboardButton variant="error" textToCopy="Error variant" />
    </div>
  ),
};

export const WithMessages = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">User Message:</span>
        <CopyToClipboardButton message={sampleMessages.userMessage} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Assistant Message:</span>
        <CopyToClipboardButton message={sampleMessages.assistantMessage} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Tool Use Message:</span>
        <CopyToClipboardButton message={sampleMessages.assistantWithToolUse} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Tool Result:</span>
        <CopyToClipboardButton message={sampleMessages.toolResult} />
      </div>
    </div>
  ),
};

export const Interactive = {
  args: {
    textToCopy: 'Click me to copy this text!',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Try clicking the button to see the copy functionality in action.',
      },
    },
  },
};

export const MobileViewport = {
  args: {
    textToCopy: 'Mobile-friendly copy button',
    size: 'sm',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'This story demonstrates the mobile-friendly touch targets and responsive behavior.',
      },
    },
  },
};

export const DarkMode = {
  args: {
    textToCopy: 'Dark mode copy button',
    size: 'md',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Copy button in dark mode with proper contrast and theming.',
      },
    },
  },
};

export const InMessageContext = {
  render: () => (
    <div className="max-w-md">
      <div className="group bg-gray-50 dark:bg-gray-800 rounded-lg p-4 relative">
        <div className="text-sm text-gray-900 dark:text-gray-100 mb-2">
          This is a sample message with a copy button integrated into the
          layout.
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>2:34 PM</span>
          <CopyToClipboardButton
            textToCopy="This is a sample message with a copy button integrated into the layout."
            size="xs"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Example of how the copy button integrates within a message context with proper spacing and alignment.',
      },
    },
  },
};

export const AccessibilityDemo = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Tab through these buttons and use Enter/Space to activate. Screen
        readers will announce the state changes.
      </div>
      <div className="flex flex-col gap-2">
        <CopyToClipboardButton
          textToCopy="Accessible button 1"
          ariaLabel="Copy first sample text to clipboard"
        />
        <CopyToClipboardButton
          textToCopy="Accessible button 2"
          ariaLabel="Copy second sample text to clipboard"
        />
        <CopyToClipboardButton
          textToCopy="Accessible button 3"
          ariaLabel="Copy third sample text to clipboard"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates accessibility features including keyboard navigation, ARIA labels, and screen reader support.',
      },
    },
  },
};
