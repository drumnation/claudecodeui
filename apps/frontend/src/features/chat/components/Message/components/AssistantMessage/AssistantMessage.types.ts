import {ToolInput} from '@/features/chat/components/Tools/Tools.types';

export interface ToolResult {
  content: string;
  isError: boolean;
}

export interface Message {
  id: string;
  type: 'assistant' | 'error';
  content: string;
  timestamp: number;
  isToolUse?: boolean;
  isInteractivePrompt?: boolean;
  toolName?: string;
  toolId?: string;
  toolInput?: ToolInput;
  toolResult?: ToolResult;
}

export interface AssistantMessageProps {
  message: Message;
  isGrouped: boolean;
  onFileOpen?: (filePath: string) => void;
  onShowSettings?: () => void;
  autoExpandTools?: boolean;
  showRawParameters?: boolean;
  createDiff?: (oldContent: string, newContent: string) => string;
}

export interface InteractiveOption {
  number: string;
  text: string;
  isSelected?: boolean;
}
