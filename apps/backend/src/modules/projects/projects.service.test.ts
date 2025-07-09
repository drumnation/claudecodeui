import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { ProjectsService } from './projects.service';
import { ProjectDetectionService } from './project-detection.service';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    stat: vi.fn(),
    access: vi.fn(),
    readFile: vi.fn(),
  }
}));

// Mock path
vi.mock('path', () => ({
  join: vi.fn(),
  resolve: vi.fn(),
  dirname: vi.fn(),
  basename: vi.fn(),
}));

// Mock project detection service
vi.mock('./project-detection.service');

// Mock logger
vi.mock('@kit/logger/node', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    isLevelEnabled: vi.fn().mockReturnValue(true)
  }))
}));

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockDetectionService: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock detection service
    mockDetectionService = {
      detectProjectType: vi.fn(),
      getProjectMetadata: vi.fn(),
    };
    
    (ProjectDetectionService as any).mockImplementation(() => mockDetectionService);
    
    service = new ProjectsService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('scanProjects', () => {
    it('should scan projects from default directories', async () => {
      const mockProjects = [
        { name: 'project1', path: '/path/to/project1', type: 'git' },
        { name: 'project2', path: '/path/to/project2', type: 'folder' },
      ];

      // Mock fs.readdir to return directories
      (fs.readdir as any).mockResolvedValue([
        { name: 'project1', isDirectory: () => true },
        { name: 'project2', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false },
      ]);

      // Mock fs.stat
      (fs.stat as any).mockResolvedValue({
        isDirectory: () => true,
        mtime: new Date('2023-01-01'),
      });

      // Mock path.join
      (path.join as any).mockImplementation((...args: string[]) => args.join('/'));

      // Mock detection service
      mockDetectionService.detectProjectType.mockResolvedValue('git');
      mockDetectionService.getProjectMetadata.mockResolvedValue({
        branch: 'main',
        remote: 'origin',
      });

      const result = await service.scanProjects();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        name: 'project1',
        type: 'git',
      });
      expect(result[1]).toMatchObject({
        name: 'project2',
        type: 'git',
      });
    });

    it('should handle scan errors gracefully', async () => {
      (fs.readdir as any).mockRejectedValue(new Error('Permission denied'));

      const result = await service.scanProjects();

      expect(result).toEqual([]);
    });

    it('should filter out hidden directories', async () => {
      (fs.readdir as any).mockResolvedValue([
        { name: 'project1', isDirectory: () => true },
        { name: '.hidden', isDirectory: () => true },
        { name: 'node_modules', isDirectory: () => true },
      ]);

      (fs.stat as any).mockResolvedValue({
        isDirectory: () => true,
        mtime: new Date('2023-01-01'),
      });

      (path.join as any).mockImplementation((...args: string[]) => args.join('/'));

      mockDetectionService.detectProjectType.mockResolvedValue('folder');
      mockDetectionService.getProjectMetadata.mockResolvedValue({});

      const result = await service.scanProjects();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('project1');
    });
  });

  describe('getProjectByName', () => {
    it('should return project by name', async () => {
      const mockProject = {
        name: 'test-project',
        path: '/path/to/test-project',
        type: 'git',
      };

      // Mock the scan to return our test project
      vi.spyOn(service, 'scanProjects').mockResolvedValue([mockProject]);

      const result = await service.getProjectByName('test-project');

      expect(result).toEqual(mockProject);
    });

    it('should return null for non-existent project', async () => {
      vi.spyOn(service, 'scanProjects').mockResolvedValue([]);

      const result = await service.getProjectByName('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('validateProjectPath', () => {
    it('should return true for valid project path', async () => {
      (fs.access as any).mockResolvedValue(undefined);

      const result = await service.validateProjectPath('/valid/path');

      expect(result).toBe(true);
      expect(fs.access).toHaveBeenCalledWith('/valid/path');
    });

    it('should return false for invalid project path', async () => {
      (fs.access as any).mockRejectedValue(new Error('Path not found'));

      const result = await service.validateProjectPath('/invalid/path');

      expect(result).toBe(false);
    });
  });
});