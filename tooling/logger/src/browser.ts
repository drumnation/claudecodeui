/// <reference types="vite/client" />

import pino from 'pino';
import { getEnv } from '@kit/env-loader/browser';
import type { Logger, LoggerOptions, LoggerMetadata, LogLevel } from './types.js';
import { resolveTheme, type ThemeDefinition } from './themes.js';

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

function createThemeWriter(theme: ThemeDefinition, scope: string) {
  const isMonochrome = theme.time === 'dim';
  
  const formatStyle = (color: string): string => {
    if (isMonochrome) {
      switch (color) {
        case 'dim': return 'opacity: 0.6';
        case 'bold': return 'font-weight: bold';
        case 'inverse': return 'background-color: white; color: black; padding: 2px 4px';
        case 'normal': return '';
        default: return '';
      }
    }
    return `color: ${color}`;
  };

  const createLogFunction = (level: string, levelColor: string) => {
    return function(o: any) {
      const timestamp = new Date().toLocaleTimeString();
      const scopeName = o.scope || scope;
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : level === 'info' ? 'info' : 'log';
      
      console[consoleMethod](
        `%c${timestamp} %c[${scopeName}]%c ${level.toUpperCase()} %c| %c${o.msg}`,
        formatStyle(theme.time),
        formatStyle(theme.scope),
        formatStyle(levelColor),
        formatStyle(isMonochrome ? 'normal' : '#666666'),
        formatStyle(isMonochrome ? 'normal' : '#ffffff')
      );
    };
  };

  return {
    error: createLogFunction('error', theme.error),
    warn: createLogFunction('warn', theme.warn),
    info: createLogFunction('info', theme.info),
    debug: createLogFunction('debug', theme.debug),
    trace: createLogFunction('trace', theme.trace),
  };
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const {
    level = getEnv('VITE_LOG_LEVEL', getDefaultLevel()) as LogLevel,
    scope = 'app',
    prettyPrint = import.meta.env?.DEV || process.env.NODE_ENV === 'development',
    metadata = {},
    theme = getEnv('VITE_LOG_THEME', 'Classic'),
  } = options;

  const resolvedTheme = resolveTheme(theme);

  const browserOptions: pino.LoggerOptions = {
    level,
    browser: prettyPrint ? {
      serialize: !prettyPrint,
      asObject: !prettyPrint,
      write: createThemeWriter(resolvedTheme, scope),
    } : {
      serialize: !prettyPrint,
      asObject: !prettyPrint,
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