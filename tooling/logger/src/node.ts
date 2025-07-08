import type { Logger, LoggerOptions, LogLevel } from './types.js';
import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

const LOG_LEVELS = {
  silent: 100,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

const VALID_LOG_LEVELS: LogLevel[] = ['silent', 'error', 'warn', 'info', 'debug', 'trace'];

function isValidLogLevel(level: string): level is LogLevel {
  return VALID_LOG_LEVELS.includes(level as LogLevel);
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const levelStr = options.level || process.env.LOG_LEVEL || 'info';
  const level = isValidLogLevel(levelStr) ? levelStr : 'info';
  
  // Configure pretty printing for development
  const pinoOptions: any = {
    level: level,
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    ...options,
  };

  // Add pretty printing in development
  if (process.env.NODE_ENV !== 'production' && !process.env.CI) {
    pinoOptions.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'HH:MM:ss',
        messageFormat: '{scope} | {msg}',
        singleLine: true
      }
    };
  }
  
  const pinoLogger = pino(pinoOptions);

  return {
    info(message: string, metadata?: any) {
      pinoLogger.info(metadata, message);
    },
    error(message: string, metadata?: any) {
      pinoLogger.error(metadata, message);
    },
    warn(message: string, metadata?: any) {
      pinoLogger.warn(metadata, message);
    },
    debug(message: string, metadata?: any) {
      pinoLogger.debug(metadata, message);
    },
    trace(message: string, metadata?: any) {
      pinoLogger.trace(metadata, message);
    },
    child(context: Record<string, any>) {
      const childPino = pinoLogger.child(context);
      return createLogger({ ...options, ...context });
    },
    isLevelEnabled(level: LogLevel): boolean {
      return pinoLogger.isLevelEnabled(level);
    },
  };
}

export function createRequestLoggerMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (logger && typeof logger.info === 'function') {
        logger.info(`${req.method} ${req.path}`, {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
        });
      }
    });
    
    next();
  };
}