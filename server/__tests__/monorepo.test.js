import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';

// Mock dependencies before dynamic imports
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    readFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn()
  }
}));

vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

// Dynamic imports for CommonJS modules
const fsPromises = (await import('fs')).promises;
const monorepoModule = await import('../monorepo.js');
const { 
  detectLanguage, 
  annotateMonorepo, 
  detectWorktree, 
  getMainRepoPath, 
  findRepoRoot,
  listSubprojects 
} = monorepoModule;
const { execSync } = await import('child_process');

describe('monorepo.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('detectLanguage', () => {
    it('should detect JavaScript project from package.json', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('javascript');
    });

    it('should detect TypeScript project from tsconfig.json', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('tsconfig.json')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('typescript');
    });

    it('should detect Python project from pyproject.toml', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('pyproject.toml')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('python');
    });

    it('should detect Python project from setup.py', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('setup.py')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('python');
    });

    it('should detect Rust project from Cargo.toml', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('Cargo.toml')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('rust');
    });

    it('should detect Go project from go.mod', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('go.mod')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('go');
    });

    it('should detect Java project from pom.xml', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('pom.xml')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('java');
    });

    it('should detect Java project from build.gradle', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('build.gradle')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('java');
    });

    it('should detect C++ project from CMakeLists.txt', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('CMakeLists.txt')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('cpp');
    });

    it('should detect Ruby project from Gemfile', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('Gemfile')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('ruby');
    });

    it('should detect PHP project from composer.json', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('composer.json')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('php');
    });

    it('should detect Dart/Flutter project from pubspec.yaml', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('pubspec.yaml')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('dart');
    });

    it('should return unknown for unrecognized project', async () => {
      fsPromises.access.mockRejectedValue({ code: 'ENOENT' });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('unknown');
    });

    it('should prioritize TypeScript over JavaScript', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json') || filePath.endsWith('tsconfig.json')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const language = await detectLanguage('/project/path');

      expect(language).toBe('typescript');
    });
  });

  describe('annotateMonorepo', () => {
    it('should detect npm/yarn workspaces monorepo', async () => {
      const project = { path: '/project', language: 'javascript' };
      
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve(JSON.stringify({
            name: 'monorepo',
            workspaces: ['packages/*', 'apps/*']
          }));
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      fsPromises.access.mockResolvedValue();
      fsPromises.readdir.mockResolvedValue(['package1', 'package2']);
      fsPromises.stat.mockResolvedValue({ isDirectory: () => true });

      const result = await annotateMonorepo(project);

      expect(result.isMonorepo).toBe(true);
      expect(result.monorepoType).toBe('npm-workspaces');
      expect(result.subprojects).toContain('packages/package1');
      expect(result.subprojects).toContain('packages/package2');
    });

    it('should detect lerna monorepo', async () => {
      const project = { path: '/project', language: 'javascript' };
      
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('lerna.json')) {
          return Promise.resolve(JSON.stringify({
            packages: ['packages/*']
          }));
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('lerna.json')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      fsPromises.readdir.mockResolvedValue(['lib1', 'lib2']);
      fsPromises.stat.mockResolvedValue({ isDirectory: () => true });

      const result = await annotateMonorepo(project);

      expect(result.isMonorepo).toBe(true);
      expect(result.monorepoType).toBe('lerna');
      expect(result.subprojects).toContain('packages/lib1');
    });

    it('should detect Rust workspace', async () => {
      const project = { path: '/project', language: 'rust' };
      
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('Cargo.toml')) {
          return Promise.resolve('[workspace]\nmembers = ["crates/*"]');
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      fsPromises.access.mockResolvedValue();
      fsPromises.readdir.mockResolvedValue(['crate1', 'crate2']);
      fsPromises.stat.mockResolvedValue({ isDirectory: () => true });

      const result = await annotateMonorepo(project);

      expect(result.isMonorepo).toBe(true);
      expect(result.monorepoType).toBe('cargo-workspace');
      expect(result.subprojects).toContain('crates/crate1');
    });

    it('should detect Go modules workspace', async () => {
      const project = { path: '/project', language: 'go' };
      
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('go.work')) {
          return Promise.resolve('go 1.21\n\nuse (\n    ./cmd/app1\n    ./pkg/lib1\n)');
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('go.work')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const result = await annotateMonorepo(project);

      expect(result.isMonorepo).toBe(true);
      expect(result.monorepoType).toBe('go-workspace');
      expect(result.subprojects).toContain('./cmd/app1');
      expect(result.subprojects).toContain('./pkg/lib1');
    });

    it('should detect nx monorepo', async () => {
      const project = { path: '/project', language: 'typescript' };
      
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('nx.json')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      fsPromises.readdir.mockImplementation((dirPath) => {
        if (dirPath.includes('apps')) {
          return Promise.resolve(['app1', 'app2']);
        }
        if (dirPath.includes('libs')) {
          return Promise.resolve(['lib1', 'lib2']);
        }
        return Promise.resolve([]);
      });
      
      fsPromises.stat.mockResolvedValue({ isDirectory: () => true });

      const result = await annotateMonorepo(project);

      expect(result.isMonorepo).toBe(true);
      expect(result.monorepoType).toBe('nx');
      expect(result.subprojects).toContain('apps/app1');
      expect(result.subprojects).toContain('libs/lib1');
    });

    it('should return project unchanged if not a monorepo', async () => {
      const project = { path: '/project', language: 'javascript' };
      
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve(JSON.stringify({ name: 'simple-project' }));
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const result = await annotateMonorepo(project);

      expect(result.isMonorepo).toBeUndefined();
      expect(result.monorepoType).toBeUndefined();
      expect(result.subprojects).toBeUndefined();
    });

    it('should handle glob pattern expansion correctly', async () => {
      const project = { path: '/project', language: 'javascript' };
      
      fsPromises.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve(JSON.stringify({
            workspaces: ['packages/@scope/*', 'tools/*']
          }));
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      fsPromises.access.mockResolvedValue();
      fsPromises.readdir.mockImplementation((dirPath) => {
        if (dirPath.includes('@scope')) {
          return Promise.resolve(['pkg1', 'pkg2']);
        }
        if (dirPath.includes('tools')) {
          return Promise.resolve(['tool1']);
        }
        return Promise.resolve(['@scope']);
      });
      
      fsPromises.stat.mockResolvedValue({ isDirectory: () => true });

      const result = await annotateMonorepo(project);

      expect(result.subprojects).toContain('packages/@scope/pkg1');
      expect(result.subprojects).toContain('tools/tool1');
    });
  });

  describe('detectWorktree', () => {
    it('should detect Git worktree', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('.git')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      fsPromises.readFile.mockResolvedValue('gitdir: /main/repo/.git/worktrees/feature');
      fsPromises.stat.mockResolvedValue({ isFile: () => true });

      const isWorktree = await detectWorktree('/project/path');

      expect(isWorktree).toBe(true);
    });

    it('should detect regular Git repository', async () => {
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.endsWith('.git')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      fsPromises.stat.mockResolvedValue({ isDirectory: () => true });

      const isWorktree = await detectWorktree('/project/path');

      expect(isWorktree).toBe(false);
    });

    it('should return false for non-Git directory', async () => {
      fsPromises.access.mockRejectedValue({ code: 'ENOENT' });

      const isWorktree = await detectWorktree('/project/path');

      expect(isWorktree).toBe(false);
    });

    it('should handle permission errors gracefully', async () => {
      fsPromises.access.mockRejectedValue({ code: 'EACCES' });

      const isWorktree = await detectWorktree('/project/path');

      expect(isWorktree).toBe(false);
    });
  });

  describe('getMainRepoPath', () => {
    it('should extract main repository path from worktree', async () => {
      fsPromises.readFile.mockResolvedValue('gitdir: /home/user/main-repo/.git/worktrees/feature-branch');

      const mainPath = await getMainRepoPath('/project/worktree');

      expect(mainPath).toBe('/home/user/main-repo');
    });

    it('should handle Windows paths correctly', async () => {
      fsPromises.readFile.mockResolvedValue('gitdir: C:\\Users\\user\\main-repo\\.git\\worktrees\\feature');

      const mainPath = await getMainRepoPath('C:\\project\\worktree');

      expect(mainPath).toBe('C:\\Users\\user\\main-repo');
    });

    it('should return null for invalid gitdir format', async () => {
      fsPromises.readFile.mockResolvedValue('invalid content');

      const mainPath = await getMainRepoPath('/project/worktree');

      expect(mainPath).toBeNull();
    });

    it('should return null if .git file cannot be read', async () => {
      fsPromises.readFile.mockRejectedValue({ code: 'ENOENT' });

      const mainPath = await getMainRepoPath('/project/worktree');

      expect(mainPath).toBeNull();
    });
  });

  describe('findRepoRoot', () => {
    it('should find Git repository root', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git rev-parse --show-toplevel')) {
          return Buffer.from('/home/user/project\n');
        }
        return Buffer.from('');
      });

      const root = await findRepoRoot('/home/user/project/src/components');

      expect(root).toBe('/home/user/project');
    });

    it('should return null for non-Git directory', async () => {
      execSync.mockImplementation(() => {
        throw new Error('Not a git repository');
      });

      const root = await findRepoRoot('/home/user/not-git');

      expect(root).toBeNull();
    });

    it('should handle command execution errors', async () => {
      execSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const root = await findRepoRoot('/project/path');

      expect(root).toBeNull();
    });
  });

  describe('listSubprojects', () => {
    it('should list npm workspace subprojects', async () => {
      fsPromises.readFile.mockResolvedValue(JSON.stringify({
        workspaces: ['packages/*']
      }));
      
      fsPromises.readdir.mockResolvedValue(['pkg1', 'pkg2', 'README.md']);
      fsPromises.stat.mockImplementation((filePath) => ({
        isDirectory: () => !filePath.endsWith('.md')
      }));
      
      fsPromises.access.mockImplementation((filePath) => {
        if (filePath.includes('pkg1') || filePath.includes('pkg2')) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });

      const subprojects = await listSubprojects('/project', 'npm-workspaces', ['packages/*']);

      expect(subprojects).toEqual(['packages/pkg1', 'packages/pkg2']);
    });

    it('should handle nested glob patterns', async () => {
      fsPromises.readFile.mockResolvedValue(JSON.stringify({
        workspaces: ['apps/*/app']
      }));
      
      fsPromises.readdir.mockImplementation((dirPath) => {
        if (dirPath.endsWith('apps')) {
          return Promise.resolve(['web', 'mobile']);
        }
        if (dirPath.includes('web') || dirPath.includes('mobile')) {
          return Promise.resolve(['app', 'tests']);
        }
        return Promise.resolve([]);
      });
      
      fsPromises.stat.mockResolvedValue({ isDirectory: () => true });
      fsPromises.access.mockResolvedValue();

      const subprojects = await listSubprojects('/project', 'npm-workspaces', ['apps/*/app']);

      expect(subprojects).toContain('apps/web/app');
      expect(subprojects).toContain('apps/mobile/app');
    });

    it('should return empty array for invalid workspace patterns', async () => {
      fsPromises.readdir.mockRejectedValue({ code: 'ENOENT' });

      const subprojects = await listSubprojects('/project', 'npm-workspaces', ['nonexistent/*']);

      expect(subprojects).toEqual([]);
    });

    it('should filter out non-directories', async () => {
      fsPromises.readdir.mockResolvedValue(['package1', 'package2', 'README.md', '.gitignore']);
      fsPromises.stat.mockImplementation((filePath) => ({
        isDirectory: () => filePath.includes('package')
      }));
      fsPromises.access.mockResolvedValue();

      const subprojects = await listSubprojects('/project', 'npm-workspaces', ['*']);

      expect(subprojects).toEqual(['package1', 'package2']);
      expect(subprojects).not.toContain('README.md');
      expect(subprojects).not.toContain('.gitignore');
    });
  });
});