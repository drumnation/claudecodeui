import { Request, Response } from 'express';
import { createLogger } from '@kit/logger/node';
import { projectsService } from './modules/projects/projects.service';

const logger = createLogger({ scope: 'projects-controller' });

export async function handleGetProjects(req: Request, res: Response) {
  try {
    const projects = await projectsService.getProjects();
    logger.info('Returning projects', { count: projects.length });
    res.json(projects);
  } catch (error) {
    logger.error('Failed to get projects', { error });
    res.status(500).json({ error: 'Failed to get projects' });
  }
}