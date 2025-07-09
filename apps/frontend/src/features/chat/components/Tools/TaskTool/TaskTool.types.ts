export interface TaskToolProps {
  taskData: string;
  timestamp?: Date | string;
}

export interface ParsedTask {
  title: string;
  description: string;
  details?: string;
  metadata?: Record<string, any>;
}

export type TaskIconType =
  | 'refactor'
  | 'bug'
  | 'test'
  | 'search'
  | 'create'
  | 'optimize'
  | 'task';
