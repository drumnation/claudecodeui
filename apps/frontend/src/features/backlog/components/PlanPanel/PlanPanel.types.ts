export interface PlanPanelProps {
  planText: string;
  setPlanText: (text: string) => void;
  onGenerateTasks: () => Promise<GenerateTasksResult | void>;
  onReviewTasks: (reviewSummary: string) => Promise<void>;
  generatingTasks: boolean;
  selectedProject?: string;
}

export interface GenerateTasksResult {
  generatedTasks: PreviewTask[];
}

export interface PreviewTask {
  title: string;
  priority?: string;
  description?: string;
  status?: string;
}

export type PlanMode = 'plan' | 'review';
