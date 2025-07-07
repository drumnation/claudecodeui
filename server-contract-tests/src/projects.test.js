import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  api, 
  initTestEnvironment, 
  cleanupTestEnvironment,
  createTestProject,
  createTestSession,
  compareResponses,
  recordTestResult,
  TEST_DATA_DIR
} from './test-utils.js';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

describe('Projects API Contract Tests', () => {
  beforeAll(async () => {
    await initTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  describe('GET /api/projects', () => {
    it('should return empty object when no projects exist', async () => {
      const response = await api.get('/api/projects');
      
      const expected = {};
      const differences = compareResponses(expected, response.data);
      
      await recordTestResult('projects-empty', 'GET /api/projects', expected, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(differences.filter(d => d.severity !== 'warning')).toHaveLength(0);
    });

    it('should return projects with correct structure', async () => {
      // Create test projects
      const project1Path = await createTestProject('test-project-1', {
        language: 'javascript',
        displayName: 'Test Project One'
      });
      
      const project2Path = await createTestProject('test-project-2', {
        language: 'python',
        displayName: 'Test Project Two'
      });

      // Create project in Claude directory
      const claudeProjectsDir = path.join(os.homedir(), '.claude', 'projects');
      const claudeProjectsFile = path.join(os.homedir(), '.claude', 'projects.json');
      
      await fs.writeFile(claudeProjectsFile, JSON.stringify({
        [project1Path]: {
          name: 'test-project-1',
          path: project1Path,
          displayName: 'Test Project One'
        },
        [project2Path]: {
          name: 'test-project-2', 
          path: project2Path,
          displayName: 'Test Project Two'
        }
      }, null, 2));

      // Create sessions for project 1
      await createTestSession('test-project-1', 'session1', [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
      ]);

      const response = await api.get('/api/projects');
      
      // Define expected structure (not exact values)
      const expectedStructure = {
        [project1Path]: {
          name: 'test-project-1',
          path: project1Path,
          displayName: 'Test Project One',
          language: 'javascript',
          sessions: [{
            id: 'session1',
            summary: expect.any(String),
            messageCount: 2,
            created: expect.any(String),
            lastActivity: expect.any(String)
          }]
        },
        [project2Path]: {
          name: 'test-project-2',
          path: project2Path,
          displayName: 'Test Project Two',
          language: 'python',
          sessions: []
        }
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('projects-list', 'GET /api/projects', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(Object.keys(response.data)).toHaveLength(2);
      expect(response.data[project1Path]).toBeDefined();
      expect(response.data[project2Path]).toBeDefined();
    });
  });

  describe('POST /api/projects/create', () => {
    it('should create a new project', async () => {
      const projectPath = path.join(TEST_DATA_DIR, 'new-project');
      
      const response = await api.post('/api/projects/create', {
        path: projectPath,
        name: 'Custom Project Name'
      });
      
      const expected = { success: true };
      const differences = compareResponses(expected, response.data);
      
      await recordTestResult('projects-create', 'POST /api/projects/create', expected, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ success: true });
      
      // Verify project was created
      const projectsResponse = await api.get('/api/projects');
      expect(projectsResponse.data[projectPath]).toBeDefined();
    });

    it('should return 400 when path is missing', async () => {
      const response = await api.post('/api/projects/create', {});
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Project path is required');
    });
  });

  describe('GET /api/projects/:project/sessions', () => {
    it('should return sessions with pagination', async () => {
      const projectName = 'paginated-project';
      const projectPath = await createTestProject(projectName);
      
      // Create multiple sessions
      for (let i = 1; i <= 5; i++) {
        await createTestSession(projectName, `session${i}`, [
          { role: 'user', content: `Message ${i}` }
        ]);
      }

      const response = await api.get(`/api/projects/${projectName}/sessions?offset=0&limit=3`);
      
      const expectedStructure = {
        sessions: expect.any(Array),
        hasMore: true,
        nextOffset: 3
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('projects-sessions-paginated', 'GET /api/projects/:project/sessions', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.sessions).toHaveLength(3);
      expect(response.data.hasMore).toBe(true);
      expect(response.data.nextOffset).toBe(3);
    });

    it('should use default pagination values', async () => {
      const response = await api.get('/api/projects/test-project/sessions');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('sessions');
      expect(response.data).toHaveProperty('hasMore');
    });
  });

  describe('PUT /api/projects/:project/sessions/:sessionId/summary', () => {
    it('should update session summary', async () => {
      const projectName = 'summary-project';
      const sessionId = 'summary-session';
      await createTestProject(projectName);
      await createTestSession(projectName, sessionId);

      const response = await api.put(`/api/projects/${projectName}/sessions/${sessionId}/summary`, {
        summary: 'Updated summary text'
      });
      
      const expected = { success: true };
      const differences = compareResponses(expected, response.data);
      
      await recordTestResult('projects-update-summary', 'PUT /api/projects/:project/sessions/:sessionId/summary', expected, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ success: true });
    });

    it('should return 400 when summary is missing', async () => {
      const response = await api.put('/api/projects/test/sessions/test/summary', {});
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Summary is required');
    });
  });

  describe('DELETE /api/projects/:project/sessions/:sessionId/delete', () => {
    it('should delete a session', async () => {
      const projectName = 'delete-session-project';
      const sessionId = 'delete-me';
      await createTestProject(projectName);
      await createTestSession(projectName, sessionId);

      const response = await api.delete(`/api/projects/${projectName}/sessions/${sessionId}/delete`);
      
      const expected = { success: true };
      const differences = compareResponses(expected, response.data);
      
      await recordTestResult('projects-delete-session', 'DELETE /api/projects/:project/sessions/:sessionId/delete', expected, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ success: true });
    });
  });

  describe('GET /api/projects/:project/sessions/:sessionId/messages', () => {
    it('should return session messages', async () => {
      const projectName = 'messages-project';
      const sessionId = 'messages-session';
      const messages = [
        { role: 'user', content: 'Test question' },
        { role: 'assistant', content: 'Test response' }
      ];
      
      await createTestProject(projectName);
      await createTestSession(projectName, sessionId, messages);

      const response = await api.get(`/api/projects/${projectName}/sessions/${sessionId}/messages`);
      
      const differences = compareResponses(messages, response.data);
      
      await recordTestResult('projects-get-messages', 'GET /api/projects/:project/sessions/:sessionId/messages', messages, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual(messages);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await api.get('/api/projects/test/sessions/nonexistent/messages');
      
      expect(response.status).toBe(404);
      expect(response.data.error).toBe('Session not found');
    });
  });

  describe('POST /api/projects/:project/rename', () => {
    it('should rename a project', async () => {
      const oldPath = await createTestProject('rename-me');
      const newPath = path.join(TEST_DATA_DIR, 'renamed-project');
      
      // Add to projects.json
      const projectsFile = path.join(os.homedir(), '.claude', 'projects.json');
      await fs.writeFile(projectsFile, JSON.stringify({
        [oldPath]: { name: 'rename-me', path: oldPath }
      }));

      const response = await api.post(`/api/projects/${encodeURIComponent(oldPath)}/rename`, {
        newPath: newPath
      });
      
      const expected = { success: true };
      const differences = compareResponses(expected, response.data);
      
      await recordTestResult('projects-rename', 'POST /api/projects/:project/rename', expected, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ success: true });
    });

    it('should return 400 when newPath is missing', async () => {
      const response = await api.post('/api/projects/test/rename', {});
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('New path is required');
    });
  });

  describe('POST /api/projects/:project/delete', () => {
    it('should delete a project', async () => {
      const projectPath = await createTestProject('delete-me');
      
      // Add to projects.json
      const projectsFile = path.join(os.homedir(), '.claude', 'projects.json');
      await fs.writeFile(projectsFile, JSON.stringify({
        [projectPath]: { name: 'delete-me', path: projectPath }
      }));

      const response = await api.post(`/api/projects/${encodeURIComponent(projectPath)}/delete`);
      
      const expected = { success: true };
      const differences = compareResponses(expected, response.data);
      
      await recordTestResult('projects-delete', 'POST /api/projects/:project/delete', expected, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ success: true });
      
      // Verify project was removed
      const projectsResponse = await api.get('/api/projects');
      expect(projectsResponse.data[projectPath]).toBeUndefined();
    });
  });
});