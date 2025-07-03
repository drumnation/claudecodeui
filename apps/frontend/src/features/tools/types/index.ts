/**
 * Tools Feature Types - Claude Code tool execution and visualization
 * Following Bulletproof React feature-slice pattern
 */

// Core tool types
export interface ToolUse {
  id: string;
  tool_name: string;
  tool_input: Record<string, any>;
  timestamp: string | number | Date;
  status: 'pending' | 'running' | 'completed' | 'error';
  metadata?: Record<string, any>;
}

export interface ToolResult {
  id: string;
  tool_use_id: string;
  tool_name: string;
  tool_result: any;
  timestamp: string | number | Date;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

// Tool message types (embedded in chat messages)
export interface ToolMessage {
  type: 'tool_use' | 'tool_result';
  id: string;
  tool_name?: string;
  toolName?: string; // Alternative naming
  tool_input?: any;
  toolInput?: any; // Alternative naming
  tool_result?: any;
  toolResult?: any; // Alternative naming
  toolError?: boolean;
  inline?: boolean;
  timestamp?: string | number | Date;
}

// Tool execution state
export interface ToolExecutionState {
  activeTools: Map<string, ToolUse>;
  completedTools: Map<string, ToolResult>;
  isExecuting: boolean;
  executionQueue: ToolUse[];
}

// Tool display configuration
export interface ToolDisplayConfig {
  autoExpandTools: boolean;
  showRawParameters: boolean;
  showExecutionTime: boolean;
  showToolNames: boolean;
  maxParameterDepth: number;
}

// Tool visualization types
export interface ToolVisualization {
  type: 'json' | 'table' | 'tree' | 'code' | 'diff' | 'image' | 'markdown';
  data: any;
  config?: Record<string, any>;
}

// Built-in Claude Code tools
export type ClaudeCodeTool = 
  | 'Bash'
  | 'Edit' 
  | 'Read'
  | 'Write'
  | 'Glob'
  | 'Grep'
  | 'MultiEdit'
  | 'Task'
  | 'TodoRead'
  | 'TodoWrite'
  | 'WebFetch'
  | 'WebSearch'
  | 'LS'
  | 'exit_plan_mode'
  | 'NotebookRead'
  | 'NotebookEdit'
  | 'mcp__ide__getDiagnostics'
  | 'mcp__ide__executeCode';

// Tool parameter types
export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  description?: string;
  required: boolean;
  sensitive?: boolean; // For masking in UI
}

// Tool execution context
export interface ToolExecutionContext {
  sessionId: string;
  projectName?: string;
  projectPath?: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
  permissions?: ToolPermissions;
}

// Tool permissions and security
export interface ToolPermissions {
  allowedTools: string[];
  disallowedTools: string[];
  skipPermissions: boolean;
  requireConfirmation: string[]; // Tools that need user confirmation
}

// Tool result formatters
export interface ToolResultFormatter {
  canHandle: (toolName: string, result: any) => boolean;
  format: (result: any, config?: any) => ToolVisualization;
  priority: number;
}

// File operation tools
export interface FileOperationTool {
  tool_name: 'Edit' | 'Write' | 'Read' | 'MultiEdit';
  file_path: string;
  content?: string;
  old_string?: string;
  new_string?: string;
  edits?: Array<{ old_string: string; new_string: string; replace_all?: boolean }>;
}

// Bash execution tools
export interface BashExecutionTool {
  tool_name: 'Bash';
  command: string;
  description?: string;
  timeout?: number;
  working_directory?: string;
}

// Search tools
export interface SearchTool {
  tool_name: 'Glob' | 'Grep' | 'LS';
  pattern?: string;
  path?: string;
  include?: string;
  ignore?: string[];
}

// Web tools
export interface WebTool {
  tool_name: 'WebFetch' | 'WebSearch';
  url?: string;
  query?: string;
  prompt?: string;
  allowed_domains?: string[];
  blocked_domains?: string[];
}

// Todo management tools
export interface TodoTool {
  tool_name: 'TodoRead' | 'TodoWrite';
  todos?: Array<{
    id: string;
    content: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
  }>;
}

// Task orchestration tools
export interface TaskTool {
  tool_name: 'Task';
  description: string;
  prompt: string;
}

// Tool analytics and metrics
export interface ToolMetrics {
  toolName: string;
  executionCount: number;
  averageExecutionTime: number;
  successRate: number;
  lastUsed: Date;
  errorCount: number;
  popularParameters: Record<string, number>;
}