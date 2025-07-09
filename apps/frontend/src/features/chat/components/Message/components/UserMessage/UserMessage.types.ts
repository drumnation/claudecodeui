export interface UserMessage {
  id: string;
  type: 'user';
  content: string;
  timestamp: number;
  isQueued?: boolean;
}

export interface UserMessageProps {
  message: UserMessage;
  isGrouped: boolean;
}
