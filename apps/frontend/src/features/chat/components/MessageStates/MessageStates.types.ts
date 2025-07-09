export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: number;
}

export interface MessageStatesProps {
  isLoadingSessionMessages: boolean;
  chatMessages: ChatMessage[];
}
