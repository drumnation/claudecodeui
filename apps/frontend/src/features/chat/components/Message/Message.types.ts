export interface MessageContent {
  type?: string;
  text?: string;
  tool_use?: {
    tool_name: string;
    parameters?: any;
  };
  tool_result?: {
    tool_name: string;
    result?: any;
    error?: string;
  };
}

export interface Message {
  type: 'user' | 'assistant';
  content: string | MessageContent | MessageContent[];
  id?: string;
  timestamp?: string;
  tokens?: number;
  error?: string;
}

export interface MessageProps {
  message: Message;
  index: number;
  prevMessage?: Message;
  createDiff?: (oldContent: string, newContent: string) => string;
  onFileOpen?: (filePath: string) => void;
  onShowSettings?: () => void;
  autoExpandTools?: boolean;
  showRawParameters?: boolean;
}

export interface MessageHookReturn {
  messageRef: React.RefObject<HTMLDivElement>;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}
