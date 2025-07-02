import {describe, it, expect, vi, beforeEach} from 'vitest';
import {Request, Response} from 'express';
import {WebSocket} from 'ws';
import {createServerRoutes} from './servers.controller.js';
import * as servers from './index.js';
import * as projects from '../projects/index.js';
import type {ExtendedWebSocket} from '../../infra/websocket/index.js';

vi.mock('./index.js');
vi.mock('../projects/index.js');

describe('servers.controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let connectedClients: Set<ExtendedWebSocket>;
  let mockServerManager: any;
  let router: ReturnType<typeof createServerRoutes>;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      params: {},
    };

    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    connectedClients = new Set();

    // Mock server manager
    mockServerManager = {
      startServer: vi.fn(),
      stopServer: vi.fn(),
      getServerStatus: vi.fn(),
    };

    vi.mocked(servers.createServerManager).mockReturnValue(mockServerManager);

    router = createServerRoutes(connectedClients);
  });

  describe('GET /scripts', () => {
    it('should return available scripts for a project', async () => {
      req.params = {projectName: 'test-project'};

      vi.mocked(projects.getProjectsList).mockResolvedValue([
        {name: 'test-project', path: '/path/to/project'},
      ]);

      vi.mocked(servers.getAvailableScripts).mockResolvedValue([
        'dev',
        'build',
        'test',
      ]);

      const route = router.stack.find((r) => r.route?.path === '/scripts')
        ?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        scripts: ['dev', 'build', 'test'],
      });
    });

    it('should return 400 if project name is missing', async () => {
      req.params = {};

      const route = router.stack.find((r) => r.route?.path === '/scripts')
        ?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Project name is required',
      });
    });

    it('should return 404 if project not found', async () => {
      req.params = {projectName: 'unknown-project'};

      vi.mocked(projects.getProjectsList).mockResolvedValue([]);

      const route = router.stack.find((r) => r.route?.path === '/scripts')
        ?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({error: 'Project not found'});
    });

    it('should return 400 if project path is not available', async () => {
      req.params = {projectName: 'test-project'};

      vi.mocked(projects.getProjectsList).mockResolvedValue([
        {name: 'test-project'}, // No path property
      ]);

      const route = router.stack.find((r) => r.route?.path === '/scripts')
        ?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Project path is not available',
      });
    });

    it('should handle errors', async () => {
      req.params = {projectName: 'test-project'};

      vi.mocked(projects.getProjectsList).mockRejectedValue(
        new Error('Database error'),
      );

      const route = router.stack.find((r) => r.route?.path === '/scripts')
        ?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({error: 'Database error'});
    });
  });

  describe('GET /', () => {
    it('should return server status for a project', () => {
      req.params = {projectName: 'test-project'};

      const mockStatus = [
        {
          script: 'dev',
          status: 'running',
          url: 'http://localhost:3000',
          port: '3000',
          startTime: new Date(),
        },
      ];
      mockServerManager.getServerStatus.mockReturnValue(mockStatus);

      const route = router.stack.find((r) => r.route?.path === '/')?.route
        ?.stack[0].handle;
      route(req as Request, res as Response);

      expect(mockServerManager.getServerStatus).toHaveBeenCalledWith(
        'test-project',
      );
      expect(res.json).toHaveBeenCalledWith({servers: mockStatus});
    });

    it('should return 400 if project name is missing', () => {
      req.params = {};

      const route = router.stack.find((r) => r.route?.path === '/')?.route
        ?.stack[0].handle;
      route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Project name is required',
      });
    });
  });

  describe('POST /:serverId/start', () => {
    it('should start a server successfully', async () => {
      req.params = {projectName: 'test-project', serverId: 'dev'};

      vi.mocked(projects.getProjectsList).mockResolvedValue([
        {name: 'test-project', path: '/path/to/project'},
      ]);

      mockServerManager.startServer.mockResolvedValue({
        success: true,
        url: 'http://localhost:3000',
      });

      const route = router.stack.find(
        (r) => r.route?.path === '/:serverId/start',
      )?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(mockServerManager.startServer).toHaveBeenCalledWith(
        '/path/to/project',
        'dev',
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        server: {success: true, url: 'http://localhost:3000'},
      });
    });

    it('should return 400 if parameters are missing', async () => {
      req.params = {projectName: 'test-project'}; // Missing serverId

      const route = router.stack.find(
        (r) => r.route?.path === '/:serverId/start',
      )?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Project name and server ID are required',
      });
    });

    it('should return 404 if project not found', async () => {
      req.params = {projectName: 'unknown-project', serverId: 'dev'};

      vi.mocked(projects.getProjectsList).mockResolvedValue([]);

      const route = router.stack.find(
        (r) => r.route?.path === '/:serverId/start',
      )?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({error: 'Project not found'});
    });

    it('should return 400 if server start fails', async () => {
      req.params = {projectName: 'test-project', serverId: 'dev'};

      vi.mocked(projects.getProjectsList).mockResolvedValue([
        {name: 'test-project', path: '/path/to/project'},
      ]);

      mockServerManager.startServer.mockResolvedValue({
        error: 'Port already in use',
      });

      const route = router.stack.find(
        (r) => r.route?.path === '/:serverId/start',
      )?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({error: 'Port already in use'});
    });

    it('should handle errors', async () => {
      req.params = {projectName: 'test-project', serverId: 'dev'};

      vi.mocked(projects.getProjectsList).mockRejectedValue(
        new Error('Database error'),
      );

      const route = router.stack.find(
        (r) => r.route?.path === '/:serverId/start',
      )?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({error: 'Database error'});
    });
  });

  describe('POST /:serverId/stop', () => {
    it('should stop a server successfully', async () => {
      req.params = {projectName: 'test-project', serverId: 'dev'};

      vi.mocked(projects.getProjectsList).mockResolvedValue([
        {name: 'test-project', path: '/path/to/project'},
      ]);

      mockServerManager.stopServer.mockResolvedValue(undefined);

      const route = router.stack.find(
        (r) => r.route?.path === '/:serverId/stop',
      )?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(mockServerManager.stopServer).toHaveBeenCalledWith(
        '/path/to/project',
        'dev',
      );
      expect(res.json).toHaveBeenCalledWith({success: true});
    });

    it('should return 400 if parameters are missing', async () => {
      req.params = {projectName: 'test-project'}; // Missing serverId

      const route = router.stack.find(
        (r) => r.route?.path === '/:serverId/stop',
      )?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Project name and server ID are required',
      });
    });

    it('should return 404 if project not found', async () => {
      req.params = {projectName: 'unknown-project', serverId: 'dev'};

      vi.mocked(projects.getProjectsList).mockResolvedValue([]);

      const route = router.stack.find(
        (r) => r.route?.path === '/:serverId/stop',
      )?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({error: 'Project not found'});
    });

    it('should handle errors', async () => {
      req.params = {projectName: 'test-project', serverId: 'dev'};

      vi.mocked(projects.getProjectsList).mockRejectedValue(
        new Error('Database error'),
      );

      const route = router.stack.find(
        (r) => r.route?.path === '/:serverId/stop',
      )?.route?.stack[0].handle;
      await route(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({error: 'Database error'});
    });
  });

  describe('broadcast functionality', () => {
    it('should broadcast messages to connected clients', async () => {
      const mockClient1 = {
        readyState: WebSocket.OPEN,
        send: vi.fn(),
      } as unknown as ExtendedWebSocket;

      const mockClient2 = {
        readyState: WebSocket.OPEN,
        send: vi.fn(),
      } as unknown as ExtendedWebSocket;

      const mockClient3 = {
        readyState: WebSocket.CLOSED,
        send: vi.fn(),
      } as unknown as ExtendedWebSocket;

      connectedClients.add(mockClient1);
      connectedClients.add(mockClient2);
      connectedClients.add(mockClient3);

      // Get the broadcast function that was passed to createServerManager
      const broadcastFn = vi.mocked(servers.createServerManager).mock
        .calls[0][0];

      const message = {
        type: 'server:status',
        projectPath: '/path',
        status: 'running',
        url: 'http://localhost:3000',
        script: 'dev',
        timestamp: new Date().toISOString(),
      };

      broadcastFn(message);

      expect(mockClient1.send).toHaveBeenCalledWith(JSON.stringify(message));
      expect(mockClient2.send).toHaveBeenCalledWith(JSON.stringify(message));
      expect(mockClient3.send).not.toHaveBeenCalled(); // Closed connection
    });
  });
});
