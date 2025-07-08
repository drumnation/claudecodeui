/**
 * Standardized status schema interface for consistent status data across all layers
 */

export enum Phase {
  IDLE = 'idle',
  THINKING = 'thinking',
  PROCESSING = 'processing',
  EXECUTING = 'executing',
  ERROR = 'error',
  COMPLETE = 'complete'
}

export enum ConnectionHealth {
  CONNECTED = 'connected',
  STALE = 'stale',
  DISCONNECTED = 'disconnected'
}

export interface ToolStatus {
  name: string;
  status: 'running' | 'complete' | 'error';
  duration?: number;
  message?: string;
}

export interface TokenUsage {
  input?: number;
  output?: number;
  total?: number;
  cache?: {
    read?: number;
    write?: number;
  };
}

export interface StatusEnvelope {
  // Required fields
  schemaVersion: number;
  timestamp: number;
  phase: Phase;
  message: string;
  
  // Optional fields
  tokens?: TokenUsage;
  canInterrupt?: boolean;
  toolStatus?: ToolStatus;
  contextRemaining?: number;
  connectionHealth?: ConnectionHealth;
  
  // Additional metadata
  sessionId?: string;
  agentId?: string;
  rawOutput?: string;
  debug?: any;
}

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Validates that a status object conforms to the StatusEnvelope schema
 */
export function validateStatusEnvelope(status: any): status is StatusEnvelope {
  if (!status || typeof status !== 'object') {
    return false;
  }
  
  // Check required fields
  if (
    typeof status.schemaVersion !== 'number' ||
    typeof status.timestamp !== 'number' ||
    !Object.values(Phase).includes(status.phase) ||
    typeof status.message !== 'string'
  ) {
    return false;
  }
  
  // Validate optional fields if present
  if (status.tokens && typeof status.tokens !== 'object') {
    return false;
  }
  
  if (status.canInterrupt !== undefined && typeof status.canInterrupt !== 'boolean') {
    return false;
  }
  
  if (status.connectionHealth && !Object.values(ConnectionHealth).includes(status.connectionHealth)) {
    return false;
  }
  
  return true;
}

/**
 * Creates a valid StatusEnvelope with default values
 */
export function createStatusEnvelope(partial: Partial<StatusEnvelope> = {}): StatusEnvelope {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    timestamp: Date.now(),
    phase: Phase.IDLE,
    message: '',
    ...partial
  };
}

/**
 * Ensures backwards compatibility with older status formats
 */
export function normalizeStatus(status: any): StatusEnvelope {
  if (validateStatusEnvelope(status)) {
    return status;
  }
  
  // Handle legacy status formats
  const normalized = createStatusEnvelope({
    phase: status.phase || status.type || Phase.PROCESSING,
    message: status.message || status.status || status.text || 'Processing...',
    tokens: status.tokens || status.tokenCount || undefined,
    canInterrupt: status.canInterrupt ?? status.canCancel ?? undefined,
    toolStatus: status.toolStatus || status.tool || undefined,
    contextRemaining: status.contextRemaining || status.remainingContext || undefined
  });
  
  return normalized;
}

/**
 * Type guard for connection health states
 */
export function isHealthy(health: ConnectionHealth): boolean {
  return health === ConnectionHealth.CONNECTED;
}

/**
 * Utility to merge status updates while preserving required fields
 */
export function mergeStatusUpdate(
  current: StatusEnvelope,
  update: Partial<StatusEnvelope>
): StatusEnvelope {
  return {
    ...current,
    ...update,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    timestamp: Date.now()
  };
}