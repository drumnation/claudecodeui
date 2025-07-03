/**
 * WebSocket Types - Shared WebSocket communication contracts
 * Used across features for real-time communication
 */

// Base WebSocket message structure
export interface WSMessage {
  type: string;
  data?: any;
  timestamp?: string | number;
  id?: string;
  
  // Chat-related properties
  projectName?: string;
  sessionId?: string;
  message?: string;
  content?: any;
  
  // Session management
  projects?: any[];
  sessions?: any[];
  summary?: string;
  
  // Tool-related properties
  tool_name?: string;
  tool_input?: any;
  tool_result?: any;
  toolError?: boolean;
  inline?: boolean;
  
  // Server management
  projectPath?: string;
  script?: string;
  scripts?: string[];
  servers?: any[];
  status?: string;
  error?: string;
  stream?: 'stdout' | 'stderr';
  
  // File operations
  filePath?: string;
  files?: any[];
  dirPath?: string;
  
  // Status and metadata
  progress?: number;
  stage?: string;
  metadata?: Record<string, any>;
}

// WebSocket connection states
export type WSConnectionState = 
  | 'connecting'
  | 'connected' 
  | 'disconnected'
  | 'error'
  | 'reconnecting';

// WebSocket event handlers
export interface WSEventHandlers {
  onMessage: (message: WSMessage) => void;
  onConnectionChange: (state: WSConnectionState) => void;
  onError: (error: Error) => void;
  onReconnect: () => void;
}

// WebSocket configuration
export interface WSConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  pingInterval: number;
  binaryType?: BinaryType;
}