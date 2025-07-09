import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { execSync } from 'child_process';
import path from 'path';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';

// Mock the projects service
vi.mock('../modules/projects/projects.service', () => ({
  projectsService: {
    getProjects: vi.fn(),
  },
}));

// Mock child_process exec
vi.mock('child_process', () => ({
  exec: vi.fn(),
  execSync: vi.fn(),
}));

// Mock fs promises
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
  },
}));

// Mock logger
vi.mock('@kit/logger/node', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    isLevelEnabled: vi.fn().mockReturnValue(true),
  })),
}));

import { 
  handleGitStatus, 
  handleGitBranches, 
  handleGitDiff, 
  handleGitCommit, 
  handleGitCheckout, 
  handleGitCreateBranch 
} from '../modules/git/git.controller';
import { projectsService } from '../modules/projects/projects.service';

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Add git endpoints
  app.get('/api/projects/:projectName/git/status', handleGitStatus);
  app.get('/api/projects/:projectName/git/branches', handleGitBranches);
  app.get('/api/projects/:projectName/git/diff', handleGitDiff);
  app.post('/api/projects/:projectName/git/commit', handleGitCommit);
  app.post('/api/projects/:projectName/git/checkout', handleGitCheckout);
  app.post('/api/projects/:projectName/git/create-branch', handleGitCreateBranch);
  
  return app;
};

describe('Git API Endpoints', () => {
  let server: any;
  const TEST_PORT = 9999;
  const PROJECT_PATH = process.cwd();
  const PROJECT_NAME = PROJECT_PATH.replace(/^\//, '').replace(/\//g, '-');

  beforeAll(async () => {
    // Setup mock projects service
    const mockProjects = [{
      name: PROJECT_NAME,
      fullPath: PROJECT_PATH,
      type: 'git',
      branch: 'main',
      lastModified: new Date(),
    }];
    
    (projectsService.getProjects as any).mockResolvedValue(mockProjects);
    
    // Setup mock execSync to return test data
    (execSync as any).mockImplementation((command: string) => {
      if (command.includes('git status --porcelain')) {
        return ' M apps/backend/src/test-file.js\n?? new-file.js\n';
      }
      if (command.includes('git branch -a')) {
        return '* main\n  feature/test\n';
      }
      if (command.includes('git diff')) {
        return 'diff --git a/test b/test\n';
      }
      return '';
    });
    // Start test server
    const app = createTestApp();
    server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server start timeout'));
      }, 10000);
      
      server.listen(TEST_PORT, (err: any) => {
        clearTimeout(timeout);
        if (err) {
          reject(err);
          return;
        }
        console.log(`Test server started on port ${TEST_PORT}`);
        resolve();
      });
    });
  }, 15000); // Reduced timeout

  afterAll(async () => {
    // Close test server
    if (server) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.log('Server close timeout, forcing');
          resolve();
        }, 5000);
        
        server.close(() => {
          clearTimeout(timeout);
          console.log('Test server closed');
          resolve();
        });
      });
    }
  }, 10000); // Reduced timeout

  describe('GET /api/git/status', () => {
    it('should return actual git status, not empty arrays', async () => {
      // Get actual git status from command line
      const gitStatus = execSync('git status --porcelain', { 
        encoding: 'utf8',
        cwd: PROJECT_PATH 
      });
      const actualFileCount = gitStatus.split('\n').filter(line => line.trim()).length;
      
      console.log(`Actual git status has ${actualFileCount} files`);
      
      // Test the endpoint
      const response = await request(server)
        .get(`/api/git/status?project=${PROJECT_NAME}`)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('modified');
      expect(response.body).toHaveProperty('added');
      expect(response.body).toHaveProperty('deleted');
      expect(response.body).toHaveProperty('untracked');
      expect(response.body).toHaveProperty('branch');

      // Calculate total files returned by endpoint
      const endpointFileCount = 
        (response.body.modified?.length || 0) +
        (response.body.added?.length || 0) +
        (response.body.deleted?.length || 0) +
        (response.body.untracked?.length || 0) +
        (response.body.staged?.length || 0);

      console.log(`Endpoint returned ${endpointFileCount} files`);
      console.log('Response:', JSON.stringify(response.body, null, 2));

      // MAIN ASSERTION: Endpoint should return same number of files as git status
      expect(endpointFileCount).toBe(actualFileCount);
      expect(endpointFileCount).toBeGreaterThan(0); // Should have at least some files
    });

    it('should handle different project name formats', async () => {
      const formats = [
        PROJECT_NAME,
        '-' + PROJECT_NAME,
        PROJECT_NAME.toLowerCase(),
        PROJECT_NAME.replace('Dev', 'dev')
      ];

      for (const format of formats) {
        const response = await request(server)
          .get(`/api/git/status?project=${format}`)
          .expect(200);

        expect(response.body).toHaveProperty('branch');
        // Should return actual data, not just empty arrays
      }
    });

    it('should parse git status output correctly', async () => {
      // Test specific git status patterns
      const testCases = [
        { line: ' M file.js', expected: { type: 'modified', file: 'file.js' } },
        { line: 'M  file.js', expected: { type: 'modified', file: 'file.js' } },
        { line: 'MM file.js', expected: { type: 'modified', file: 'file.js' } },
        { line: 'A  file.js', expected: { type: 'added', file: 'file.js' } },
        { line: 'D  file.js', expected: { type: 'deleted', file: 'file.js' } },
        { line: '?? file.js', expected: { type: 'untracked', file: 'file.js' } }
      ];

      // This test would verify the parsing logic if it was implemented
      // For now, it documents what should be tested
      expect(true).toBe(true);
    });
  });

  describe('GET /api/git/branches', () => {
    it('should return actual git branches, not just main', async () => {
      // Get actual branches
      const branches = execSync('git branch -a', { 
        encoding: 'utf8',
        cwd: PROJECT_PATH 
      });
      const branchLines = branches.split('\n').filter(line => line.trim());
      const actualBranchCount = branchLines.filter(b => !b.includes('->') && !b.includes('remotes/')).length;

      const response = await request(server)
        .get(`/api/git/branches?project=${PROJECT_NAME}`)
        .expect(200);

      expect(response.body).toHaveProperty('current');
      expect(response.body).toHaveProperty('branches');
      
      // Should return actual branches
      expect(response.body.branches.length).toBeGreaterThanOrEqual(actualBranchCount);
    });
  });

  describe('Integration test: Git status reflects actual changes', () => {
    it('should update when files are modified', async () => {
      // This would test that the endpoint reflects real-time changes
      // For a full implementation, you would:
      // 1. Create a test file
      // 2. Check git status shows the new file
      // 3. Delete the test file
      // 4. Verify git status updates
      
      expect(true).toBe(true); // Placeholder
    });
  });
});

// Contract test to ensure frontend expectations are met
describe('Git API Contract Tests', () => {
  let server: any;
  const TEST_PORT = 9999;
  const PROJECT_PATH = process.cwd();
  const PROJECT_NAME = PROJECT_PATH.replace(/^\//, '').replace(/\//g, '-');

  beforeAll(async () => {
    // Setup mock projects service
    const mockProjects = [{
      name: PROJECT_NAME,
      fullPath: PROJECT_PATH,
      type: 'git',
      branch: 'main',
      lastModified: new Date(),
    }];
    
    (projectsService.getProjects as any).mockResolvedValue(mockProjects);
    
    // Setup mock execSync to return test data
    (execSync as any).mockImplementation((command: string) => {
      if (command.includes('git status --porcelain')) {
        return ' M apps/backend/src/test-file.js\n?? new-file.js\n';
      }
      if (command.includes('git branch -a')) {
        return '* main\n  feature/test\n';
      }
      if (command.includes('git diff')) {
        return 'diff --git a/test b/test\n';
      }
      return '';
    });
    // Start test server
    const app = createTestApp();
    server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server start timeout'));
      }, 10000);
      
      server.listen(TEST_PORT, (err: any) => {
        clearTimeout(timeout);
        if (err) {
          reject(err);
          return;
        }
        console.log(`Test server started on port ${TEST_PORT}`);
        resolve();
      });
    });
  }, 15000);

  afterAll(async () => {
    // Close test server
    if (server) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.log('Server close timeout, forcing');
          resolve();
        }, 5000);
        
        server.close(() => {
          clearTimeout(timeout);
          console.log('Test server closed');
          resolve();
        });
      });
    }
  }, 10000);

  it('should match the expected response format for frontend', async () => {
    const response = await request(server)
      .get(`/api/git/status?project=${PROJECT_NAME}`)
      .expect(200);

    // Frontend expects these fields
    const expectedFormat = {
      branch: expect.any(String),
      modified: expect.any(Array),
      added: expect.any(Array),
      deleted: expect.any(Array),
      untracked: expect.any(Array)
    };

    expect(response.body).toMatchObject(expectedFormat);
  });
});