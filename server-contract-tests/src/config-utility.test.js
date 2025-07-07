import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
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

describe('Config and Utility API Contract Tests', () => {
  let testProjectPath;
  let testProjectName;

  beforeAll(async () => {
    await initTestEnvironment();
    
    // Create test project for session summary tests
    testProjectName = 'utility-test-project';
    testProjectPath = await createTestProject(testProjectName, {
      language: 'javascript'
    });
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  describe('Configuration Endpoints', () => {
    const configPath = path.join(os.homedir(), '.claude', 'config.json');
    let originalConfig;

    beforeEach(async () => {
      // Backup original config if it exists
      try {
        originalConfig = await fs.readFile(configPath, 'utf8');
      } catch (e) {
        originalConfig = null;
      }
    });

    afterEach(async () => {
      // Restore original config
      if (originalConfig) {
        await fs.writeFile(configPath, originalConfig);
      } else {
        try {
          await fs.unlink(configPath);
        } catch (e) {
          // Ignore if doesn't exist
        }
      }
    });

    describe('GET /api/config', () => {
      it('should return empty object when no config exists', async () => {
        // Remove config file
        try {
          await fs.unlink(configPath);
        } catch (e) {
          // Ignore
        }

        const response = await api.get('/api/config');
        
        const expected = {};
        const differences = compareResponses(expected, response.data);
        
        await recordTestResult('config-get-empty', 'GET /api/config', expected, response.data, differences);
        
        expect(response.status).toBe(200);
        expect(response.data).toEqual({});
      });

      it('should return config when it exists', async () => {
        // Create test config
        const testConfig = {
          theme: 'dark',
          autoSave: true,
          tabSize: 4
        };
        
        await fs.mkdir(path.dirname(configPath), { recursive: true });
        await fs.writeFile(configPath, JSON.stringify(testConfig, null, 2));

        const response = await api.get('/api/config');
        
        const differences = compareResponses(testConfig, response.data);
        
        await recordTestResult('config-get-existing', 'GET /api/config', testConfig, response.data, differences);
        
        expect(response.status).toBe(200);
        expect(response.data).toEqual(testConfig);
      });
    });

    describe('POST /api/config', () => {
      it('should save configuration', async () => {
        const newConfig = {
          theme: 'light',
          fontSize: 14,
          experimental: {
            feature1: true
          }
        };

        const response = await api.post('/api/config', newConfig);
        
        const expected = { success: true };
        const differences = compareResponses(expected, response.data);
        
        await recordTestResult('config-save', 'POST /api/config', expected, response.data, differences);
        
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ success: true });
        
        // Verify config was saved
        const savedConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
        expect(savedConfig).toEqual(newConfig);
      });

      it('should handle empty config', async () => {
        const response = await api.post('/api/config', {});
        
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ success: true });
      });
    });

    describe('GET /api/slash-commands', () => {
      it('should return empty array when no commands exist', async () => {
        const response = await api.get('/api/slash-commands');
        
        const expectedStructure = {
          commands: expect.any(Array)
        };

        const differences = compareResponses(expectedStructure, response.data);
        
        await recordTestResult('slash-commands-empty', 'GET /api/slash-commands', expectedStructure, response.data, differences);
        
        expect(response.status).toBe(200);
        expect(response.data.commands).toEqual([]);
      });

      // Note: Testing with actual slash commands would require setting up
      // the slash commands configuration, which might be environment-specific
    });
  });

  describe('Server Manager Endpoints', () => {
    describe('POST /api/servers/start', () => {
      it('should validate required parameters', async () => {
        const response = await api.post('/api/servers/start', {
          name: 'test-server'
          // Missing command
        });
        
        expect(response.status).toBe(400);
        expect(response.data.error).toContain('required');
      });

      it('should start server with valid parameters', async () => {
        const response = await api.post('/api/servers/start', {
          name: 'echo-server',
          command: 'echo',
          args: ['Server started'],
          cwd: testProjectPath
        });
        
        const expectedStructure = {
          success: expect.any(Boolean),
          message: expect.any(String)
        };

        const differences = compareResponses(expectedStructure, response.data);
        
        await recordTestResult('servers-start', 'POST /api/servers/start', expectedStructure, response.data, differences);
        
        // Response might vary based on implementation
        expect(response.status).toBeOneOf([200, 500]);
        expect(response.data).toHaveProperty('success');
        expect(response.data).toHaveProperty('message');
      });
    });

    describe('POST /api/servers/stop', () => {
      it('should handle stopping non-existent server', async () => {
        const response = await api.post('/api/servers/stop', {
          name: 'non-existent-server'
        });
        
        const expectedStructure = {
          success: expect.any(Boolean)
        };

        const differences = compareResponses(expectedStructure, response.data);
        
        await recordTestResult('servers-stop-nonexistent', 'POST /api/servers/stop', expectedStructure, response.data, differences);
        
        expect([200, 404]).toContain(response.status);
      });

      it('should validate name parameter', async () => {
        const response = await api.post('/api/servers/stop', {});
        
        expect(response.status).toBe(400);
        expect(response.data.error).toContain('required');
      });
    });

    describe('GET /api/servers/status', () => {
      it('should return server status object', async () => {
        const response = await api.get('/api/servers/status');
        
        const expectedStructure = expect.any(Object);

        await recordTestResult('servers-status', 'GET /api/servers/status', expectedStructure, response.data, []);
        
        expect(response.status).toBe(200);
        expect(typeof response.data).toBe('object');
      });
    });

    describe('GET /api/servers/scripts', () => {
      it('should return scripts for project with package.json', async () => {
        const response = await api.get('/api/servers/scripts', {
          params: { cwd: testProjectPath }
        });
        
        const expectedStructure = expect.any(Array);

        await recordTestResult('servers-scripts', 'GET /api/servers/scripts', expectedStructure, response.data, []);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
      });

      it('should return empty array for directory without package.json', async () => {
        const tempDir = path.join(TEST_DATA_DIR, 'no-package');
        await fs.mkdir(tempDir, { recursive: true });
        
        const response = await api.get('/api/servers/scripts', {
          params: { cwd: tempDir }
        });
        
        expect(response.status).toBe(200);
        expect(response.data).toEqual([]);
      });
    });
  });

  describe('Session Summary Endpoints', () => {
    let sessionId;

    beforeEach(async () => {
      // Create a test session
      sessionId = `session-${Date.now()}`;
      await createTestSession(testProjectName, sessionId, [
        { role: 'user', content: 'Test message for summary' },
        { role: 'assistant', content: 'Response to test' }
      ]);
    });

    describe('POST /api/generate-session-summary', () => {
      it('should handle summary generation request', async () => {
        const response = await api.post('/api/generate-session-summary', {
          projectPath: testProjectPath,
          sessionId: sessionId
        });
        
        // This endpoint might fail if Claude CLI is not available
        if (response.status === 200) {
          const expectedStructure = {
            summary: expect.any(String)
          };

          const differences = compareResponses(expectedStructure, response.data);
          
          await recordTestResult('generate-summary', 'POST /api/generate-session-summary', expectedStructure, response.data, differences);
          
          expect(response.data).toHaveProperty('summary');
          expect(typeof response.data.summary).toBe('string');
        } else {
          // Claude CLI not available is acceptable
          expect(response.status).toBeOneOf([500, 503]);
          expect(response.data.error).toBeTruthy();
        }
      });

      it('should validate required parameters', async () => {
        const response = await api.post('/api/generate-session-summary', {
          projectPath: testProjectPath
          // Missing sessionId
        });
        
        expect(response.status).toBe(400);
        expect(response.data.error).toContain('required');
      });
    });

    describe('POST /api/manual-session-summary', () => {
      it('should save manual summary', async () => {
        const response = await api.post('/api/manual-session-summary', {
          projectPath: testProjectPath,
          sessionId: sessionId,
          summary: 'Manual test summary'
        });
        
        const expected = { success: true };
        const differences = compareResponses(expected, response.data);
        
        await recordTestResult('manual-summary', 'POST /api/manual-session-summary', expected, response.data, differences);
        
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ success: true });
      });

      it('should validate required parameters', async () => {
        const response = await api.post('/api/manual-session-summary', {
          projectPath: testProjectPath,
          sessionId: sessionId
          // Missing summary
        });
        
        expect(response.status).toBe(400);
        expect(response.data.error).toContain('required');
      });
    });

    describe('POST /api/update-session-summary', () => {
      it('should update existing summary', async () => {
        const response = await api.post('/api/update-session-summary', {
          projectPath: testProjectPath,
          sessionId: sessionId,
          summary: 'Updated test summary'
        });
        
        const expected = { success: true };
        const differences = compareResponses(expected, response.data);
        
        await recordTestResult('update-summary', 'POST /api/update-session-summary', expected, response.data, differences);
        
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ success: true });
      });
    });
  });

  describe('Audio Transcription Endpoint', () => {
    describe('POST /api/audio/transcribe', () => {
      it('should validate audio parameter', async () => {
        const response = await api.post('/api/audio/transcribe', {});
        
        expect(response.status).toBe(400);
        expect(response.data.error).toContain('required');
      });

      it('should handle transcription request', async () => {
        // Create a minimal valid base64 audio (silence)
        const silentWav = Buffer.from([
          0x52, 0x49, 0x46, 0x46, // "RIFF"
          0x24, 0x00, 0x00, 0x00, // File size
          0x57, 0x41, 0x56, 0x45, // "WAVE"
          0x66, 0x6D, 0x74, 0x20, // "fmt "
          0x10, 0x00, 0x00, 0x00, // Subchunk size
          0x01, 0x00, 0x01, 0x00, // Audio format, channels
          0x44, 0xAC, 0x00, 0x00, // Sample rate (44100)
          0x88, 0x58, 0x01, 0x00, // Byte rate
          0x02, 0x00, 0x10, 0x00, // Block align, bits per sample
          0x64, 0x61, 0x74, 0x61, // "data"
          0x00, 0x00, 0x00, 0x00  // Data size
        ]);
        
        const response = await api.post('/api/audio/transcribe', {
          audio: silentWav.toString('base64')
        });
        
        // This will likely fail without OPENAI_API_KEY
        if (response.status === 200) {
          const expectedStructure = {
            text: expect.any(String)
          };

          const differences = compareResponses(expectedStructure, response.data);
          
          await recordTestResult('audio-transcribe', 'POST /api/audio/transcribe', expectedStructure, response.data, differences);
          
          expect(response.data).toHaveProperty('text');
        } else {
          // No API key is acceptable
          expect(response.status).toBeOneOf([401, 500]);
          expect(response.data.error).toBeTruthy();
        }
      });
    });
  });
});

// Add custom matcher
expect.extend({
  toBeOneOf(received, array) {
    const pass = array.includes(received);
    return {
      pass,
      message: () => `expected ${received} to be one of ${array.join(', ')}`
    };
  }
});