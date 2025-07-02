// Types
export type {
  ToolsSettings,
  SpawnClaudeOptions,
  ClaudeResponse,
  ClaudeStatusData,
  SessionInfo,
  WebSocketMessage,
} from './claude-cli.types.js';

// Handlers (main exports for WebSocket integration)
export {
  spawnClaude,
  handleAbortSession,
  handleMarkManuallyEdited,
  handleClearManualEdit,
  handleGenerateSummary,
} from './claude-cli.handlers.js';

// Service functions (for direct use if needed)
export {
  createClaudeProcess,
  handleProcessOutput,
  generateSessionSummary,
  abortClaudeSession,
} from './claude-cli.service.js';

// Utils (for session management and helpers)
export {
  sessionManager,
  parseStatusMessage,
  isStatusMessage,
  isInteractivePrompt,
  buildClaudeArgs,
  formatCommandForLogging,
} from './claude-cli.utils.js';

// Re-export convenient aliases for backward compatibility
export {
  handleMarkManuallyEdited as markSessionAsManuallyEdited,
  handleClearManualEdit as clearManualEditFlag,
} from './claude-cli.handlers.js';

// Note: spawnClaude and abortClaudeSession are already exported above

// Export WebSocket handler
export {createChatHandler} from './claude-cli.websocket.js';
