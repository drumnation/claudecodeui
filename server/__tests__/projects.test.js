import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';

// Mock dependencies before dynamic imports
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    rm: vi.fn(),
    access: vi.fn()
  }
}));

vi.mock('../monorepo', () => ({
  annotateMonorepo: vi.fn(),
  detectLanguage: vi.fn(),
  detectWorktree: vi.fn(),
  getMainRepoPath: vi.fn()
}));

vi.mock('child_process', () => ({
  exec: vi.fn((cmd, cb) => cb(null, '', '')),
  execSync: vi.fn(() => '')
}));

// Dynamic imports for CommonJS modules
const fsPromises = (await import('fs')).promises;
const projectsModule = await import('../projects.js');
const { 
  getProjects, 
  generateDisplayName,
  getProjectSessions,
  renameProject,
  deleteProject,
  createProject
} = projectsModule;
const monorepo = await import('../monorepo.js');

describe('projects.js', () => {
  const homeDir = '/home/test';
  const claudeDir = path.join(homeDir, '.claude');
  const projectsJsonPath = path.join(claudeDir, 'projects.json');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(os, 'homedir').mockReturnValue(homeDir);
    vi.spyOn(path, 'resolve').mockImplementation((...args) => {
      if (args.length === 1 && args[0].startsWith('~')) {
        return path.join(homeDir, args[0].slice(2));
      }
      return path.join(...args);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProjects', () => {
    it('should return empty object when projects.json does not exist', async () => {
      fsPromises.readFile.mockRejectedValue({ code: 'ENOENT' });

      const result = await getProjects();

      expect(result).toEqual({});
      expect(fsPromises.readFile).toHaveBeenCalledWith(projectsJsonPath, 'utf8');
    });

    it('should return projects with session information', async () => {
      const projectsData = {
        '/project1': { name: 'project1', path: '/project1' },
        '/project2': { name: 'project2', path: '/project2' }
      };
      
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath === projectsJsonPath) {
          return Promise.resolve(JSON.stringify(projectsData));
        }
        if (filePath.includes('sessions.jsonl')) {
          return Promise.resolve('{"id":"session1","summary":"Test session","messageCount":5}\n{"id":"session2","summary":"Another session","messageCount":10}');
        }
        return Promise.reject(new Error('File not found'));
      });

      fsPromises.readdir.mockResolvedValue(['session1', 'session2']);
      fsPromises.stat.mockResolvedValue({ isDirectory: () => true });

      monorepo.detectLanguage.mockResolvedValue('javascript');
      monorepo.annotateMonorepo.mockImplementation((project) => project);
      monorepo.detectWorktree.mockResolvedValue(false);

      const result = await getProjects();

      expect(result).toHaveProperty('/project1');
      expect(result).toHaveProperty('/project2');
      expect(result['/project1'].sessions).toBeDefined();
      expect(result['/project1'].language).toBe('javascript');
    });

    it('should handle moved projects with path resolution heuristics', async () => {
      const projectsData = {
        '/old/path/project': { name: 'project', path: '/old/path/project' }
      };

      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath === projectsJsonPath) {
          return Promise.resolve(JSON.stringify(projectsData));
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      fsPromises.access.mockImplementation((filePath) => {
        if (filePath === '/old/path/project') {
          return Promise.reject({ code: 'ENOENT' });
        }
        if (filePath === '/new/path/project') {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      fsPromises.readdir.mockImplementation(() => Promise.reject({ code: 'ENOENT' }));

      monorepo.detectLanguage.mockResolvedValue('unknown');
      monorepo.annotateMonorepo.mockImplementation((project) => project);
      monorepo.detectWorktree.mockResolvedValue(false);

      const result = await getProjects();

      expect(result).toHaveProperty('/old/path/project');
      expect(result['/old/path/project'].missing).toBe(false);
    });

    it('should detect worktree projects and resolve main repo path', async () => {
      const projectsData = {
        '/worktree/project': { name: 'project', path: '/worktree/project' }
      };

      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath === projectsJsonPath) {
          return Promise.resolve(JSON.stringify(projectsData));
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      fsPromises.access.mockResolvedValue();
      fsPromises.readdir.mockImplementation(() => Promise.reject({ code: 'ENOENT' }));

      monorepo.detectWorktree.mockResolvedValue(true);
      monorepo.getMainRepoPath.mockResolvedValue('/main/repo');
      monorepo.detectLanguage.mockResolvedValue('go');
      monorepo.annotateMonorepo.mockImplementation((project) => ({
        ...project,
        isMonorepo: true,
        subprojects: ['sub1', 'sub2']
      }));

      const result = await getProjects();

      expect(result['/worktree/project'].isWorktree).toBe(true);
      expect(result['/worktree/project'].mainRepoPath).toBe('/main/repo');
      expect(result['/worktree/project'].isMonorepo).toBe(true);
      expect(result['/worktree/project'].subprojects).toEqual(['sub1', 'sub2']);
    });

    it('should handle malformed projects.json gracefully', async () => {
      fsPromises.readFile.mockResolvedValue('invalid json');

      const result = await getProjects();

      expect(result).toEqual({});
    });

    it('should sort sessions by last activity', async () => {
      const projectsData = {
        '/project': { name: 'project', path: '/project' }
      };

      const sessions = [
        '{"id":"old","summary":"Old session","messageCount":5,"lastActivity":"2023-01-01T00:00:00Z"}',
        '{"id":"new","summary":"New session","messageCount":10,"lastActivity":"2023-12-31T23:59:59Z"}',
        '{"id":"middle","summary":"Middle session","messageCount":7,"lastActivity":"2023-06-15T12:00:00Z"}'
      ].join('\n');

      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath === projectsJsonPath) {
          return Promise.resolve(JSON.stringify(projectsData));
        }
        if (filePath.includes('sessions.jsonl')) {
          return Promise.resolve(sessions);
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      fsPromises.readdir.mockResolvedValue(['old', 'new', 'middle']);
      fsPromises.stat.mockResolvedValue({ isDirectory: () => true });
      fsPromises.access.mockResolvedValue();

      monorepo.detectLanguage.mockResolvedValue('javascript');
      monorepo.annotateMonorepo.mockImplementation((project) => project);
      monorepo.detectWorktree.mockResolvedValue(false);

      const result = await getProjects();

      const sessionIds = result['/project'].sessions.map(s => s.id);
      expect(sessionIds).toEqual(['new', 'middle', 'old']);
    });
  });

  describe('generateDisplayName', () => {
    it('should generate display name from package.json', async () => {
      fsPromises.readFile.mockResolvedValue(JSON.stringify({ name: 'my-package' }));
      fsPromises.access.mockResolvedValue();

      const displayName = await generateDisplayName('/project/path');

      expect(displayName).toBe('my-package');
      expect(fsPromises.readFile).toHaveBeenCalledWith('/project/path/package.json', 'utf8');
    });

    it('should generate display name from pyproject.toml', async () => {
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.reject({ code: 'ENOENT' });
        }
        if (filePath.endsWith('pyproject.toml')) {
          return Promise.resolve('[tool.poetry]\nname = "python-project"');
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('pyproject.toml')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const displayName = await generateDisplayName('/project/path');

      expect(displayName).toBe('python-project');
    });

    it('should generate display name from Cargo.toml', async () => {
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('Cargo.toml')) {
          return Promise.resolve('[package]\nname = "rust-project"');
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('Cargo.toml')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const displayName = await generateDisplayName('/project/path');

      expect(displayName).toBe('rust-project');
    });

    it('should generate display name from go.mod', async () => {
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('go.mod')) {
          return Promise.resolve('module github.com/user/go-project\n\ngo 1.21');
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('go.mod')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const displayName = await generateDisplayName('/project/path');

      expect(displayName).toBe('go-project');
    });

    it('should generate display name from pom.xml', async () => {
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('pom.xml')) {
          return Promise.resolve('<project><artifactId>java-project</artifactId></project>');
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('pom.xml')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const displayName = await generateDisplayName('/project/path');

      expect(displayName).toBe('java-project');
    });

    it('should generate display name from composer.json', async () => {
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('composer.json')) {
          return Promise.resolve(JSON.stringify({ name: 'vendor/php-project' }));
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('composer.json')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const displayName = await generateDisplayName('/project/path');

      expect(displayName).toBe('php-project');
    });

    it('should generate display name from pubspec.yaml', async () => {
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('pubspec.yaml')) {
          return Promise.resolve('name: flutter_project\ndescription: A Flutter app');
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('pubspec.yaml')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const displayName = await generateDisplayName('/project/path');

      expect(displayName).toBe('flutter_project');
    });

    it('should fallback to directory name when no manifest found', async () => {
      fsPromises.readFile.mockRejectedValue({ code: 'ENOENT' });
      fsPromises.access.mockRejectedValue({ code: 'ENOENT' });

      const displayName = await generateDisplayName('/path/to/my-project');

      expect(displayName).toBe('my-project');
    });

    it('should handle malformed manifest files gracefully', async () => {
      fsPromises.readFile.mockResolvedValue('invalid json');
      fsPromises.access.mockResolvedValue();

      const displayName = await generateDisplayName('/path/to/project');

      expect(displayName).toBe('project');
    });
  });

  describe('getProjectSessions', () => {
    it('should return paginated sessions', async () => {
      const sessions = Array.from({ length: 15 }, (_, i) => ({
        id: `session${i}`,
        summary: `Session ${i}`,
        messageCount: i * 2,
        lastActivity: new Date(2023, 0, i + 1).toISOString()
      }));

      fsPromises.readdir.mockResolvedValue(sessions.map(s => s.id));
      fsPromises.stat.mockResolvedValue({ isDirectory: () => true });
      fsPromises.readFile.mockResolvedValue(sessions.map(s => JSON.stringify(s)).join('\n'));

      const result = await getProjectSessions('/project', 0, 10);

      expect(result.sessions).toHaveLength(10);
      expect(result.meta.hasMore).toBe(true);
      expect(result.meta.total).toBe(15);
      expect(result.sessions[0].id).toBe('session14'); // Most recent first
    });

    it('should handle missing sessions directory', async () => {
      fsPromises.readdir.mockRejectedValue({ code: 'ENOENT' });

      const result = await getProjectSessions('/project');

      expect(result.sessions).toEqual([]);
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.total).toBe(0);
    });

    it('should filter out non-directory entries', async () => {
      fsPromises.readdir.mockResolvedValue(['session1', 'file.txt', 'session2']);
      fsPromises.stat.mockImplementation((filePath) => ({
        isDirectory: () => !filePath.includes('file.txt')
      }));
      fsPromises.readFile.mockResolvedValue('{"id":"session","summary":"Test","messageCount":1}');

      const result = await getProjectSessions('/project');

      expect(result.sessions).toHaveLength(2);
      expect(result.sessions.map(s => s.id)).toEqual(['session1', 'session2']);
    });
  });

  describe('renameProject', () => {
    it('should rename project successfully', async () => {
      const projectsData = {
        '/old/path': { name: 'old-name', path: '/old/path', displayName: 'Old Name' }
      };

      fsPromises.readFile.mockResolvedValue(JSON.stringify(projectsData));
      fsPromises.writeFile.mockResolvedValue();

      const result = await renameProject('/old/path', '/new/path');

      expect(result).toBe(true);
      expect(fsPromises.writeFile).toHaveBeenCalledWith(
        projectsJsonPath,
        expect.stringContaining('/new/path')
      );
    });

    it('should handle non-existent project', async () => {
      fsPromises.readFile.mockResolvedValue(JSON.stringify({}));

      const result = await renameProject('/non/existent', '/new/path');

      expect(result).toBe(false);
      expect(fsPromises.writeFile).not.toHaveBeenCalled();
    });

    it('should create projects.json if it does not exist', async () => {
      fsPromises.readFile.mockRejectedValue({ code: 'ENOENT' });
      fsPromises.mkdir.mockResolvedValue();
      fsPromises.writeFile.mockResolvedValue();

      const result = await renameProject('/old/path', '/new/path');

      expect(result).toBe(false); // Project doesn't exist
      expect(fsPromises.mkdir).toHaveBeenCalledWith(claudeDir, { recursive: true });
    });
  });

  describe('deleteProject', () => {
    it('should delete project and its sessions', async () => {
      const projectsData = {
        '/project/to/delete': { name: 'project', path: '/project/to/delete' },
        '/other/project': { name: 'other', path: '/other/project' }
      };

      fsPromises.readFile.mockResolvedValue(JSON.stringify(projectsData));
      fsPromises.writeFile.mockResolvedValue();
      fsPromises.rm.mockResolvedValue();
      fsPromises.access.mockResolvedValue();

      const result = await deleteProject('/project/to/delete');

      expect(result).toBe(true);
      expect(fsPromises.rm).toHaveBeenCalledWith(
        expect.stringContaining('project-to-delete'),
        { recursive: true, force: true }
      );
      expect(fsPromises.writeFile).toHaveBeenCalledWith(
        projectsJsonPath,
        expect.not.stringContaining('/project/to/delete')
      );
    });

    it('should handle non-existent project', async () => {
      fsPromises.readFile.mockResolvedValue(JSON.stringify({}));

      const result = await deleteProject('/non/existent');

      expect(result).toBe(false);
      expect(fsPromises.rm).not.toHaveBeenCalled();
    });

    it('should continue even if sessions directory does not exist', async () => {
      const projectsData = {
        '/project': { name: 'project', path: '/project' }
      };

      fsPromises.readFile.mockResolvedValue(JSON.stringify(projectsData));
      fsPromises.writeFile.mockResolvedValue();
      fsPromises.access.mockRejectedValue({ code: 'ENOENT' });

      const result = await deleteProject('/project');

      expect(result).toBe(true);
      expect(fsPromises.rm).not.toHaveBeenCalled();
    });
  });

  describe('createProject', () => {
    it('should create new project with generated display name', async () => {
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath === projectsJsonPath) {
          return Promise.resolve(JSON.stringify({}));
        }
        if (filePath.endsWith('package.json')) {
          return Promise.resolve(JSON.stringify({ name: 'new-project' }));
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      fsPromises.writeFile.mockResolvedValue();

      monorepo.detectLanguage.mockResolvedValue('javascript');
      monorepo.annotateMonorepo.mockImplementation((project) => project);
      monorepo.detectWorktree.mockResolvedValue(false);

      const result = await createProject('/new/project');

      expect(result).toBe(true);
      expect(fsPromises.writeFile).toHaveBeenCalledWith(
        projectsJsonPath,
        expect.stringContaining('new-project')
      );
    });

    it('should not create duplicate project', async () => {
      const projectsData = {
        '/existing/project': { name: 'existing', path: '/existing/project' }
      };

      fsPromises.readFile.mockResolvedValue(JSON.stringify(projectsData));

      const result = await createProject('/existing/project');

      expect(result).toBe(false);
      expect(fsPromises.writeFile).not.toHaveBeenCalled();
    });

    it('should handle manual project name', async () => {
      fsPromises.readFile.mockResolvedValue(JSON.stringify({}));
      fsPromises.writeFile.mockResolvedValue();
      fsPromises.access.mockRejectedValue({ code: 'ENOENT' });

      monorepo.detectLanguage.mockResolvedValue('unknown');
      monorepo.annotateMonorepo.mockImplementation((project) => project);
      monorepo.detectWorktree.mockResolvedValue(false);

      const result = await createProject('/new/project', 'Custom Name');

      expect(result).toBe(true);
      expect(fsPromises.writeFile).toHaveBeenCalledWith(
        projectsJsonPath,
        expect.stringContaining('Custom Name')
      );
    });
  });
});