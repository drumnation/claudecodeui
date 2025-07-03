export { default as ChatInterface } from './ChatInterface';
export type { 
  ChatInterfaceProps, 
  ChatMessage, 
  MessageComponentProps 
} from './ChatInterface';

// Re-export sub-components for direct access if needed
export { MessageComponent, ToolDisplay, InputArea } from './components';
export type { MessageComponentProps, ToolDisplayProps, InputAreaProps } from './components';