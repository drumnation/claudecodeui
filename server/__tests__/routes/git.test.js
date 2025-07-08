import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import path from 'path';

// Mock dependencies
vi.mock('child_process', () => ({
  exec: vi.fn()
}));

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn()
  }
}));

vi.mock('../../projects', () => ({
  getProjects: vi.fn()
}));

// Dynamic imports for CommonJS modules
const { exec } = await import('child_process');
const fsPromises = (await import('fs')).promises;
const gitRouter = (await import('../../routes/git.js')).default;
const { getProjects } = await import('../../projects.js');

describe('git routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/git', gitRouter);

    // Default mock for getProjects - return array format
    getProjects.mockResolvedValue([
      {
        name: 'Users-dmieloch-Dev-experiments-cc-ui-claudecodeui',
        fullPath: '/Users/dmieloch/Dev/experiments/cc-ui/claudecodeui',
        displayName: 'claudecodeui'
      },
      {
        name: 'test-project',
        fullPath: '/test/project',
        displayName: 'test-project'
      }
    ]);

    // Mock fs.promises.access to simulate existing directories
    fsPromises.access = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/git/status', () => {
    it('should return git status for a project', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git rev-parse --git-dir')) {
          cb(null, '.git');
        } else if (cmd.includes('git status --porcelain')) {
          cb(null, 'M  src/index.js\n?? newfile.txt\n');
        } else if (cmd.includes('git rev-parse --abbrev-ref HEAD')) {
          cb(null, 'main\n');
        }
      });

      const res = await request(app)
        .get('/api/git/status?project=test-project');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        branch: 'main',
        modified: ['src/index.js'],
        added: [],
        deleted: [],
        untracked: ['newfile.txt']
      });
    });

    it('should handle project name with leading dash (frontend format)', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git rev-parse --git-dir')) {
          cb(null, '.git');
        } else if (cmd.includes('git status --porcelain')) {
          cb(null, 'M  src/index.js\n');
        } else if (cmd.includes('git rev-parse --abbrev-ref HEAD')) {
          cb(null, 'main\n');
        }
      });

      const res = await request(app)
        .get('/api/git/status?project=-Users-dmieloch-Dev-experiments-cc-ui-claudecodeui');

      expect(res.status).toBe(200);
      expect(res.body.branch).toBe('main');
      expect(res.body.modified).toContain('src/index.js');
    });

    it('should handle real workspace paths', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git rev-parse --git-dir')) {
          cb(null, '.git');
        } else if (cmd.includes('git status --porcelain')) {
          cb(null, 'M  README.md\n');
        } else if (cmd.includes('git rev-parse --abbrev-ref HEAD')) {
          cb(null, 'main\n');
        }
      });

      const res = await request(app)
        .get('/api/git/status?project=Users-dmieloch-Dev-experiments-cc-ui-claudecodeui');

      expect(res.status).toBe(200);
      expect(res.body.branch).toBe('main');
      expect(res.body.modified).toContain('README.md');
    });

    it('should handle case sensitivity variations', async () => {
      // Mock projects with different case
      getProjects.mockResolvedValue([
        {
          name: 'Users-dmieloch-dev-experiments-cc-ui-claudecodeui',
          fullPath: '/Users/dmieloch/dev/experiments/cc-ui/claudecodeui',
          displayName: 'claudecodeui'
        }
      ]);

      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git rev-parse --git-dir')) {
          cb(null, '.git');
        } else if (cmd.includes('git status --porcelain')) {
          cb(null, '');
        } else if (cmd.includes('git rev-parse --abbrev-ref HEAD')) {
          cb(null, 'main\n');
        }
      });

      // Test with uppercase Dev
      const res = await request(app)
        .get('/api/git/status?project=Users-dmieloch-Dev-experiments-cc-ui-claudecodeui');

      expect(res.status).toBe(200);
    });

    it('should handle staged files correctly', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git status --porcelain')) {
          cb(null, 'A  added.js\nM  modified.js\nMM both.js\nD  deleted.js\n');
        } else if (cmd.includes('git rev-parse --abbrev-ref HEAD')) {
          cb(null, 'feature-branch\n');
        }
      });

      const res = await request(app)
        .get('/api/git/status?project=/test/project');

      expect(res.status).toBe(200);
      expect(res.body.files).toEqual([
        { path: 'added.js', status: 'A', type: 'added' },
        { path: 'modified.js', status: 'M', type: 'modified' },
        { path: 'both.js', status: 'MM', type: 'modified' },
        { path: 'deleted.js', status: 'D', type: 'deleted' }
      ]);
    });

    it('should handle project not found', async () => {
      getProjects.mockResolvedValue([]);
      
      // Mock fs.access to fail
      fsPromises.access = vi.fn().mockRejectedValue(new Error('ENOENT'));

      const res = await request(app)
        .get('/api/git/status?project=nonexistent-project');

      expect(res.status).toBe(200);
      expect(res.body.error).toContain('Project directory not found');
    });

    it('should handle not a git repository error', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git rev-parse --git-dir')) {
          cb(new Error('fatal: not a git repository'));
        }
      });

      const res = await request(app)
        .get('/api/git/status?project=test-project');

      expect(res.status).toBe(200);
      expect(res.body.error).toContain('Not a git repository');
      expect(res.body.error).toContain('Initialize with');
    });

    it('should handle malformed project parameter', async () => {
      const res = await request(app)
        .get('/api/git/status?project=');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Project name is required');
    });

    it('should handle special characters in project names', async () => {
      getProjects.mockResolvedValue([
        {
          name: 'user-project-with-special-chars',
          fullPath: '/Users/name with spaces/project',
          displayName: 'project'
        }
      ]);

      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git rev-parse --git-dir')) {
          cb(null, '.git');
        } else if (cmd.includes('git status --porcelain')) {
          cb(null, '');
        } else if (cmd.includes('git rev-parse --abbrev-ref HEAD')) {
          cb(null, 'main\n');
        }
      });

      const res = await request(app)
        .get('/api/git/status?project=user-project-with-special-chars');

      expect(res.status).toBe(200);
    });

    it('should handle git command errors gracefully', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git rev-parse --git-dir')) {
          cb(null, '.git');
        } else if (cmd.includes('git status --porcelain')) {
          cb(new Error('fatal: bad revision'));
        }
      });

      const res = await request(app)
        .get('/api/git/status?project=test-project');

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Git operation failed');
    });
  });

  describe('GET /api/git/diff', () => {
    it('should return diff for a file', async () => {
      const diffOutput = `diff --git a/src/index.js b/src/index.js
index 123..456 100644
--- a/src/index.js
+++ b/src/index.js
@@ -1,3 +1,4 @@
+const newLine = true;
 const existing = 'code';`;

      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git diff')) {
          cb(null, diffOutput);
        }
      });

      const res = await request(app)
        .get('/api/git/diff?project=/test/project&file=src/index.js');

      expect(res.status).toBe(200);
      expect(res.body.diff).toBe(diffOutput);
      expect(exec).toHaveBeenCalledWith(
        'git diff src/index.js',
        { cwd: '/test/project' },
        expect.any(Function)
      );
    });

    it('should handle staged diff', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(null, 'staged diff content');
      });

      const res = await request(app)
        .get('/api/git/diff?project=/test/project&file=staged.js&staged=true');

      expect(res.status).toBe(200);
      expect(exec).toHaveBeenCalledWith(
        'git diff --cached staged.js',
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should handle missing file parameter', async () => {
      const res = await request(app)
        .get('/api/git/diff?project=/test/project');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('File path is required');
    });
  });

  describe('POST /api/git/commit', () => {
    it('should create a commit with staging files', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git add')) {
          cb(null, '');
        } else if (cmd.includes('git commit')) {
          cb(null, '[main abc123] Test commit\n 2 files changed');
        }
      });

      const res = await request(app)
        .post('/api/git/commit')
        .send({
          project: '/test/project',
          message: 'Test commit',
          files: ['src/index.js', 'src/utils.js']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(exec).toHaveBeenCalledWith(
        'git add src/index.js src/utils.js',
        { cwd: '/test/project' },
        expect.any(Function)
      );
      expect(exec).toHaveBeenCalledWith(
        'git commit -m "Test commit"',
        { cwd: '/test/project' },
        expect.any(Function)
      );
    });

    it('should handle commit without staging', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(null, '[main def456] Direct commit\n 1 file changed');
      });

      const res = await request(app)
        .post('/api/git/commit')
        .send({
          project: '/test/project',
          message: 'Direct commit'
        });

      expect(res.status).toBe(200);
      expect(exec).toHaveBeenCalledTimes(1);
      expect(exec).not.toHaveBeenCalledWith(
        expect.stringContaining('git add'),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should handle missing commit message', async () => {
      const res = await request(app)
        .post('/api/git/commit')
        .send({
          project: '/test/project'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Commit message is required');
    });

    it('should escape commit message properly', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(null, 'success');
      });

      const res = await request(app)
        .post('/api/git/commit')
        .send({
          project: '/test/project',
          message: 'Fix "quoted" issue & special chars'
        });

      expect(res.status).toBe(200);
      expect(exec).toHaveBeenCalledWith(
        'git commit -m "Fix \\"quoted\\" issue & special chars"',
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /api/git/branches', () => {
    it('should list all branches', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git branch -a')) {
          cb(null, '* main\n  feature-1\n  feature-2\n  remotes/origin/main\n  remotes/origin/feature-1\n');
        }
      });

      const res = await request(app)
        .get('/api/git/branches?project=/test/project');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        current: 'main',
        local: ['main', 'feature-1', 'feature-2'],
        remote: ['origin/main', 'origin/feature-1']
      });
    });

    it('should handle empty repository', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(null, '');
      });

      const res = await request(app)
        .get('/api/git/branches?project=/test/project');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        current: null,
        local: [],
        remote: []
      });
    });
  });

  describe('POST /api/git/checkout', () => {
    it('should checkout existing branch', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(null, "Switched to branch 'feature-branch'");
      });

      const res = await request(app)
        .post('/api/git/checkout')
        .send({
          project: '/test/project',
          branch: 'feature-branch'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(exec).toHaveBeenCalledWith(
        'git checkout feature-branch',
        { cwd: '/test/project' },
        expect.any(Function)
      );
    });

    it('should handle missing branch parameter', async () => {
      const res = await request(app)
        .post('/api/git/checkout')
        .send({
          project: '/test/project'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Branch name is required');
    });

    it('should handle checkout errors', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(new Error("error: pathspec 'nonexistent' did not match"));
      });

      const res = await request(app)
        .post('/api/git/checkout')
        .send({
          project: '/test/project',
          branch: 'nonexistent'
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Checkout failed');
    });
  });

  describe('POST /api/git/create-branch', () => {
    it('should create and checkout new branch', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(null, "Switched to a new branch 'new-feature'");
      });

      const res = await request(app)
        .post('/api/git/create-branch')
        .send({
          project: '/test/project',
          branch: 'new-feature'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(exec).toHaveBeenCalledWith(
        'git checkout -b new-feature',
        { cwd: '/test/project' },
        expect.any(Function)
      );
    });

    it('should handle branch name with special characters', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(null, 'success');
      });

      const res = await request(app)
        .post('/api/git/create-branch')
        .send({
          project: '/test/project',
          branch: 'feature/new-ui'
        });

      expect(res.status).toBe(200);
      expect(exec).toHaveBeenCalledWith(
        'git checkout -b feature/new-ui',
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should handle branch already exists error', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(new Error("fatal: A branch named 'existing' already exists"));
      });

      const res = await request(app)
        .post('/api/git/create-branch')
        .send({
          project: '/test/project',
          branch: 'existing'
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('already exists');
    });
  });

  describe('GET /api/git/commits', () => {
    it('should return commit history with stats', async () => {
      const gitLog = `abc123|John Doe|john@example.com|2023-12-01T10:00:00Z|Fix bug in login
def456|Jane Smith|jane@example.com|2023-11-30T15:30:00Z|Add new feature`;

      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git log')) {
          cb(null, gitLog);
        } else if (cmd.includes('git show --stat')) {
          cb(null, ' 2 files changed, 10 insertions(+), 5 deletions(-)');
        }
      });

      const res = await request(app)
        .get('/api/git/commits?project=/test/project&limit=2');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toEqual({
        hash: 'abc123',
        author: 'John Doe',
        email: 'john@example.com',
        date: '2023-12-01T10:00:00Z',
        message: 'Fix bug in login',
        stats: {
          filesChanged: 2,
          insertions: 10,
          deletions: 5
        }
      });
    });

    it('should handle pagination with skip parameter', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        expect(cmd).toContain('--skip=10');
        cb(null, '');
      });

      await request(app)
        .get('/api/git/commits?project=/test/project&skip=10');

      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining('--skip=10'),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should handle empty commit history', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(null, '');
      });

      const res = await request(app)
        .get('/api/git/commits?project=/test/project');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should parse commit stats correctly', async () => {
      const statsVariations = [
        { output: ' 1 file changed, 5 insertions(+)', expected: { filesChanged: 1, insertions: 5, deletions: 0 } },
        { output: ' 3 files changed, 20 deletions(-)', expected: { filesChanged: 3, insertions: 0, deletions: 20 } },
        { output: ' 10 files changed, 100 insertions(+), 50 deletions(-)', expected: { filesChanged: 10, insertions: 100, deletions: 50 } }
      ];

      for (const { output, expected } of statsVariations) {
        exec.mockImplementation((cmd, opts, cb) => {
          if (cmd.includes('git log')) {
            cb(null, 'abc123|Author|email|2023-01-01|Message');
          } else {
            cb(null, output);
          }
        });

        const res = await request(app)
          .get('/api/git/commits?project=/test/project&limit=1');

        expect(res.body[0].stats).toEqual(expected);
      }
    });
  });

  describe('GET /api/git/commit-diff', () => {
    it('should return diff for specific commit', async () => {
      const diffOutput = `diff --git a/file1.js b/file1.js
index 123..456 100644
--- a/file1.js
+++ b/file1.js
@@ -1,3 +1,4 @@
+added line
 existing line`;

      exec.mockImplementation((cmd, opts, cb) => {
        cb(null, diffOutput);
      });

      const res = await request(app)
        .get('/api/git/commit-diff?project=/test/project&hash=abc123');

      expect(res.status).toBe(200);
      expect(res.body.diff).toBe(diffOutput);
      expect(exec).toHaveBeenCalledWith(
        'git show abc123',
        { cwd: '/test/project', maxBuffer: 10 * 1024 * 1024 },
        expect.any(Function)
      );
    });

    it('should handle missing hash parameter', async () => {
      const res = await request(app)
        .get('/api/git/commit-diff?project=/test/project');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Commit hash is required');
    });

    it('should handle invalid commit hash', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(new Error('fatal: bad object xyz789'));
      });

      const res = await request(app)
        .get('/api/git/commit-diff?project=/test/project&hash=xyz789');

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Failed to get commit diff');
    });
  });

  describe('POST /api/git/generate-commit-message', () => {
    it('should generate commit message from diff', async () => {
      const diffOutput = `diff --git a/src/auth.js b/src/auth.js
+function validateToken(token) {
+  return token && token.length > 0;
+}`;

      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git diff')) {
          cb(null, diffOutput);
        }
      });

      // Mock the Claude CLI call
      const originalExec = exec.getMockImplementation();
      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('claude-cli')) {
          cb(null, JSON.stringify({ message: 'Add token validation to auth module' }));
        } else {
          originalExec(cmd, opts, cb);
        }
      });

      const res = await request(app)
        .post('/api/git/generate-commit-message')
        .send({
          project: '/test/project'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Add token validation to auth module');
    });

    it('should handle empty diff', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        cb(null, '');
      });

      const res = await request(app)
        .post('/api/git/generate-commit-message')
        .send({
          project: '/test/project'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('No changes to commit');
    });

    it('should handle Claude CLI errors', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        if (cmd.includes('git diff')) {
          cb(null, 'some changes');
        } else if (cmd.includes('claude-cli')) {
          cb(new Error('Claude API error'));
        }
      });

      const res = await request(app)
        .post('/api/git/generate-commit-message')
        .send({
          project: '/test/project'
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Failed to generate commit message');
    });
  });

  describe('Error handling', () => {
    it('should handle missing project parameter', async () => {
      const res = await request(app)
        .get('/api/git/status');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Project path is required');
    });

    it('should sanitize project paths', async () => {
      exec.mockImplementation((cmd, opts, cb) => {
        // Verify cwd doesn't contain path traversal
        expect(opts.cwd).not.toContain('..');
        cb(null, '');
      });

      await request(app)
        .get('/api/git/status?project=/test/../../../etc/passwd');

      // The exact behavior depends on path.resolve, but it should sanitize
      expect(exec).toHaveBeenCalled();
    });
  });
});