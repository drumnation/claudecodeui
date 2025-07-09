export interface MessagesAreaProps {
  chatMessages: any[];
  isLoadingSessionMessages: boolean;
  visibleMessages: any[];
  isUserScrolledUp: boolean;
  scrollToBottom: () => void;
  onFileOpen?: (file: any) => void;
  onShowSettings?: () => void;
  autoExpandTools?: boolean;
  showRawParameters?: boolean;
  createDiff?: (oldText: string, newText: string) => any;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isStreaming?: boolean;
  loadMoreMessages?: () => void;
  hasMoreMessages?: boolean;
  projectName?: string;
  isTruncatedSession?: boolean;
  hasPartialHistory?: boolean;
}
