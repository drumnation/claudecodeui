import type {Request, Response} from 'express';
import {getNetworkIP} from '../../infra/http/server.js';

export const createConfigRoute = () => {
  return (req: Request, res: Response) => {
    const serverIP = getNetworkIP();
    const PORT = process.env['PORT'] || '8765';
    const host = `${serverIP}:${PORT}`;
    const protocol =
      req.protocol === 'https' || req.get('x-forwarded-proto') === 'https'
        ? 'wss'
        : 'ws';

    console.log(
      'Config API called - Returning host:',
      host,
      'Protocol:',
      protocol,
    );

    res.json({
      serverPort: PORT,
      wsUrl: `${protocol}://${host}`,
    });
  };
};
