import pino from 'pino';
import { getEnv } from '@kit/env-loader/node';
import type { Logger, LoggerOptions, LoggerMetadata, LogLevel, RequestWithLogger, LoggerMiddlewareOptions } from './types.js';
import type { Request, Response, NextFunction } from 'express';

const levelMap: Record<LogLevel, number> = {
  silent: Infinity,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

function getDefaultLevel(): LogLevel {
  const nodeEnv = getEnv('NODE_ENV', 'development');
  return nodeEnv === 'production' ? 'error' : 'info';
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const {
    level = getEnv('LOG_LEVEL', getDefaultLevel()) as LogLevel,
    scope = 'app',
    prettyPrint = getEnv('NODE_ENV', 'development') !== 'production',
    metadata = {},
  } = options;

  const transport = prettyPrint
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          errorProps: 'stack',
          messageFormat: '[{scope}] | {msg}',
        },
      }
    : undefined;

  const pinoLogger = pino({
    level,
    transport,
    formatters: {
      level: (label) => ({ level: label }),
    },
    base: {
      ...metadata,
      scope,
    },
  });

  const logger: Logger = {
    error: (message: string, metadata?: LoggerMetadata) => {
      pinoLogger.error({ ...metadata }, message);
    },
    warn: (message: string, metadata?: LoggerMetadata) => {
      pinoLogger.warn({ ...metadata }, message);
    },
    info: (message: string, metadata?: LoggerMetadata) => {
      pinoLogger.info({ ...metadata }, message);
    },
    debug: (message: string, metadata?: LoggerMetadata) => {
      pinoLogger.debug({ ...metadata }, message);
    },
    trace: (message: string, metadata?: LoggerMetadata) => {
      pinoLogger.trace({ ...metadata }, message);
    },
    child: (metadata: LoggerMetadata): Logger => {
      const childPino = pinoLogger.child(metadata);
      return {
        error: (message: string, meta?: LoggerMetadata) => childPino.error({ ...meta }, message),
        warn: (message: string, meta?: LoggerMetadata) => childPino.warn({ ...meta }, message),
        info: (message: string, meta?: LoggerMetadata) => childPino.info({ ...meta }, message),
        debug: (message: string, meta?: LoggerMetadata) => childPino.debug({ ...meta }, message),
        trace: (message: string, meta?: LoggerMetadata) => childPino.trace({ ...meta }, message),
        child: (meta: LoggerMetadata) => logger.child({ ...metadata, ...meta }),
        isLevelEnabled: (checkLevel: LogLevel) => isLevelEnabled(checkLevel, level),
      };
    },
    isLevelEnabled: (checkLevel: LogLevel): boolean => isLevelEnabled(checkLevel, level),
  };

  return logger;
}

export function isLevelEnabled(checkLevel: LogLevel, currentLevel: LogLevel = getEnv('LOG_LEVEL', getDefaultLevel()) as LogLevel): boolean {
  return levelMap[checkLevel] >= levelMap[currentLevel];
}

let requestIdCounter = 0;

export function createRequestLoggerMiddleware(options: LoggerMiddlewareOptions) {
  const { logger, skipPaths = [], logBody = false } = options;

  return (req: Request & Partial<RequestWithLogger>, res: Response, next: NextFunction) => {
    const shouldSkip = skipPaths.some(path => req.path.startsWith(path));
    if (shouldSkip) {
      return next();
    }

    const reqId = `req-${Date.now()}-${++requestIdCounter}`;
    const startTime = Date.now();

    req.id = reqId;
    req.log = logger.child({
      reqId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    req.log.info('Request received', {
      query: req.query,
      ...(logBody && req.body ? { body: req.body } : {}),
    });

    const originalSend = res.send;
    res.send = function(data: any) {
      const duration = Date.now() - startTime;
      req.log?.info('Request completed', {
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('content-length'),
      });
      return originalSend.call(this, data);
    };

    res.on('error', (error: Error) => {
      const duration = Date.now() - startTime;
      req.log?.error('Request failed', {
        error,
        statusCode: res.statusCode,
        duration,
      });
    });

    next();
  };
}

// Export a default logger instance for convenience
export const defaultLogger = createLogger({});