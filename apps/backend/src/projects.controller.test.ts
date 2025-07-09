import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';

// Mock the projects service before importing the controller
vi.mock('./modules/projects/projects.service', () => ({
  projectsService: {
    getProjects: vi.fn(),
    scanProjects: vi.fn(),
  },
}));

// Import after mocking
import { handleGetProjects } from './projects.controller';
import { projectsService } from './modules/projects/projects.service';

// Get typed reference to the mocked service
const mockProjectsService = projectsService as any;

describe('Projects Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockReq = {
      query: {},
      params: {},
    };

    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleGetProjects', () => {
    it('should return projects successfully', async () => {
      const mockProjects = [
        {
          name: 'project1',
          path: '/path/to/project1',
          type: 'git',
          branch: 'main',
          lastModified: new Date('2023-01-01'),
        },
        {
          name: 'project2',
          path: '/path/to/project2',
          type: 'folder',
          lastModified: new Date('2023-01-02'),
        },
      ];

      mockProjectsService.getProjects.mockResolvedValue(mockProjects);

      await handleGetProjects(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(mockProjects);
    });

    it('should handle refresh parameter', async () => {
      mockReq.query = { refresh: 'true' };
      const mockProjects = [
        {
          name: 'project1',
          path: '/path/to/project1',
          type: 'git',
        },
      ];

      mockProjectsService.getProjects.mockResolvedValue(mockProjects);

      await handleGetProjects(mockReq as Request, mockRes as Response);

      expect(mockProjectsService.getProjects).toHaveBeenCalledWith();
      expect(mockRes.json).toHaveBeenCalledWith(mockProjects);
    });

    it('should handle projects service errors', async () => {
      mockProjectsService.getProjects.mockRejectedValue(new Error('Failed to scan projects'));

      await handleGetProjects(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to get projects',
      });
    });

    it('should handle empty projects list', async () => {
      mockProjectsService.getProjects.mockResolvedValue([]);

      await handleGetProjects(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should handle projects with missing metadata', async () => {
      const mockProjects = [
        {
          name: 'project1',
          path: '/path/to/project1',
          type: 'git',
          // Missing branch and lastModified
        },
      ];

      mockProjectsService.getProjects.mockResolvedValue(mockProjects);

      await handleGetProjects(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(mockProjects);
    });

    it('should handle very large projects list', async () => {
      const mockProjects = Array.from({ length: 1000 }, (_, i) => ({
        name: `project${i}`,
        path: `/path/to/project${i}`,
        type: 'folder',
      }));

      mockProjectsService.getProjects.mockResolvedValue(mockProjects);

      await handleGetProjects(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(mockProjects);
    });
  });
});