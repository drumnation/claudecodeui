import express, {Express} from 'express';
import cors from 'cors';
import type {CorsOptions} from 'cors';

export const applyMiddleware = (
  app: Express,
  corsOptions: CorsOptions,
): void => {
  app.use(cors(corsOptions));
  app.use(express.json({limit: '50mb'}));
  app.use(express.urlencoded({extended: true, limit: '50mb'}));
};
