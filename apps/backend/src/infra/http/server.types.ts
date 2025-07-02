import type {Express} from 'express';
import type {Server} from 'http';
import type {CorsOptions} from 'cors';

export interface ServerConfig {
  port: number;
  host: string;
  corsOptions: CorsOptions;
}

export interface ServerDependencies {
  app: Express;
  server: Server;
  config: ServerConfig;
}

export interface ServerInfo {
  port: number;
  host: string;
  networkIP: string;
}
