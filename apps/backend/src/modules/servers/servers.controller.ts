import {Router} from 'express';
import type {Request, Response} from 'express';
import {WebSocket} from 'ws';
import type {
  ExtendedWebSocket,
  WebSocketMessage,
} from '../../infra/websocket/index.js';
import {createServerManager, getAvailableScripts} from './index.js';

export const createServerRoutes = (
  connectedClients: Set<ExtendedWebSocket>,
): Router => {
  const router = Router({mergeParams: true});

  // Create server manager with broadcast capability
  const broadcast = (message: WebSocketMessage): void => {
    const data = JSON.stringify(message);
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  const serverManager = createServerManager(broadcast);

  // Get available scripts
  router.get('/scripts', async (req: Request, res: Response) => {
    try {
      const {projectName} = req.params;
      if (!projectName) {
        return res.status(400).json({error: 'Project name is required'});
      }

      // Need to get the actual project path
      const {getProjectsList} = await import('../projects/index.js');
      const projects = await getProjectsList(process.env['HOME'] || '');
      const project = projects.find((p: any) => p.name === projectName);

      if (!project) {
        return res.status(404).json({error: 'Project not found'});
      }

      if (!project.path) {
        return res.status(400).json({error: 'Project path is not available'});
      }

      const scripts = await getAvailableScripts(project.path);
      res.json({scripts});
    } catch (error: any) {
      console.error('Error getting scripts:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Get server status
  router.get('/', (req: Request, res: Response) => {
    const {projectName} = req.params;
    if (!projectName) {
      return res.status(400).json({error: 'Project name is required'});
    }

    const projectServers = serverManager.getServerStatus(projectName);
    res.json({servers: projectServers});
  });

  // Start server
  router.post('/:serverId/start', async (req: Request, res: Response) => {
    try {
      const {projectName, serverId} = req.params;
      if (!projectName || !serverId) {
        return res
          .status(400)
          .json({error: 'Project name and server ID are required'});
      }

      // Need to get the actual project path
      const {getProjectsList} = await import('../projects/index.js');
      const projects = await getProjectsList(process.env['HOME'] || '');
      const project = projects.find((p: any) => p.name === projectName);

      if (!project) {
        return res.status(404).json({error: 'Project not found'});
      }

      if (!project.path) {
        return res.status(400).json({error: 'Project path is not available'});
      }

      const result = await serverManager.startServer(project.path, serverId);
      if (result.error) {
        res.status(400).json(result);
      } else {
        res.json({success: true, server: result});
      }
    } catch (error: any) {
      console.error('Error starting server:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Stop server
  router.post('/:serverId/stop', async (req: Request, res: Response) => {
    try {
      const {projectName, serverId} = req.params;
      if (!projectName || !serverId) {
        return res
          .status(400)
          .json({error: 'Project name and server ID are required'});
      }

      // Need to get the actual project path
      const {getProjectsList} = await import('../projects/index.js');
      const projects = await getProjectsList(process.env['HOME'] || '');
      const project = projects.find((p: any) => p.name === projectName);

      if (!project) {
        return res.status(404).json({error: 'Project not found'});
      }

      if (!project.path) {
        return res.status(400).json({error: 'Project path is not available'});
      }

      await serverManager.stopServer(project.path, serverId);
      res.json({success: true});
    } catch (error: any) {
      console.error('Error stopping server:', error);
      res.status(500).json({error: error.message});
    }
  });

  return router;
};
