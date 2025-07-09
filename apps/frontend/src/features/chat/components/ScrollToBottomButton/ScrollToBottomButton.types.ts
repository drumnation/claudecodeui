export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: number;
}

export interface ScrollToBottomButtonProps {
  isUserScrolledUp: boolean;
  chatMessages: ChatMessage[];
  scrollToBottom: () => void;
}
