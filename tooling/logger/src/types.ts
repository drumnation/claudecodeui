export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerOptions {
  level?: LogLevel | string;  // Allow any string, will be validated at runtime
  scope?: string;
  [key: string]: any;
}

export interface LoggerMetadata {
  [key: string]: any;
}

export interface Logger {
  info(message: string, metadata?: LoggerMetadata): void;
  error(message: string, metadata?: LoggerMetadata): void;
  warn(message: string, metadata?: LoggerMetadata): void;
  debug(message: string, metadata?: LoggerMetadata): void;
  trace(message: string, metadata?: LoggerMetadata): void;
  child(context: Record<string, any>): Logger;
  isLevelEnabled(level: LogLevel): boolean;
}