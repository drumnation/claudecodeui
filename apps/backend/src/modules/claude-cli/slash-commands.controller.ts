import {Router} from 'express';
import type {Request, Response} from 'express';
import {getSlashCommands} from './slash-commands.service.js';

export const createSlashCommandRoutes = (): Router => {
  const router = Router();

  // Get slash commands
  router.get('/slash-commands', async (req: Request, res: Response) => {
    try {
      const commands = await getSlashCommands();
      res.json({commands});
    } catch (error: any) {
      console.error('Error getting slash commands:', error);
      res.status(500).json({error: error.message});
    }
  });

  return router;
};
