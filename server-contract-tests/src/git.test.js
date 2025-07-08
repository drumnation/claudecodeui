import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { 
  api, 
  initTestEnvironment, 
  cleanupTestEnvironment,
  createTestProject,
  compareResponses,
  recordTestResult,
  TEST_DATA_DIR
} from './test-utils.js';
import path from 'path';
import fs from 'fs/promises';
import { execSync } from 'child_process';

describe('Git API Contract Tests', () => {
  let gitProjectPath;
  let gitProjectName;

  beforeAll(async () => {
    await initTestEnvironment();
    
    // Create a git-enabled test project
    gitProjectName = 'git-test-project';
    gitProjectPath = await createTestProject(gitProjectName, {
      language: 'javascript',
      git: true
    });
    
    // Add and commit initial files
    await fs.writeFile(path.join(gitProjectPath, 'README.md'), '# Test Project\n');
    await fs.writeFile(path.join(gitProjectPath, 'index.js'), 'console.log("hello");\n');
    
    execSync('git add .', { cwd: gitProjectPath });
    execSync('git commit -m "Initial commit"', { cwd: gitProjectPath });
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  describe('Project Path Encoding Tests', () => {
    it('should handle project names with leading dash (frontend format)', async () => {
      // Simulate frontend encoding with leading dash
      const encodedPath = '-Users-dmieloch-Dev-experiments-cc-ui-claudecodeui';
      
      const response = await api.get('/api/git/status', {
        params: { project: encodedPath }
      });
      
      // Should handle the format without error
      expect(response.status).toBe(200);
      if (response.data.error) {
        // If error, should be about project not found, not encoding issues
        expect(response.data.error).toMatch(/Project directory not found|Not a git repository/);
      }
    });

    it('should handle project names without leading dash (backend format)', async () => {
      // Simulate backend encoding without leading dash
      const encodedPath = 'Users-dmieloch-Dev-experiments-cc-ui-claudecodeui';
      
      const response = await api.get('/api/git/status', {
        params: { project: encodedPath }
      });
      
      expect(response.status).toBe(200);
      if (response.data.error) {
        expect(response.data.error).toMatch(/Project directory not found|Not a git repository/);
      }
    });

    it('should handle real workspace paths like current project', async () => {
      // Use the actual current workspace path
      const currentPath = path.resolve(__dirname, '../../..');
      const encodedPath = currentPath.replace(/^\//g, '').replace(/\//g, '-');
      
      const response = await api.get('/api/git/status', {
        params: { project: encodedPath }
      });
      
      expect(response.status).toBe(200);
      // Should return actual git status for the real project
      if (!response.data.error) {
        expect(response.data).toHaveProperty('branch');
        expect(response.data).toHaveProperty('modified');
        expect(response.data).toHaveProperty('added');
        expect(response.data).toHaveProperty('deleted');
        expect(response.data).toHaveProperty('untracked');
      }
    });

    it('should handle case variations in project paths', async () => {
      const variations = [
        'Users-dmieloch-Dev-experiments-cc-ui-claudecodeui',
        'users-dmieloch-dev-experiments-cc-ui-claudecodeui',
        'Users-dmieloch-dev-experiments-cc-ui-claudecodeui'
      ];
      
      for (const projectName of variations) {
        const response = await api.get('/api/git/status', {
          params: { project: projectName }
        });
        
        expect(response.status).toBe(200);
        // Should not return internal server errors
        if (response.status === 500) {
          expect(response.data.error).not.toContain('Internal server error');
        }
      }
    });

    it('should handle paths with special characters and spaces', async () => {
      const specialPaths = [
        'Users-name with spaces-project',
        'Users-name.with.dots-project',
        'Users-name_with_underscores-project'
      ];
      
      for (const projectName of specialPaths) {
        const response = await api.get('/api/git/status', {
          params: { project: projectName }
        });
        
        expect(response.status).toBe(200);
      }
    });

    it('should return helpful error messages for encoding issues', async () => {
      const response = await api.get('/api/git/status', {
        params: { project: 'definitely-not-a-real-project-path-12345' }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.error).toBeDefined();
      expect(response.data.error).toContain('Project directory not found');
      expect(response.data.error).toContain('ensure the project exists');
    });
  });

  describe('GET /api/git/status', () => {
    beforeEach(async () => {
      // Reset any changes
      try {
        execSync('git checkout .', { cwd: gitProjectPath });
        execSync('git clean -fd', { cwd: gitProjectPath });
      } catch (e) {
        // Ignore errors
      }
    });

    it('should return clean status when no changes', async () => {
      // Use encoded project name format
      const encodedProjectName = gitProjectPath.replace(/^\//g, '').replace(/\//g, '-');
      
      const response = await api.get('/api/git/status', {
        params: { project: encodedProjectName }
      });
      
      const expectedStructure = {
        branch: expect.any(String),
        files: []
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('git-status-clean', 'GET /api/git/status', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.branch).toBe('main');
      expect(response.data.files).toEqual([]);
    });

    it('should detect modified and untracked files', async () => {
      // Modify existing file
      await fs.writeFile(path.join(gitProjectPath, 'index.js'), 'console.log("modified");\n');
      
      // Add untracked file
      await fs.writeFile(path.join(gitProjectPath, 'new-file.txt'), 'new content\n');
      
      const response = await api.get('/api/git/status', {
        params: { project: gitProjectPath }
      });
      
      const expectedStructure = {
        branch: 'main',
        files: [
          {
            path: 'index.js',
            status: 'M',
            type: 'modified'
          },
          {
            path: 'new-file.txt',
            status: '??',
            type: 'untracked'
          }
        ]
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('git-status-changes', 'GET /api/git/status', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.files).toHaveLength(2);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await api.get('/api/git/status', {
        params: { project: '/non/existent/path' }
      });
      
      expect(response.status).toBe(404);
      expect(response.data.error).toBe('Project not found');
    });
  });

  describe('GET /api/git/diff', () => {
    beforeEach(async () => {
      // Create a modified file
      await fs.writeFile(path.join(gitProjectPath, 'index.js'), 'console.log("modified");\n// new line\n');
    });

    it('should return diff for modified file', async () => {
      const response = await api.get('/api/git/diff', {
        params: { 
          project: gitProjectPath,
          file: 'index.js'
        }
      });
      
      const expectedStructure = {
        diff: expect.any(String)
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('git-diff', 'GET /api/git/diff', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.diff).toContain('console.log("modified");');
      expect(response.data.diff).toContain('@@');
    });

    it('should return staged diff when requested', async () => {
      execSync('git add index.js', { cwd: gitProjectPath });
      
      const response = await api.get('/api/git/diff', {
        params: { 
          project: gitProjectPath,
          file: 'index.js',
          staged: true
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.diff).toBeTruthy();
    });

    it('should return 400 when file parameter missing', async () => {
      const response = await api.get('/api/git/diff', {
        params: { project: gitProjectPath }
      });
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('File path is required');
    });
  });

  describe('POST /api/git/commit', () => {
    it('should create commit with staging', async () => {
      // Create files to commit
      await fs.writeFile(path.join(gitProjectPath, 'file1.txt'), 'content 1');
      await fs.writeFile(path.join(gitProjectPath, 'file2.txt'), 'content 2');
      
      const response = await api.post('/api/git/commit', {
        project: gitProjectPath,
        message: 'Test commit message',
        files: ['file1.txt', 'file2.txt']
      });
      
      const expectedStructure = {
        success: true,
        output: expect.any(String)
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('git-commit', 'POST /api/git/commit', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.output).toContain('Test commit message');
    });

    it('should return 400 when message is missing', async () => {
      const response = await api.post('/api/git/commit', {
        project: gitProjectPath
      });
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Commit message is required');
    });
  });

  describe('GET /api/git/branches', () => {
    beforeEach(async () => {
      // Create a test branch
      try {
        execSync('git checkout -b test-branch', { cwd: gitProjectPath });
        execSync('git checkout main', { cwd: gitProjectPath });
      } catch (e) {
        // Branch might already exist
      }
    });

    it('should list all branches', async () => {
      const response = await api.get('/api/git/branches', {
        params: { project: gitProjectPath }
      });
      
      const expectedStructure = {
        current: 'main',
        local: expect.arrayContaining(['main', 'test-branch']),
        remote: expect.any(Array)
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('git-branches', 'GET /api/git/branches', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.current).toBe('main');
      expect(response.data.local).toContain('main');
      expect(response.data.local).toContain('test-branch');
    });
  });

  describe('POST /api/git/checkout', () => {
    it('should checkout existing branch', async () => {
      const response = await api.post('/api/git/checkout', {
        project: gitProjectPath,
        branch: 'test-branch'
      });
      
      const expected = { success: true };
      const differences = compareResponses(expected, response.data);
      
      await recordTestResult('git-checkout', 'POST /api/git/checkout', expected, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      // Verify we're on the new branch
      const output = execSync('git branch --show-current', { cwd: gitProjectPath }).toString().trim();
      expect(output).toBe('test-branch');
      
      // Switch back
      execSync('git checkout main', { cwd: gitProjectPath });
    });

    it('should return 400 when branch is missing', async () => {
      const response = await api.post('/api/git/checkout', {
        project: gitProjectPath
      });
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Branch name is required');
    });
  });

  describe('POST /api/git/create-branch', () => {
    it('should create and checkout new branch', async () => {
      const branchName = `feature-${Date.now()}`;
      
      const response = await api.post('/api/git/create-branch', {
        project: gitProjectPath,
        branch: branchName
      });
      
      const expected = { success: true };
      const differences = compareResponses(expected, response.data);
      
      await recordTestResult('git-create-branch', 'POST /api/git/create-branch', expected, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      // Verify branch was created
      const branches = execSync('git branch', { cwd: gitProjectPath }).toString();
      expect(branches).toContain(branchName);
      
      // Clean up
      execSync('git checkout main', { cwd: gitProjectPath });
      execSync(`git branch -D ${branchName}`, { cwd: gitProjectPath });
    });
  });

  describe('GET /api/git/commits', () => {
    it('should return commit history', async () => {
      const response = await api.get('/api/git/commits', {
        params: { 
          project: gitProjectPath,
          limit: 5
        }
      });
      
      const expectedStructure = [{
        hash: expect.any(String),
        author: expect.any(String),
        email: expect.any(String),
        date: expect.any(String),
        message: expect.any(String),
        stats: {
          filesChanged: expect.any(Number),
          insertions: expect.any(Number),
          deletions: expect.any(Number)
        }
      }];

      // Just check the first commit structure
      const differences = compareResponses(expectedStructure[0], response.data[0]);
      
      await recordTestResult('git-commits', 'GET /api/git/commits', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/git/commit-diff', () => {
    it('should return diff for specific commit', async () => {
      // Get the latest commit hash
      const hash = execSync('git rev-parse HEAD', { cwd: gitProjectPath }).toString().trim();
      
      const response = await api.get('/api/git/commit-diff', {
        params: { 
          project: gitProjectPath,
          hash: hash
        }
      });
      
      const expectedStructure = {
        diff: expect.any(String)
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('git-commit-diff', 'GET /api/git/commit-diff', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.diff).toBeTruthy();
    });

    it('should return 400 when hash is missing', async () => {
      const response = await api.get('/api/git/commit-diff', {
        params: { project: gitProjectPath }
      });
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Commit hash is required');
    });
  });

  describe('POST /api/git/generate-commit-message', () => {
    it('should generate commit message from diff', async () => {
      // Make a change
      await fs.writeFile(path.join(gitProjectPath, 'test.js'), 'function test() { return true; }');
      
      const response = await api.post('/api/git/generate-commit-message', {
        project: gitProjectPath
      });
      
      const expectedStructure = {
        message: expect.any(String)
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('git-generate-message', 'POST /api/git/generate-commit-message', expectedStructure, response.data, differences);
      
      // This might fail if Claude CLI isn't available, so we check status
      if (response.status === 200) {
        expect(response.data.message).toBeTruthy();
      } else {
        expect(response.status).toBe(500);
        expect(response.data.error).toContain('Failed to generate commit message');
      }
    });

    it('should return 400 when no changes to commit', async () => {
      // Reset any changes
      execSync('git checkout .', { cwd: gitProjectPath });
      execSync('git clean -fd', { cwd: gitProjectPath });
      
      const response = await api.post('/api/git/generate-commit-message', {
        project: gitProjectPath
      });
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('No changes to commit');
    });
  });
});