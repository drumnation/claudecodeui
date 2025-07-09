export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  tools?: ToolResult[];
  error?: boolean;
  metadata?: Record<string, any>;
}

export interface ToolResult {
  type: string;
  name: string;
  input?: any;
  output?: any;
  status?: 'pending' | 'success' | 'error';
  timestamp?: Date;
}

export interface ChatInterfaceProps {
  selectedProject: {
    name: string;
    path: string;
    fullPath?: string;
  } | null;
  sessionHistory: SessionHistoryItem[];
  sessionId?: string;
  onSessionHistoryLoad?: () => void;
}

export interface ChatInterfaceComponentProps extends ChatInterfaceProps {
  sendMessage: (message: string) => void;
  messages: any[];
  connectionHealth: any;
  onFileOpen?: (file: any) => void;
  onInputFocusChange?: (focused: boolean) => void;
  onSessionActive?: (sessionId: string) => void;
  onSessionInactive?: (sessionId: string) => void;
  onReplaceTemporarySession?: (tempId: string, realId: string) => void;
  onNavigateToSession?: (sessionId: string) => void;
  onShowSettings?: () => void;
  autoExpandTools?: boolean;
  showRawParameters?: boolean;
  autoScrollToBottom?: boolean;
}

export interface SessionHistoryItem {
  id: string;
  projectName: string;
  title?: string;
  timestamp: Date;
  messages: Message[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  streamingMessage: string | null;
  currentTool: string | null;
  toolProgress: number;
}

export interface ClaudeStatusInfo {
  isConnected: boolean;
  isProcessing: boolean;
  currentTool?: string;
  progress?: number;
  error?: string;
}

export interface QuickSettings {
  modelId: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  streaming: boolean;
}

export interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showMicButton?: boolean;
  showToolsButton?: boolean;
  onToolsClick?: () => void;
}

export interface MessageComponentProps {
  message: Message;
  isStreaming?: boolean;
  onRetry?: () => void;
  onEdit?: (content: string) => void;
  onCopy?: () => void;
}
