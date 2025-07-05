import React, { useRef } from 'react';
import MessagesArea from './MessagesArea';

export default {
  title: 'Chat/MessagesArea',
  component: MessagesArea,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

const createMockMessage = (type, content, options = {}) => ({
  type,
  content,
  timestamp: new Date(),
  ...options,
});

const Template = (args) => {
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  return (
    <MessagesArea
      {...args}
      scrollContainerRef={scrollContainerRef}
      messagesEndRef={messagesEndRef}
    />
  );
};

export const Empty = Template.bind({});
Empty.args = {
  chatMessages: [],
  isLoadingSessionMessages: false,
  visibleMessages: [],
  isUserScrolledUp: false,
  scrollToBottom: () => console.log('Scroll to bottom'),
};

export const Loading = Template.bind({});
Loading.args = {
  chatMessages: [],
  isLoadingSessionMessages: true,
  visibleMessages: [],
  isUserScrolledUp: false,
  scrollToBottom: () => console.log('Scroll to bottom'),
};

export const WithMessages = Template.bind({});
WithMessages.args = {
  chatMessages: [
    createMockMessage('user', 'Hello Claude!'),
    createMockMessage('assistant', 'Hello! How can I help you today?'),
    createMockMessage('user', 'Can you help me with React?'),
    createMockMessage('assistant', 'Of course! I\'d be happy to help you with React. What specific aspect would you like to explore?'),
  ],
  isLoadingSessionMessages: false,
  visibleMessages: [
    createMockMessage('user', 'Hello Claude!'),
    createMockMessage('assistant', 'Hello! How can I help you today?'),
    createMockMessage('user', 'Can you help me with React?'),
    createMockMessage('assistant', 'Of course! I\'d be happy to help you with React. What specific aspect would you like to explore?'),
  ],
  isUserScrolledUp: false,
  scrollToBottom: () => console.log('Scroll to bottom'),
};

export const WithToolUse = Template.bind({});
WithToolUse.args = {
  chatMessages: [
    createMockMessage('user', 'Can you read the package.json file?'),
    createMockMessage('assistant', '', {
      isToolUse: true,
      toolName: 'Read',
      toolInput: '{"file_path": "/package.json"}',
      toolId: 'tool-123',
      toolResult: {
        content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}',
        isError: false,
        timestamp: new Date(),
      },
    }),
    createMockMessage('assistant', 'I\'ve read the package.json file. Your app is named "my-app" with version 1.0.0.'),
  ],
  isLoadingSessionMessages: false,
  visibleMessages: [
    createMockMessage('user', 'Can you read the package.json file?'),
    createMockMessage('assistant', '', {
      isToolUse: true,
      toolName: 'Read',
      toolInput: '{"file_path": "/package.json"}',
      toolId: 'tool-123',
      toolResult: {
        content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}',
        isError: false,
        timestamp: new Date(),
      },
    }),
    createMockMessage('assistant', 'I\'ve read the package.json file. Your app is named "my-app" with version 1.0.0.'),
  ],
  isUserScrolledUp: false,
  scrollToBottom: () => console.log('Scroll to bottom'),
};

export const ScrolledUp = Template.bind({});
ScrolledUp.args = {
  chatMessages: Array(20).fill(null).map((_, i) => 
    createMockMessage(i % 2 === 0 ? 'user' : 'assistant', `Message ${i + 1}`)
  ),
  isLoadingSessionMessages: false,
  visibleMessages: Array(20).fill(null).map((_, i) => 
    createMockMessage(i % 2 === 0 ? 'user' : 'assistant', `Message ${i + 1}`)
  ),
  isUserScrolledUp: true,
  scrollToBottom: () => console.log('Scroll to bottom'),
};

export const ManyMessages = Template.bind({});
ManyMessages.args = {
  chatMessages: Array(150).fill(null).map((_, i) => 
    createMockMessage(i % 2 === 0 ? 'user' : 'assistant', `Message ${i + 1}`)
  ),
  isLoadingSessionMessages: false,
  visibleMessages: Array(100).fill(null).map((_, i) => 
    createMockMessage(i % 2 === 0 ? 'user' : 'assistant', `Message ${i + 51}`)
  ),
  isUserScrolledUp: false,
  scrollToBottom: () => console.log('Scroll to bottom'),
};

export const WithError = Template.bind({});
WithError.args = {
  chatMessages: [
    createMockMessage('user', 'Do something that fails'),
    createMockMessage('error', 'Error: Failed to execute command'),
    createMockMessage('assistant', 'I apologize for the error. Let me try a different approach.'),
  ],
  isLoadingSessionMessages: false,
  visibleMessages: [
    createMockMessage('user', 'Do something that fails'),
    createMockMessage('error', 'Error: Failed to execute command'),
    createMockMessage('assistant', 'I apologize for the error. Let me try a different approach.'),
  ],
  isUserScrolledUp: false,
  scrollToBottom: () => console.log('Scroll to bottom'),
};

export const InteractivePrompt = Template.bind({});
InteractivePrompt.args = {
  chatMessages: [
    createMockMessage('user', 'Create a new file'),
    createMockMessage('assistant', 'What would you like to name the file?', {
      isInteractivePrompt: true,
    }),
  ],
  isLoadingSessionMessages: false,
  visibleMessages: [
    createMockMessage('user', 'Create a new file'),
    createMockMessage('assistant', 'What would you like to name the file?', {
      isInteractivePrompt: true,
    }),
  ],
  isUserScrolledUp: false,
  scrollToBottom: () => console.log('Scroll to bottom'),
};