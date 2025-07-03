/**
 * Tools Feature - Main export file
 * Following Bulletproof React feature-slice pattern
 */

// Types
export type {
  ToolUse,
  ToolResult,
  ToolMessage,
  ToolExecutionState,
  ToolDisplayConfig,
  ToolPermissions,
  ToolVisualization,
  ClaudeCodeTool,
  ToolParameter,
  ToolExecutionContext,
  ToolResultFormatter,
  FileOperationTool,
  BashExecutionTool,
  SearchTool,
  WebTool,
  TodoTool,
  TaskTool,
  ToolMetrics,
} from './types';

// API
export { toolsAPI, ToolsAPI } from './api';

// Hooks
export { useToolExecution } from './hooks/useToolExecution';

// Components
export { ToolVisualization } from './components/ToolVisualization';
export { ToolUseDisplay } from './components/ToolUseDisplay';

// Utils (to be created)
// export { toolFormatters } from './utils/formatters';
// export { toolValidators } from './utils/validators';