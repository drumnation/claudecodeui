export interface PlannerModalProps {
  selectedProject: {
    name: string;
    path: string;
    fullPath?: string;
  } | null;
  onClose: () => void;
  onPlanComplete?: (plan: PlanResult) => void;
}

export interface PlanResult {
  finalPlan: string;
  agentResults: AgentResult[];
  totalDuration: number;
  status: 'completed' | 'failed';
  summary: string;
}

export interface AgentResult {
  agentType: 'ARCH' | 'DIFF' | 'DEPS';
  output: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface PlannerState {
  currentAgent: string | null;
  completedAgents: string[];
  overallStatus: 'idle' | 'running' | 'completed' | 'failed';
  totalAgents: number;
  completedCount: number;
  progressPercentage: number;
}

export interface Screenshot {
  name: string;
  data: string; // base64
  type: string;
  size?: number;
}
