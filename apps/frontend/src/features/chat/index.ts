/**
 * Chat Feature - Main export file
 * Following Bulletproof React feature-slice pattern
 */

// Types
export type {
  ChatMessage,
  ChatInterfaceProps,
  MessageComponentProps,
  SessionProtection,
  ChatConfig,
  ChatEvents,
} from './types';

// API
export { chatAPI, ChatAPI } from './api';

// Hooks
export { useChatSession } from './hooks/useChatSession';

// Components
export { ChatInterface } from './components/ChatInterface';
export { ClaudeLogo } from './components/ClaudeLogo';
export { ClaudeStatus } from './components/ClaudeStatus';
export { MicButton } from './components/MicButton';