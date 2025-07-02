export interface TaskList {
  emoji: string;
  name: string;
  script: string;
  outputFile: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ValidationTask {
  name: string;
  script: string;
  emoji: string;
  outputFile: string;
  runCount?: number;
}

export interface TestPackage {
  name: string;
  path: string;
  availableTests: string[];
}

export interface TaskResult {
  task: ValidationTask;
  success: boolean;
  duration: number;
  errorCount?: number;
  autoFixed?: boolean;
}
