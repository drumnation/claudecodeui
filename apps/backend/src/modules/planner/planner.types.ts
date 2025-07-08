// Types for multi-agent planner module

export enum AgentType {
  ARCH = 'ARCH',
  DIFF = 'DIFF',
  DEPS = 'DEPS'
}

export interface Screenshot {
  name: string;
  data: string; // base64 encoded image
  type: string; // mime type
}

export interface PlannerRequest {
  type: 'planner-command';
  projectPath: string;
  featureDescription: string;
  selectedAgents: AgentType[];
  plannerMode?: 'single' | 'multi';
  autoGenerateCode?: boolean;
  screenshots?: Screenshot[];
  sessionId?: string;
}

export interface AgentResult {
  agentType: AgentType;
  output: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface PlannerProgress {
  currentAgent: AgentType | null;
  completedAgents: AgentType[];
  overallStatus: 'idle' | 'running' | 'completed' | 'failed';
  totalAgents: number;
  completedCount: number;
  progressPercentage: number;
}

export interface PlannerComplete {
  finalPlan: string;
  agentResults: AgentResult[];
  totalDuration: number;
  status: 'completed' | 'failed';
  summary: string;
}

export interface CodeContext {
  file: string;
  snippet: string;
  relevance: number;
  lineNumber?: number;
  description?: string;
}

export interface PlannerWebSocketMessage {
  type: 'planner-status' | 'planner-output' | 'planner-complete' | 'planner-error';
  data?: any;
  error?: string;
  sessionId?: string;
  agentType?: AgentType;
  progress?: PlannerProgress;
  agentResults?: AgentResult[];
  finalPlan?: string;
  output?: string;
  status?: string;
}

export interface CodeQAISearchOptions {
  maxResults?: number;
  contextLength?: number;
  includeLineNumbers?: boolean;
  fileTypes?: string[];
}

export interface CodeQAISearchResult {
  query: string;
  results: CodeContext[];
  totalResults: number;
  searchTime: number;
}

export interface AgentPromptContext {
  featureDescription: string;
  projectPath: string;
  codeContext: CodeContext[];
  screenshots?: Screenshot[];
  archOutput?: string;
  diffOutput?: string;
  depsOutput?: string;
}

export interface PlannerServiceState {
  isRunning: boolean;
  currentRequest: PlannerRequest | null;
  agentResults: Map<AgentType, AgentResult>;
  progress: PlannerProgress;
  startTime: number;
  sessionId: string;
}

export enum PlannerValidationError {
  PROMPT_FILE_MISSING = 'PROMPT_FILE_MISSING',
  PROMPT_FILE_ERROR = 'PROMPT_FILE_ERROR',
  CLAUDE_BINARY_MISSING = 'CLAUDE_BINARY_MISSING',
  CLAUDE_BINARY_NOT_EXECUTABLE = 'CLAUDE_BINARY_NOT_EXECUTABLE',
  PROJECT_PATH_INVALID = 'PROJECT_PATH_INVALID',
  AGENT_EXECUTION_ERROR = 'AGENT_EXECUTION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface ValidationResult {
  success: boolean;
  errors: string[];
  errorType?: PlannerValidationError;
}