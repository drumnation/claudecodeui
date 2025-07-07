export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerOptions {
  level?: LogLevel | string;  // Allow any string, will be validated at runtime
  scope?: string;
  [key: string]: any;
}

export interface Logger {
  info(message: string, metadata?: any): void;
  error(message: string, metadata?: any): void;
  warn(message: string, metadata?: any): void;
  debug(message: string, metadata?: any): void;
  trace(message: string, metadata?: any): void;
  child(context: Record<string, any>): Logger;
  isLevelEnabled(level: LogLevel): boolean;
}