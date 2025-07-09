import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { FilesService } from './files.service';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    stat: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    access: vi.fn(),
    mkdir: vi.fn(),
  }
}));

// Mock path
vi.mock('path', () => ({
  join: vi.fn(),
  resolve: vi.fn(),
  dirname: vi.fn(),
  basename: vi.fn(),
  extname: vi.fn(),
  relative: vi.fn(),
  isAbsolute: vi.fn(),
}));

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

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FilesService();
    
    // Default path mocks
    (path.join as any).mockImplementation((...args: string[]) => args.join('/'));
    (path.resolve as any).mockImplementation((p: string) => p);
    (path.dirname as any).mockImplementation((p: string) => p.split('/').slice(0, -1).join('/'));
    (path.basename as any).mockImplementation((p: string) => p.split('/').pop());
    (path.extname as any).mockImplementation((p: string) => {
      const parts = p.split('.');
      return parts.length > 1 ? '.' + parts.pop() : '';
    });
    (path.relative as any).mockImplementation((from: string, to: string) => to);
    (path.isAbsolute as any).mockImplementation((p: string) => p.startsWith('/'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProjectFiles', () => {
    it('should return project files in tree structure', async () => {
      const mockFiles = [
        { name: 'src', isDirectory: () => true },
        { name: 'package.json', isDirectory: () => false },
        { name: 'README.md', isDirectory: () => false },
      ];

      (fs.readdir as any).mockResolvedValue(mockFiles);
      (fs.stat as any).mockResolvedValue({
        isDirectory: () => false,
        size: 1024,
        mtime: new Date('2023-01-01'),
      });

      const result = await service.getProjectFiles('/test/project');

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        name: 'src',
        type: 'directory',
      });
      expect(result[1]).toMatchObject({
        name: 'package.json',
        type: 'file',
      });
    });

    it('should handle empty directories', async () => {
      (fs.readdir as any).mockResolvedValue([]);

      const result = await service.getProjectFiles('/empty/project');

      expect(result).toEqual([]);
    });

    it('should handle read errors', async () => {
      (fs.readdir as any).mockRejectedValue(new Error('Permission denied'));

      const result = await service.getProjectFiles('/restricted/project');

      expect(result).toEqual([]);
    });

    it('should filter out ignored files', async () => {
      const mockFiles = [
        { name: 'src', isDirectory: () => true },
        { name: '.git', isDirectory: () => true },
        { name: 'node_modules', isDirectory: () => true },
        { name: '.DS_Store', isDirectory: () => false },
        { name: 'package.json', isDirectory: () => false },
      ];

      (fs.readdir as any).mockResolvedValue(mockFiles);
      (fs.stat as any).mockResolvedValue({
        isDirectory: () => false,
        size: 1024,
        mtime: new Date('2023-01-01'),
      });

      const result = await service.getProjectFiles('/test/project');

      expect(result).toHaveLength(2);
      expect(result.map(f => f.name)).toEqual(['src', 'package.json']);
    });
  });

  describe('getFileContent', () => {
    it('should read file content', async () => {
      const mockContent = 'Hello, World!';
      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await service.getFileContent('/test/file.txt');

      expect(result).toBe(mockContent);
      expect(fs.readFile).toHaveBeenCalledWith('/test/file.txt', 'utf8');
    });

    it('should handle read errors', async () => {
      (fs.readFile as any).mockRejectedValue(new Error('File not found'));

      await expect(service.getFileContent('/non/existent/file.txt')).rejects.toThrow('File not found');
    });
  });

  describe('saveFileContent', () => {
    it('should save file content', async () => {
      const content = 'New content';
      (fs.mkdir as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockResolvedValue(undefined);

      await service.saveFileContent('/test/file.txt', content);

      expect(fs.writeFile).toHaveBeenCalledWith('/test/file.txt', content, 'utf8');
    });

    it('should create directory if it doesnt exist', async () => {
      const content = 'New content';
      (fs.mkdir as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockResolvedValue(undefined);

      await service.saveFileContent('/test/nested/file.txt', content);

      expect(fs.mkdir).toHaveBeenCalledWith('/test/nested', { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith('/test/nested/file.txt', content, 'utf8');
    });

    it('should handle write errors', async () => {
      (fs.mkdir as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockRejectedValue(new Error('Permission denied'));

      await expect(service.saveFileContent('/restricted/file.txt', 'content')).rejects.toThrow('Permission denied');
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      (fs.access as any).mockResolvedValue(undefined);

      const result = await service.fileExists('/test/file.txt');

      expect(result).toBe(true);
      expect(fs.access).toHaveBeenCalledWith('/test/file.txt');
    });

    it('should return false for non-existent file', async () => {
      (fs.access as any).mockRejectedValue(new Error('File not found'));

      const result = await service.fileExists('/non/existent/file.txt');

      expect(result).toBe(false);
    });
  });

  describe('getFileStats', () => {
    it('should return file statistics', async () => {
      const mockStats = {
        isDirectory: () => false,
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
        ctime: new Date('2023-01-01'),
      };

      (fs.stat as any).mockResolvedValue(mockStats);

      const result = await service.getFileStats('/test/file.txt');

      expect(result).toEqual(mockStats);
      expect(fs.stat).toHaveBeenCalledWith('/test/file.txt');
    });

    it('should handle stat errors', async () => {
      (fs.stat as any).mockRejectedValue(new Error('File not found'));

      await expect(service.getFileStats('/non/existent/file.txt')).rejects.toThrow('File not found');
    });
  });
});