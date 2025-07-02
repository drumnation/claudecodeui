import express, {Express} from 'express';
import cors from 'cors';
import type {CorsOptions} from 'cors';
import {createRequestLoggerMiddleware} from '@kit/logger/node';
import type {Logger} from '@kit/logger/types';

export const applyMiddleware = (
  app: Express,
  corsOptions: CorsOptions,
  logger: Logger,
): void => {
  // Add request logging middleware first
  app.use(createRequestLoggerMiddleware({ logger }));
  
  app.use(cors(corsOptions));
  app.use(express.json({limit: '50mb'}));
  app.use(express.urlencoded({extended: true, limit: '50mb'}));
};
