export interface ClaudeStatusProps {
  status?: {
    text?: string;
    tokens?: number;
    tokenDetails?: {
      input?: number;
      output?: number;
      total?: number;
    };
    can_interrupt?: boolean;
    toolStatus?: {
      tool: string;
      count: number;
    };
    contextRemaining?: number;
    phase?: string;
    connectionHealth?: string;
  };
  onAbort?: () => void;
  isLoading: boolean;
  dependencyError?: boolean;
  connectionHealth?: 'connected' | 'stale' | 'disconnected';
  lastUpdateTime?: number;
}

export interface ClaudeStatusHookReturn {
  elapsedTime: number;
  animationPhase: number;
  fakeTokens: number;
  dependencyStatus?: {
    available: boolean;
    version?: string;
    error?: string;
  };
}

export interface ParsedStatusData {
  statusText: string;
  tokens: number;
  tokenDetails?: {
    input?: number;
    output?: number;
    total?: number;
  };
  canInterrupt: boolean;
  toolStatus?: {
    tool: string;
    count: number;
  };
  contextRemaining: number | null;
  phase: string;
  isUsingFallback: boolean;
}

export interface DebugInfo {
  connectionHealth: string;
  timeSinceUpdate: number;
  hasValidStatus: boolean;
  statusKeys: string[];
}
