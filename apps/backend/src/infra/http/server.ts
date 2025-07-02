import express, {Express} from 'express';
import http from 'node:http';
import os from 'node:os';
import type {ServerConfig, ServerInfo} from './server.types.js';

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
): Promise<ServerInfo> => {
  return new Promise((resolve, reject) => {
    console.log(
      `startServer: Attempting to listen on ${config.host}:${config.port}`,
    );

    server
      .listen(config.port, config.host, () => {
        console.log(`startServer: Server.listen callback triggered`);
        const networkIP = getNetworkIP();
        console.log(`startServer: Network IP resolved to ${networkIP}`);

        const serverInfo = {
          port: config.port,
          host: config.host,
          networkIP,
        };

        console.log(`startServer: Resolving with server info:`, serverInfo);
        resolve(serverInfo);
      })
      .on('error', (error) => {
        console.error(`startServer: Error occurred:`, error);
        reject(error);
      });

    console.log(`startServer: Server.listen called, waiting for callback...`);
  });
};
