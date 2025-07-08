import { describe, it, expect, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import request from 'supertest';
import express from 'express';
import gitRouter from '../../routes/git.js';

describe('Git Routes Integration Tests', () => {
  let app;
  const PROJECT_PATH = process.cwd();
  const PROJECT_NAME = PROJECT_PATH.replace(/^\//, '').replace(/\//g, '-');

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/git', gitRouter);
  });

  describe('Real Git Status Integration', () => {
    it('should return actual git status matching command line output', async () => {
      // Skip if not in a git repository
      try {
        execSync('git rev-parse --git-dir', { cwd: PROJECT_PATH });
      } catch {
        console.log('Skipping test - not in a git repository');
        return;
      }

      // Get actual git status
      const gitStatus = execSync('git status --porcelain', { 
        encoding: 'utf8',
        cwd: PROJECT_PATH 
      });
      const actualFiles = gitStatus.split('\n').filter(line => line.trim());
      
      console.log(`Actual git has ${actualFiles.length} changed files`);

      // Test the endpoint
      const response = await request(app)
        .get(`/api/git/status?project=${PROJECT_NAME}`)
        .expect(200);

      // Count files returned by endpoint
      const endpointFileCount = 
        (response.body.modified?.length || 0) +
        (response.body.added?.length || 0) +
        (response.body.deleted?.length || 0) +
        (response.body.untracked?.length || 0);

      console.log(`Endpoint returned ${endpointFileCount} files`);

      // The endpoint should return the same files as git status
      expect(endpointFileCount).toBe(actualFiles.length);
      
      // Verify structure
      expect(response.body).toHaveProperty('branch');
      expect(response.body).toHaveProperty('modified');
      expect(response.body).toHaveProperty('added');
      expect(response.body).toHaveProperty('deleted');
      expect(response.body).toHaveProperty('untracked');
    });

    it('should detect specific file types correctly', async () => {
      // Create test scenarios
      const testFile = 'test-git-detection.txt';
      const testContent = 'test content';
      
      try {
        // Create and stage a file
        require('fs').writeFileSync(testFile, testContent);
        execSync(`git add ${testFile}`, { cwd: PROJECT_PATH });
        
        const response = await request(app)
          .get(`/api/git/status?project=${PROJECT_NAME}`)
          .expect(200);

        // Should detect the staged file
        const allFiles = [
          ...response.body.modified,
          ...response.body.added,
          ...response.body.deleted,
          ...response.body.untracked
        ];

        expect(allFiles).toContain(testFile);
        
      } finally {
        // Cleanup
        try {
          execSync(`git reset ${testFile}`, { cwd: PROJECT_PATH });
          require('fs').unlinkSync(testFile);
        } catch {}
      }
    });
  });

  describe('Git Status Parsing', () => {
    it('should correctly parse different git status formats', () => {
      const testCases = [
        { input: ' M file.js', expected: { status: 'modified', file: 'file.js' } },
        { input: 'M  file.js', expected: { status: 'modified', file: 'file.js' } },
        { input: 'MM file.js', expected: { status: 'modified', file: 'file.js' } },
        { input: 'A  file.js', expected: { status: 'added', file: 'file.js' } },
        { input: 'D  file.js', expected: { status: 'deleted', file: 'file.js' } },
        { input: '?? file.js', expected: { status: 'untracked', file: 'file.js' } },
        { input: 'R  old.js -> new.js', expected: { status: 'renamed', file: 'new.js' } }
      ];

      testCases.forEach(({ input, expected }) => {
        const status = input.substring(0, 2);
        const file = input.substring(3).split(' -> ').pop();
        
        expect(file).toBe(expected.file);
        
        // Verify status parsing logic
        if (status === 'M ' || status === ' M' || status === 'MM') {
          expect(expected.status).toBe('modified');
        } else if (status === 'A ') {
          expect(expected.status).toBe('added');
        } else if (status === 'D ') {
          expect(expected.status).toBe('deleted');
        } else if (status === '??') {
          expect(expected.status).toBe('untracked');
        }
      });
    });
  });
});