import type {Express, Request, Response} from 'express';
import type {ExtendedWebSocket} from '../websocket/index.js';
import {createHealthRoute} from '../../modules/health/health.controller.js';
import {createConfigRoute} from '../../modules/config/config.controller.js';
import {
  getProjectsList,
  renameProject,
  deleteProject,
  addProject,
} from '../../modules/projects/index.js';
import {createSessionRoutes} from '../../modules/sessions/sessions.controller.js';
import {createFileRoutes} from '../../modules/files/files.controller.js';
import {createGitRoutes} from '../../modules/git/git.controller.js';
import {createServerRoutes} from '../../modules/servers/servers.controller.js';
import {createSlashCommandRoutes} from '../../modules/claude-cli/slash-commands.controller.js';
import {handleGenerateSummary} from '../../modules/claude-cli/summary.handler.js';

interface RouteDependencies {
  connectedClients: Set<ExtendedWebSocket>;
}

export const setupRoutes = (app: Express, deps: RouteDependencies): void => {
  // Health check
  app.get('/health', createHealthRoute());

  // Config endpoint
  app.get('/api/config', createConfigRoute());

  // Project routes
  app.get('/api/projects', async (req: Request, res: Response) => {
    try {
      const projects = await getProjectsList(process.env['HOME'] || '');
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.put('/api/projects/:projectName/rename', renameProject);

  app.delete('/api/projects/:projectName', deleteProject);

  app.post('/api/projects/create', addProject);

  // Session summary generation
  app.post(
    '/api/generate-session-summary',
    async (req: Request, res: Response) => {
      try {
        const {messages} = req.body;
        const result = await handleGenerateSummary(messages);
        res.json(result);
      } catch (error: any) {
        console.error('Error generating summary:', error);
        res.status(500).json({error: error.message});
      }
    },
  );

  // Session routes
  app.use('/api/projects/:projectName/sessions', createSessionRoutes());

  // File routes
  app.use('/api/projects/:projectName', createFileRoutes());

  // Git routes
  app.use('/api/git', createGitRoutes());

  // Server management routes
  app.use(
    '/api/projects/:projectName/servers',
    createServerRoutes(deps.connectedClients),
  );

  // Slash commands
  app.use('/api', createSlashCommandRoutes());
};
