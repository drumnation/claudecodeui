import {describe, it, expect, vi, beforeEach} from 'vitest';
import {promises as fs} from 'fs';
import path from 'path';
import {readPackageJson, getAvailableScripts} from './servers.repository.js';

vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    readFile: vi.fn(),
  },
}));

describe('servers.repository', () => {
  let mockLogger: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      isLevelEnabled: vi.fn().mockReturnValue(false),
      child: vi.fn().mockReturnThis(),
    };
  });

  describe('readPackageJson', () => {
    it('should read and parse package.json successfully', async () => {
      const mockPackageJson = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          dev: 'npm run dev',
          build: 'npm run build',
        },
      };

      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(mockPackageJson, null, 2),
      );

      const result = await readPackageJson('/project/path');

      expect(fs.access).toHaveBeenCalledWith(
        path.join('/project/path', 'package.json'),
      );
      expect(fs.readFile).toHaveBeenCalledWith(
        path.join('/project/path', 'package.json'),
        'utf8',
      );
      expect(result).toEqual(mockPackageJson);
    });

    it('should return null if package.json does not exist', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      const result = await readPackageJson('/project/path');

      expect(result).toBeNull();
    });

    it('should return null if package.json is invalid JSON', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue('invalid json');

      const result = await readPackageJson('/project/path');

      expect(result).toBeNull();
    });

    it('should return null on read error', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'));

      const result = await readPackageJson('/project/path');

      expect(result).toBeNull();
    });
  });

  describe('getAvailableScripts', () => {
    it('should return array of script names', async () => {
      const mockPackageJson = {
        name: 'test-project',
        scripts: {
          dev: 'npm run dev',
          build: 'npm run build',
          test: 'npm test',
        },
      };

      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await getAvailableScripts('/project/path', mockLogger);

      expect(result).toEqual(['dev', 'build', 'test']);
    });

    it('should return empty array if no scripts section', async () => {
      const mockPackageJson = {
        name: 'test-project',
        version: '1.0.0',
      };

      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await getAvailableScripts('/project/path', mockLogger);

      expect(result).toEqual([]);
    });

    it('should return empty array if package.json not found', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      const result = await getAvailableScripts('/project/path', mockLogger);

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'));

      const result = await getAvailableScripts('/project/path', mockLogger);

      expect(result).toEqual([]);
    });

    it('should log appropriate messages', async () => {
      // Test successful case
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          scripts: {dev: 'npm run dev'},
        }),
      );

      await getAvailableScripts('/project/path', mockLogger);

      expect(mockLogger.debug).toHaveBeenCalledWith('🔍 Looking for scripts', {
        projectPath: '/project/path',
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('📜 Found scripts', {
        scripts: ['dev'],
        projectPath: '/project/path',
      });

      // Clear mocks before next test case
      vi.clearAllMocks();

      // Test no package.json case
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      await getAvailableScripts('/another/path', mockLogger);

      expect(mockLogger.debug).toHaveBeenCalledWith('🔍 Looking for scripts', {
        projectPath: '/another/path',
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('📦 No package.json found', {
        projectPath: '/another/path',
      });

      // Clear mocks before next test case
      vi.clearAllMocks();

      // Test no scripts section
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({name: 'test'}));

      await getAvailableScripts('/third/path', mockLogger);

      expect(mockLogger.debug).toHaveBeenCalledWith('🔍 Looking for scripts', {
        projectPath: '/third/path',
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('📦 No scripts section in package.json', {
        projectPath: '/third/path',
      });

      // Clear mocks before next test case
      vi.clearAllMocks();

      // Test error case - readPackageJson returns null for errors
      vi.mocked(fs.access).mockRejectedValue(new Error('Read error'));

      await getAvailableScripts('/error/path', mockLogger);

      expect(mockLogger.debug).toHaveBeenCalledWith('🔍 Looking for scripts', {
        projectPath: '/error/path',
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('📦 No package.json found', {
        projectPath: '/error/path',
      });
    });
  });
});
