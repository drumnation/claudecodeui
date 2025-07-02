import pino from 'pino';
import { getEnv } from '@kit/env-loader/browser';
import type { Logger, LoggerOptions, LoggerMetadata, LogLevel } from './types.js';

const levelMap: Record<LogLevel, number> = {
  silent: Infinity,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

function getDefaultLevel(): LogLevel {
  const isDevelopment = import.meta.env?.DEV || process.env.NODE_ENV === 'development';
  return isDevelopment ? 'info' : 'error';
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const {
    level = getEnv('VITE_LOG_LEVEL', getDefaultLevel()) as LogLevel,
    scope = 'app',
    prettyPrint = import.meta.env?.DEV || process.env.NODE_ENV === 'development',
    metadata = {},
  } = options;

  const browserOptions: pino.LoggerOptions = {
    level,
    browser: {
      serialize: !prettyPrint,
      asObject: !prettyPrint,
      write: prettyPrint ? {
        error: function(o: any) {
          const timestamp = new Date().toLocaleTimeString();
          const scopePrefix = `[${o.scope || scope}]`;
          console.error(`%c${timestamp} ${scopePrefix} ERROR | ${o.msg}`, 'color: #ff6b6b; font-weight: bold', o);
        },
        warn: function(o: any) {
          const timestamp = new Date().toLocaleTimeString();
          const scopePrefix = `[${o.scope || scope}]`;
          console.warn(`%c${timestamp} ${scopePrefix} WARN | ${o.msg}`, 'color: #ffd93d; font-weight: bold', o);
        },
        info: function(o: any) {
          const timestamp = new Date().toLocaleTimeString();
          const scopePrefix = `[${o.scope || scope}]`;
          console.info(`%c${timestamp} ${scopePrefix} INFO | ${o.msg}`, 'color: #4ecdc4', o);
        },
        debug: function(o: any) {
          const timestamp = new Date().toLocaleTimeString();
          const scopePrefix = `[${o.scope || scope}]`;
          console.log(`%c${timestamp} ${scopePrefix} DEBUG | ${o.msg}`, 'color: #95a5a6', o);
        },
        trace: function(o: any) {
          const timestamp = new Date().toLocaleTimeString();
          const scopePrefix = `[${o.scope || scope}]`;
          console.log(`%c${timestamp} ${scopePrefix} TRACE | ${o.msg}`, 'color: #7f8c8d', o);
        },
      } : undefined,
    },
    base: {
      ...metadata,
      scope,
    },
  };

  const pinoLogger = pino(browserOptions);

  const logger: Logger = {
    error: (message: string, metadata?: LoggerMetadata) => {
      if (isLevelEnabled('error', level)) {
        pinoLogger.error({ ...metadata, scope }, message);
      }
    },
    warn: (message: string, metadata?: LoggerMetadata) => {
      if (isLevelEnabled('warn', level)) {
        pinoLogger.warn({ ...metadata, scope }, message);
      }
    },
    info: (message: string, metadata?: LoggerMetadata) => {
      if (isLevelEnabled('info', level)) {
        pinoLogger.info({ ...metadata, scope }, message);
      }
    },
    debug: (message: string, metadata?: LoggerMetadata) => {
      if (isLevelEnabled('debug', level)) {
        pinoLogger.debug({ ...metadata, scope }, message);
      }
    },
    trace: (message: string, metadata?: LoggerMetadata) => {
      if (isLevelEnabled('trace', level)) {
        pinoLogger.trace({ ...metadata, scope }, message);
      }
    },
    child: (childMetadata: LoggerMetadata): Logger => {
      return createLogger({
        ...options,
        metadata: { ...metadata, ...childMetadata },
        scope: childMetadata.scope as string || scope,
      });
    },
    isLevelEnabled: (checkLevel: LogLevel): boolean => isLevelEnabled(checkLevel, level),
  };

  return logger;
}

export function isLevelEnabled(
  checkLevel: LogLevel, 
  currentLevel: LogLevel = getEnv('VITE_LOG_LEVEL', getDefaultLevel()) as LogLevel
): boolean {
  return levelMap[checkLevel] >= levelMap[currentLevel];
}

// Export a default logger instance for convenience
export const defaultLogger = createLogger({});