import type {Request, Response} from 'express';

export const createHealthRoute = () => {
  return (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  };
};
