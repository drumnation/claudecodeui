import {describe, it, expect, vi, beforeEach} from 'vitest';
import {Request, Response} from 'express';
import * as controller from './projects.controller.js';
import * as service from './projects.service.js';
import * as repository from './projects.repository.js';
import type {
  Project,
  ProjectConfig,
  Session,
  SessionsResult,
  JsonlEntry,
} from './projects.types.js';

vi.mock('./projects.service.js');
vi.mock('./projects.repository.js');

describe('projects.controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnThis();

    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jsonMock,
      status: statusMock,
    };

    // Mock HOME environment variable
    vi.stubEnv('HOME', '/home/user');
  });

  describe('getProjects', () => {
    it('should return projects list', async () => {
      const mockConfig: ProjectConfig = {
        project1: {displayName: 'Custom Name'},
      };
      const mockProject: Project = {
        name: 'project1',
        path: '/claude/projects/project1',
        displayName: 'Custom Name',
        fullPath: '/project1',
        isCustomName: true,
        sessions: [],
      };

      vi.mocked(repository.readProjectConfig).mockResolvedValue(mockConfig);
      vi.mocked(repository.readProjectDirectories).mockResolvedValue([
        'project1',
      ]);
      vi.mocked(service.buildProject).mockResolvedValue(mockProject);

      await controller.getProjects(mockReq as Request, mockRes as Response);

      expect(repository.readProjectConfig).toHaveBeenCalledWith('/home/user');
      expect(repository.readProjectDirectories).toHaveBeenCalledWith(
        '/home/user/.claude/projects',
        expect.any(Object),
      );
      expect(service.buildProject).toHaveBeenCalledWith(
        'project1',
        '/home/user/.claude/projects/project1',
        mockConfig,
        '/home/user',
        expect.any(Object),
      );
      expect(jsonMock).toHaveBeenCalledWith([mockProject]);
    });

    it('should include manually added projects', async () => {
      const mockConfig: ProjectConfig = {
        'manual-project': {
          displayName: 'Manual Project',
          manuallyAdded: true,
        },
      };

      vi.mocked(repository.readProjectConfig).mockResolvedValue(mockConfig);
      vi.mocked(repository.readProjectDirectories).mockResolvedValue([]);
      vi.mocked(service.generateDisplayName).mockResolvedValue(
        'Manual Project',
      );

      await controller.getProjects(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'manual-project',
          path: null,
          displayName: 'Manual Project',
          isManuallyAdded: true,
        }),
      ]);
    });

    it('should handle errors', async () => {
      vi.mocked(repository.readProjectConfig).mockRejectedValue(
        new Error('Read error'),
      );

      await controller.getProjects(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({error: 'Failed to load projects'});
    });
  });

  describe('getSessions', () => {
    it('should return sessions with pagination', async () => {
      mockReq.params = {projectName: 'project1'};
      mockReq.query = {limit: '10', offset: '5'};

      const mockSessions: SessionsResult = {
        sessions: [
          {
            id: 'session1',
            summary: 'Test',
            messageCount: 5,
            lastActivity: new Date(),
            cwd: '/test',
          },
        ],
        hasMore: true,
        total: 20,
      };

      vi.mocked(service.getSessions).mockResolvedValue(mockSessions);

      await controller.getSessions(mockReq as Request, mockRes as Response);

      expect(service.getSessions).toHaveBeenCalledWith(
        '/home/user',
        'project1',
        10,
        5,
        expect.any(Object),
      );
      expect(jsonMock).toHaveBeenCalledWith(mockSessions);
    });

    it('should use default pagination values', async () => {
      mockReq.params = {projectName: 'project1'};

      vi.mocked(service.getSessions).mockResolvedValue({
        sessions: [],
        hasMore: false,
        total: 0,
      });

      await controller.getSessions(mockReq as Request, mockRes as Response);

      expect(service.getSessions).toHaveBeenCalledWith(
        '/home/user',
        'project1',
        5,
        0,
        expect.any(Object),
      );
    });

    it('should return 400 if project name missing', async () => {
      mockReq.params = {};

      await controller.getSessions(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project name is required',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = {projectName: 'project1'};
      vi.mocked(service.getSessions).mockRejectedValue(
        new Error('Session error'),
      );

      await controller.getSessions(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({error: 'Failed to load sessions'});
    });
  });

  describe('getSessionMessages', () => {
    it('should return session messages', async () => {
      mockReq.params = {projectName: 'project1', sessionId: 'session1'};

      const mockMessages: JsonlEntry[] = [
        {sessionId: 'session1', message: {role: 'user', content: 'Hello'}},
        {sessionId: 'session1', message: {role: 'assistant', content: 'Hi'}},
      ];

      vi.mocked(service.getSessionMessages).mockResolvedValue(mockMessages);

      await controller.getSessionMessages(
        mockReq as Request,
        mockRes as Response,
      );

      expect(service.getSessionMessages).toHaveBeenCalledWith(
        '/home/user',
        'project1',
        'session1',
        expect.any(Object),
      );
      expect(jsonMock).toHaveBeenCalledWith({messages: mockMessages});
    });

    it('should return 400 if parameters missing', async () => {
      mockReq.params = {projectName: 'project1'};

      await controller.getSessionMessages(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project name and session ID are required',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = {projectName: 'project1', sessionId: 'session1'};
      vi.mocked(service.getSessionMessages).mockRejectedValue(
        new Error('Read error'),
      );

      await controller.getSessionMessages(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to load session messages',
      });
    });
  });

  describe('renameProject', () => {
    it('should update project display name', async () => {
      mockReq.params = {projectName: 'project1'};
      mockReq.body = {displayName: 'New Name'};

      vi.mocked(repository.readProjectConfig).mockResolvedValue({});
      vi.mocked(repository.writeProjectConfig).mockResolvedValue();

      await controller.renameProject(mockReq as Request, mockRes as Response);

      expect(repository.writeProjectConfig).toHaveBeenCalledWith('/home/user', {
        project1: {displayName: 'New Name'},
      });
      expect(jsonMock).toHaveBeenCalledWith({success: true});
    });

    it('should remove display name if empty', async () => {
      mockReq.params = {projectName: 'project1'};
      mockReq.body = {displayName: ''};

      vi.mocked(repository.readProjectConfig).mockResolvedValue({
        project1: {displayName: 'Old Name'},
      });
      vi.mocked(repository.writeProjectConfig).mockResolvedValue();

      await controller.renameProject(mockReq as Request, mockRes as Response);

      expect(repository.writeProjectConfig).toHaveBeenCalledWith(
        '/home/user',
        {},
      );
      expect(jsonMock).toHaveBeenCalledWith({success: true});
    });

    it('should return 400 if project name missing', async () => {
      mockReq.params = {};
      mockReq.body = {displayName: 'New Name'};

      await controller.renameProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project name is required',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = {projectName: 'project1'};
      mockReq.body = {displayName: 'New Name'};
      vi.mocked(repository.readProjectConfig).mockRejectedValue(
        new Error('Write error'),
      );

      await controller.renameProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to rename project',
      });
    });
  });

  describe('deleteSession', () => {
    it('should delete session entries', async () => {
      mockReq.params = {projectName: 'project1', sessionId: 'session1'};

      vi.mocked(service.findSessionFile).mockResolvedValue(
        '/path/to/file.jsonl',
      );
      vi.mocked(repository.readJsonlFile).mockResolvedValue(
        '{"sessionId":"session1","message":"remove"}\n{"sessionId":"other","message":"keep"}',
      );
      vi.mocked(service.filterSessionEntriesById).mockReturnValue([
        '{"sessionId":"other","message":"keep"}',
      ]);
      vi.mocked(repository.writeJsonlFile).mockResolvedValue();

      await controller.deleteSession(mockReq as Request, mockRes as Response);

      expect(service.filterSessionEntriesById).toHaveBeenCalledWith(
        [
          '{"sessionId":"session1","message":"remove"}',
          '{"sessionId":"other","message":"keep"}',
        ],
        'session1',
      );
      expect(repository.writeJsonlFile).toHaveBeenCalledWith(
        '/path/to/file.jsonl',
        '{"sessionId":"other","message":"keep"}\n',
      );
      expect(jsonMock).toHaveBeenCalledWith({success: true});
    });

    it('should return 404 if session not found', async () => {
      mockReq.params = {projectName: 'project1', sessionId: 'session1'};
      vi.mocked(service.findSessionFile).mockResolvedValue(null);

      await controller.deleteSession(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Session session1 not found',
      });
    });

    it('should return 400 if parameters missing', async () => {
      mockReq.params = {projectName: 'project1'};

      await controller.deleteSession(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project name and session ID are required',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = {projectName: 'project1', sessionId: 'session1'};
      vi.mocked(service.findSessionFile).mockRejectedValue(
        new Error('Search error'),
      );

      await controller.deleteSession(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to delete session',
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete empty project', async () => {
      mockReq.params = {projectName: 'project1'};

      vi.mocked(service.isProjectEmpty).mockResolvedValue(true);
      vi.mocked(repository.removeDirectory).mockResolvedValue();
      vi.mocked(repository.readProjectConfig).mockResolvedValue({project1: {}});
      vi.mocked(repository.writeProjectConfig).mockResolvedValue();

      await controller.deleteProject(mockReq as Request, mockRes as Response);

      expect(repository.removeDirectory).toHaveBeenCalledWith(
        '/home/user/.claude/projects/project1',
      );
      expect(repository.writeProjectConfig).toHaveBeenCalledWith(
        '/home/user',
        {},
      );
      expect(jsonMock).toHaveBeenCalledWith({success: true});
    });

    it('should not delete project with sessions', async () => {
      mockReq.params = {projectName: 'project1'};
      vi.mocked(service.isProjectEmpty).mockResolvedValue(false);

      await controller.deleteProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Cannot delete project with existing sessions',
      });
      expect(repository.removeDirectory).not.toHaveBeenCalled();
    });

    it('should return 400 if project name missing', async () => {
      mockReq.params = {};

      await controller.deleteProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project name is required',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = {projectName: 'project1'};
      vi.mocked(service.isProjectEmpty).mockRejectedValue(
        new Error('Check error'),
      );

      await controller.deleteProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to delete project',
      });
    });
  });

  describe('addProject', () => {
    it('should add new project', async () => {
      mockReq.body = {projectPath: '/new/project', displayName: 'New Project'};

      vi.mocked(repository.checkPathExists).mockResolvedValue(true);
      vi.mocked(repository.checkDirectoryExists).mockResolvedValue(false);
      vi.mocked(repository.readProjectConfig).mockResolvedValue({});
      vi.mocked(repository.writeProjectConfig).mockResolvedValue();

      await controller.addProject(mockReq as Request, mockRes as Response);

      expect(repository.checkPathExists).toHaveBeenCalledWith('/new/project');
      expect(repository.writeProjectConfig).toHaveBeenCalledWith('/home/user', {
        '-new-project': {
          manuallyAdded: true,
          originalPath: '/new/project',
          displayName: 'New Project',
        },
      });
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '-new-project',
          path: null,
          fullPath: '/new/project',
          displayName: 'New Project',
          isManuallyAdded: true,
        }),
      );
    });

    it('should return 400 if path missing', async () => {
      mockReq.body = {};

      await controller.addProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project path is required',
      });
    });

    it('should return 400 if path does not exist', async () => {
      mockReq.body = {projectPath: '/missing/path'};
      vi.mocked(repository.checkPathExists).mockResolvedValue(false);

      await controller.addProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Path does not exist: /missing/path',
      });
    });

    it('should return 400 if project already exists', async () => {
      mockReq.body = {projectPath: '/existing/project'};
      vi.mocked(repository.checkPathExists).mockResolvedValue(true);
      vi.mocked(repository.checkDirectoryExists).mockResolvedValue(true);
      vi.mocked(repository.readProjectConfig).mockResolvedValue({});

      await controller.addProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project already exists for path: /existing/project',
      });
    });

    it('should handle errors', async () => {
      mockReq.body = {projectPath: '/new/project'};
      vi.mocked(repository.checkPathExists).mockRejectedValue(
        new Error('Check error'),
      );

      await controller.addProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({error: 'Failed to add project'});
    });
  });

  describe('updateSessionSummary', () => {
    it('should update session summary', async () => {
      mockReq.params = {projectName: 'project1', sessionId: 'session1'};
      mockReq.body = {summary: 'Updated summary'};

      vi.mocked(service.findSessionFile).mockResolvedValue(
        '/path/to/file.jsonl',
      );
      vi.mocked(repository.appendToJsonlFile).mockResolvedValue();

      await controller.updateSessionSummary(
        mockReq as Request,
        mockRes as Response,
      );

      expect(repository.appendToJsonlFile).toHaveBeenCalledWith(
        '/path/to/file.jsonl',
        expect.objectContaining({
          sessionId: 'session1',
          type: 'summary',
          summary: 'Updated summary',
          timestamp: expect.any(String),
        }),
      );
      expect(jsonMock).toHaveBeenCalledWith({success: true});
    });

    it('should return 400 if parameters missing', async () => {
      mockReq.params = {projectName: 'project1'};
      mockReq.body = {summary: 'Updated summary'};

      await controller.updateSessionSummary(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project name and session ID are required',
      });
    });

    it('should return 400 if summary missing', async () => {
      mockReq.params = {projectName: 'project1', sessionId: 'session1'};
      mockReq.body = {};

      await controller.updateSessionSummary(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({error: 'Summary is required'});
    });

    it('should return 404 if session not found', async () => {
      mockReq.params = {projectName: 'project1', sessionId: 'session1'};
      mockReq.body = {summary: 'Updated summary'};
      vi.mocked(service.findSessionFile).mockResolvedValue(null);

      await controller.updateSessionSummary(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Session session1 not found',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = {projectName: 'project1', sessionId: 'session1'};
      mockReq.body = {summary: 'Updated summary'};
      vi.mocked(service.findSessionFile).mockRejectedValue(
        new Error('Search error'),
      );

      await controller.updateSessionSummary(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to update session summary',
      });
    });
  });
});
