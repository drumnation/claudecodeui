import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {promises as fs} from 'fs';
import {createReadStream} from 'fs';
import * as readline from 'readline';
import * as repository from './projects.repository.js';
import type {ProjectConfig, JsonlEntry, PackageJson} from './projects.types.js';

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    appendFile: vi.fn(),
    rm: vi.fn(),
    access: vi.fn(),
  },
  createReadStream: vi.fn(),
}));

vi.mock('readline', () => ({
  createInterface: vi.fn(),
}));

describe('projects.repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('readProjectConfig', () => {
    it('should read and parse project config', async () => {
      const mockConfig: ProjectConfig = {
        project1: {displayName: 'Project One'},
        project2: {displayName: 'Project Two', manuallyAdded: true},
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      const result = await repository.readProjectConfig('/home');

      expect(fs.readFile).toHaveBeenCalledWith(
        '/home/.claude/project-config.json',
        'utf8',
      );
      expect(result).toEqual(mockConfig);
    });

    it('should return empty object on error', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const result = await repository.readProjectConfig('/home');

      expect(result).toEqual({});
    });
  });

  describe('writeProjectConfig', () => {
    it('should write project config as formatted JSON', async () => {
      const config: ProjectConfig = {
        project1: {displayName: 'Project One'},
      };

      await repository.writeProjectConfig('/home', config);

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/home/.claude/project-config.json',
        JSON.stringify(config, null, 2),
        'utf8',
      );
    });
  });

  describe('readProjectDirectories', () => {
    it('should return directory names', async () => {
      const mockEntries = [
        {name: 'project1', isDirectory: () => true},
        {name: 'project2', isDirectory: () => true},
        {name: 'file.txt', isDirectory: () => false},
      ];

      vi.mocked(fs.readdir).mockResolvedValue(mockEntries as any);

      const result =
        await repository.readProjectDirectories('/claude/projects');

      expect(fs.readdir).toHaveBeenCalledWith('/claude/projects', {
        withFileTypes: true,
      });
      expect(result).toEqual(['project1', 'project2']);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Permission denied'));

      const result =
        await repository.readProjectDirectories('/claude/projects');

      expect(result).toEqual([]);
    });
  });

  describe('readPackageJson', () => {
    it('should read and parse package.json', async () => {
      const mockPackage: PackageJson = {name: 'my-package'};

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackage));

      const result = await repository.readPackageJson('/project');

      expect(fs.readFile).toHaveBeenCalledWith('/project/package.json', 'utf8');
      expect(result).toEqual(mockPackage);
    });

    it('should return null on error', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const result = await repository.readPackageJson('/project');

      expect(result).toBeNull();
    });
  });

  describe('readJsonlFiles', () => {
    it('should filter for .jsonl files', async () => {
      const mockFiles = [
        'session1.jsonl',
        'session2.jsonl',
        'readme.txt',
        'data.json',
      ];

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);

      const result = await repository.readJsonlFiles('/project');

      expect(result).toEqual(['session1.jsonl', 'session2.jsonl']);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Permission denied'));

      const result = await repository.readJsonlFiles('/project');

      expect(result).toEqual([]);
    });
  });

  describe('getFileStats', () => {
    it('should return files with modification times', async () => {
      const mockFiles = ['file1.jsonl', 'file2.jsonl'];
      const mockStats = [
        {mtime: new Date('2024-01-01')},
        {mtime: new Date('2024-01-02')},
      ];

      vi.mocked(fs.stat)
        .mockResolvedValueOnce(mockStats[0] as any)
        .mockResolvedValueOnce(mockStats[1] as any);

      const result = await repository.getFileStats('/project', mockFiles);

      expect(result).toEqual([
        {file: 'file1.jsonl', mtime: mockStats[0].mtime},
        {file: 'file2.jsonl', mtime: mockStats[1].mtime},
      ]);
    });
  });

  describe('readJsonlFileStream', () => {
    it('should process each line of JSONL file', async () => {
      const mockStream = {on: vi.fn().mockReturnThis()};
      const mockInterface = {
        [Symbol.asyncIterator]: function* () {
          yield '{"sessionId": "1", "message": "test1"}';
          yield '{"sessionId": "2", "message": "test2"}';
          yield ''; // Empty line should be skipped
          yield '{"sessionId": "3", "message": "test3"}';
        },
      };

      vi.mocked(createReadStream).mockReturnValue(mockStream as any);
      vi.mocked(readline.createInterface).mockReturnValue(mockInterface as any);

      const entries: JsonlEntry[] = [];
      await repository.readJsonlFileStream('/file.jsonl', (entry) => {
        entries.push(entry);
      });

      expect(entries).toHaveLength(3);
      expect(entries[0]).toEqual({sessionId: '1', message: 'test1'});
      expect(entries[1]).toEqual({sessionId: '2', message: 'test2'});
      expect(entries[2]).toEqual({sessionId: '3', message: 'test3'});
    });

    it('should handle JSON parsing errors', async () => {
      const mockStream = {on: vi.fn().mockReturnThis()};
      const mockInterface = {
        [Symbol.asyncIterator]: function* () {
          yield '{"valid": "json"}';
          yield 'invalid json';
          yield '{"another": "valid"}';
        },
      };

      vi.mocked(createReadStream).mockReturnValue(mockStream as any);
      vi.mocked(readline.createInterface).mockReturnValue(mockInterface as any);

      const entries: JsonlEntry[] = [];
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await repository.readJsonlFileStream('/file.jsonl', (entry) => {
        entries.push(entry);
      });

      expect(entries).toHaveLength(2);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[JSONL Parser] Error parsing line 2:',
        expect.any(String),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('readJsonlFile', () => {
    it('should read file content', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('file content');

      const result = await repository.readJsonlFile('/file.jsonl');

      expect(fs.readFile).toHaveBeenCalledWith('/file.jsonl', 'utf8');
      expect(result).toBe('file content');
    });
  });

  describe('writeJsonlFile', () => {
    it('should write content to file', async () => {
      await repository.writeJsonlFile('/file.jsonl', 'content');

      expect(fs.writeFile).toHaveBeenCalledWith('/file.jsonl', 'content');
    });
  });

  describe('appendToJsonlFile', () => {
    it('should append JSON entry with newlines', async () => {
      const entry: JsonlEntry = {
        sessionId: 'session1',
        type: 'summary',
        summary: 'Test summary',
      };

      await repository.appendToJsonlFile('/file.jsonl', entry);

      expect(fs.appendFile).toHaveBeenCalledWith(
        '/file.jsonl',
        '\n' + JSON.stringify(entry) + '\n',
      );
    });
  });

  describe('removeDirectory', () => {
    it('should remove directory recursively', async () => {
      await repository.removeDirectory('/project/dir');

      expect(fs.rm).toHaveBeenCalledWith('/project/dir', {
        recursive: true,
        force: true,
      });
    });
  });

  describe('checkPathExists', () => {
    it('should return true if path exists', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await repository.checkPathExists('/existing/path');

      expect(result).toBe(true);
    });

    it('should return false if path does not exist', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      const result = await repository.checkPathExists('/missing/path');

      expect(result).toBe(false);
    });
  });

  describe('checkDirectoryExists', () => {
    it('should return true if directory exists', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await repository.checkDirectoryExists('/existing/dir');

      expect(result).toBe(true);
    });

    it('should return false for ENOENT error', async () => {
      const error = new Error('Directory not found');
      (error as any).code = 'ENOENT';
      vi.mocked(fs.access).mockRejectedValue(error);

      const result = await repository.checkDirectoryExists('/missing/dir');

      expect(result).toBe(false);
    });

    it('should throw other errors', async () => {
      const error = new Error('Permission denied');
      (error as any).code = 'EACCES';
      vi.mocked(fs.access).mockRejectedValue(error);

      await expect(
        repository.checkDirectoryExists('/protected/dir'),
      ).rejects.toThrow('Permission denied');
    });
  });
});
