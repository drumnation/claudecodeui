import express, {Express, Request, Response, NextFunction} from 'express';
import cors from 'cors';
import type {CorsOptions} from 'cors';
import {createRequestLoggerMiddleware} from '@kit/logger/node';
import type {Logger} from '@kit/logger/types';

// Request timing tracking for brain-monitor debugging
const requestTimings = new Map<string, {lastRequest: number, count: number}>();

const createTimingMiddleware = (logger: Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const endpoint = `${req.method} ${req.path}`;
    const userAgent = req.get('User-Agent') || 'unknown';
    const contentLength = req.get('Content-Length') || '0';
    
    // Track request intervals for debugging
    const existing = requestTimings.get(endpoint);
    if (existing) {
      const interval = now - existing.lastRequest;
      existing.lastRequest = now;
      existing.count++;
      
      // Log rapid requests to brain-monitor endpoint
      if (endpoint.includes('brain-monitor') && interval < 100) {
        logger.warn('Rapid request detected to brain-monitor endpoint', {
          endpoint,
          interval,
          requestCount: existing.count,
          userAgent,
          contentLength,
          headers: {
            'content-type': req.get('Content-Type'),
            'origin': req.get('Origin'),
            'referer': req.get('Referer')
          }
        });
      }
      
      // Log all brain-monitor requests with timing
      if (endpoint.includes('brain-monitor')) {
        logger.debug('Brain-monitor request timing', {
          endpoint,
          interval,
          requestCount: existing.count,
          contentLength
        });
      }
    } else {
      requestTimings.set(endpoint, {lastRequest: now, count: 1});
      
      if (endpoint.includes('brain-monitor')) {
        logger.debug('First brain-monitor request', {
          endpoint,
          userAgent,
          contentLength
        });
      }
    }
    
    next();
  };
};

export const applyMiddleware = (
  app: Express,
  corsOptions: CorsOptions,
  logger: Logger,
): void => {
  // Add detailed request timing middleware first
  app.use(createTimingMiddleware(logger));
  
  // Add request logging middleware
  app.use(createRequestLoggerMiddleware({ logger }));
  
  app.use(cors(corsOptions));
  app.use(express.json({limit: '50mb'}));
  app.use(express.urlencoded({extended: true, limit: '50mb'}));
};
