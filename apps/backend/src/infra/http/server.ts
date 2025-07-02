import express, {Express} from 'express';
import http from 'node:http';
import os from 'node:os';
import type {ServerConfig, ServerInfo} from './server.types.js';
import type {Logger} from '@kit/logger/types';

export const createExpressApp = (): Express => express();

export const createHttpServer = (app: Express): http.Server =>
  http.createServer(app);

export const getNetworkIP = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaces = interfaces[name];
    if (ifaces) {
      for (const iface of ifaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost';
};

export const startServer = (
  server: http.Server,
  config: ServerConfig,
  logger: Logger,
): Promise<ServerInfo> => {
  return new Promise((resolve, reject) => {
    logger.info(
      `Attempting to listen on ${config.host}:${config.port}`,
    );

    server
      .listen(config.port, config.host, () => {
        logger.debug(`Server.listen callback triggered`);
        const networkIP = getNetworkIP();
        logger.debug(`Network IP resolved to ${networkIP}`);

        const serverInfo = {
          port: config.port,
          host: config.host,
          networkIP,
        };

        logger.info(`Server listening`, serverInfo);
        resolve(serverInfo);
      })
      .on('error', (error) => {
        logger.error(`Server start error:`, { error });
        reject(error);
      });

    logger.debug(`Server.listen called, waiting for callback...`);
  });
};
