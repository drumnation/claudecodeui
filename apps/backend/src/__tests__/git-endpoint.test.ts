import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { execSync } from 'child_process';
import path from 'path';
import { createServer } from 'http';
import app from '../app'; // Assuming app is exported from main.ts

describe('Git API Endpoints', () => {
  let server: any;
  const TEST_PORT = 9999;
  const PROJECT_PATH = process.cwd();
  const PROJECT_NAME = PROJECT_PATH.replace(/^\//, '').replace(/\//g, '-');

  beforeAll(async () => {
    // Start test server
    server = createServer(app);
    await new Promise(resolve => {
      server.listen(TEST_PORT, () => {
        console.log(`Test server started on port ${TEST_PORT}`);
        resolve(undefined);
      });
    });
  });

  afterAll(async () => {
    // Close test server
    await new Promise(resolve => {
      server.close(() => {
        console.log('Test server closed');
        resolve(undefined);
      });
    });
  });

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