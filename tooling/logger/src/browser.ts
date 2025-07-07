import type { Logger, LoggerOptions, LogLevel } from './types.js';

const LOG_LEVELS = {
  silent: 100,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level || process.env.VITE_LOG_LEVEL || process.env.LOG_LEVEL || 'info';
  const currentLevel = LOG_LEVELS[level as LogLevel] || LOG_LEVELS.info;
  const scope = options.scope || 'browser';
  
  const formatMessage = (level: string, message: string, metadata?: any) => {
    const timestamp = new Date().toISOString();
    const meta = metadata ? ` ${JSON.stringify(metadata)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${scope}] ${message}${meta}`;
  };

  return {
    info(message: string, metadata?: any) {
      if (currentLevel <= LOG_LEVELS.info) {
        console.log(formatMessage('info', message, metadata));
      }
    },
    error(message: string, metadata?: any) {
      if (currentLevel <= LOG_LEVELS.error) {
        console.error(formatMessage('error', message, metadata));
      }
    },
    warn(message: string, metadata?: any) {
      if (currentLevel <= LOG_LEVELS.warn) {
        console.warn(formatMessage('warn', message, metadata));
      }
    },
    debug(message: string, metadata?: any) {
      if (currentLevel <= LOG_LEVELS.debug) {
        console.log(formatMessage('debug', message, metadata));
      }
    },
    trace(message: string, metadata?: any) {
      if (currentLevel <= LOG_LEVELS.trace) {
        console.log(formatMessage('trace', message, metadata));
      }
    },
    child(context: Record<string, any>) {
      return createLogger({ ...options, ...context, scope: `${scope}:${context.scope || 'child'}` });
    },
    isLevelEnabled(level: LogLevel): boolean {
      return currentLevel <= LOG_LEVELS[level];
    },
  };
}