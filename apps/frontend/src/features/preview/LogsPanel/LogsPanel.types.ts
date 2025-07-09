export interface LogEntry {
  type: 'info' | 'error' | 'warning' | 'log';
  message: string;
  timestamp?: Date;
}

export interface LogsPanelProps {
  serverLogs: LogEntry[];
  onClearLogs: () => void;
}
