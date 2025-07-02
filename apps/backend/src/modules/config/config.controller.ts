import type {Request, Response} from 'express';
import type {Logger} from '@kit/logger/types';
import {getNetworkIP} from '../../infra/http/server.js';

export const createConfigRoute = (logger: Logger) => {
  return (req: Request, res: Response) => {
    const serverIP = getNetworkIP();
    const PORT = process.env['PORT'] || '8765';
    const host = `${serverIP}:${PORT}`;
    const protocol =
      req.protocol === 'https' || req.get('x-forwarded-proto') === 'https'
        ? 'wss'
        : 'ws';

    logger.info('Config API called', {
      host,
      protocol,
    });

    res.json({
      serverPort: PORT,
      wsUrl: `${protocol}://${host}`,
    });
  };
};
