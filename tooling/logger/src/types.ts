export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerOptions {
  level?: LogLevel;
  scope?: string;
  prettyPrint?: boolean;
  metadata?: Record<string, unknown>;
}

export interface LoggerMetadata {
  [key: string]: unknown;
  reqId?: string;
  sessionId?: string;
  userId?: string;
  correlationId?: string;
  duration?: number;
  error?: Error | unknown;
}

export interface Logger {
  error(message: string, metadata?: LoggerMetadata): void;
  warn(message: string, metadata?: LoggerMetadata): void;
  info(message: string, metadata?: LoggerMetadata): void;
  debug(message: string, metadata?: LoggerMetadata): void;
  trace(message: string, metadata?: LoggerMetadata): void;
  child(metadata: LoggerMetadata): Logger;
  isLevelEnabled(level: LogLevel): boolean;
}

export interface RequestWithLogger {
  log: Logger;
  id: string;
}

export interface LoggerMiddlewareOptions {
  logger: Logger;
  skipPaths?: string[];
  logBody?: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  metadata?: LoggerMetadata;
}

export interface LoggerTransport {
  log(entry: LogEntry): void | Promise<void>;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL?: LogLevel;
      VITE_LOG_LEVEL?: LogLevel;
    }
  }
}