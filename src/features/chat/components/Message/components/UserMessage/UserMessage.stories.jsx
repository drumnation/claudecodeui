import React from 'react';
import UserMessage from '@/features/chat/components/Message/components/UserMessage/UserMessage';

export default {
  title: 'Features/Chat/Components/Message/UserMessage',
  component: UserMessage,
  parameters: {
    layout: 'centered',
  },
  args: {
    message: {
      content: 'Hello Claude! Can you help me understand how React hooks work?',
      timestamp: new Date().toISOString(),
      type: 'user'
    },
    isGrouped: false
  },
  argTypes: {
    isGrouped: {
      control: 'boolean',
      description: 'Whether the message is grouped with previous messages'
    },
    message: {
      control: 'object',
      description: 'The message object containing content and timestamp'
    }
  }
};

export const Default = {};

export const ShortMessage = {
  args: {
    message: {
      content: 'Hi!',
      timestamp: new Date().toISOString(),
      type: 'user'
    }
  }
};

export const LongMessage = {
  args: {
    message: {
      content: `I need help with a complex problem. I'm building a React application with TypeScript and I'm running into issues with state management. 
      
I've tried using Context API but it's causing unnecessary re-renders. Should I switch to Redux or try something else like Zustand? 

Also, I'm having trouble with TypeScript types for my API responses. How should I structure my types to handle nullable fields?`,
      timestamp: new Date().toISOString(),
      type: 'user'
    }
  }
};

export const GroupedMessage = {
  args: {
    isGrouped: true,
    message: {
      content: 'And one more thing...',
      timestamp: new Date().toISOString(),
      type: 'user'
    }
  }
};

export const MultilineMessage = {
  args: {
    message: {
      content: `Line 1
Line 2
Line 3

New paragraph here.`,
      timestamp: new Date().toISOString(),
      type: 'user'
    }
  }
};

export const WithSpecialCharacters = {
  args: {
    message: {
      content: 'Can you help me with this code? const fn = (x) => x * 2; // <-- is this correct?',
      timestamp: new Date().toISOString(),
      type: 'user'
    }
  }
};