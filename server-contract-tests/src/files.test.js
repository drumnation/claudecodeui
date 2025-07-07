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

describe('File Operations API Contract Tests', () => {
  let testProjectPath;
  let testProjectName;

  beforeAll(async () => {
    await initTestEnvironment();
    
    // Create a test project with files
    testProjectName = 'files-test-project';
    testProjectPath = await createTestProject(testProjectName, {
      language: 'javascript'
    });
    
    // Create test files and directories
    await fs.writeFile(path.join(testProjectPath, 'test.txt'), 'Hello World\n');
    await fs.writeFile(path.join(testProjectPath, 'script.js'), 'console.log("test");\n');
    await fs.mkdir(path.join(testProjectPath, 'src'), { recursive: true });
    await fs.writeFile(path.join(testProjectPath, 'src', 'index.js'), 'export default {};\n');
    await fs.mkdir(path.join(testProjectPath, 'src', 'components'), { recursive: true });
    await fs.writeFile(path.join(testProjectPath, 'src', 'components', 'Button.js'), 'export const Button = () => {};\n');
    
    // Create a binary file (simple PNG)
    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    await fs.writeFile(path.join(testProjectPath, 'image.png'), pngHeader);
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  describe('GET /api/files/read', () => {
    it('should read text file content', async () => {
      const filePath = path.join(testProjectPath, 'test.txt');
      
      const response = await api.get('/api/files/read', {
        params: { path: filePath }
      });
      
      const expectedStructure = {
        content: 'Hello World\n',
        path: filePath
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('files-read-text', 'GET /api/files/read', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.content).toBe('Hello World\n');
      expect(response.data.path).toBe(filePath);
    });

    it('should read JavaScript file', async () => {
      const filePath = path.join(testProjectPath, 'script.js');
      
      const response = await api.get('/api/files/read', {
        params: { path: filePath }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.content).toBe('console.log("test");\n');
    });

    it('should return 404 for non-existent file', async () => {
      const response = await api.get('/api/files/read', {
        params: { path: '/non/existent/file.txt' }
      });
      
      expect(response.status).toBe(404);
      expect(response.data.error).toContain('not found');
    });

    it('should return 400 when path is missing', async () => {
      const response = await api.get('/api/files/read');
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Path is required');
    });
  });

  describe('POST /api/files/save', () => {
    const testSaveFile = path.join(testProjectPath, 'save-test.txt');

    beforeEach(async () => {
      // Clean up test file
      try {
        await fs.unlink(testSaveFile);
        await fs.unlink(testSaveFile + '.backup');
      } catch (e) {
        // Ignore if doesn't exist
      }
    });

    it('should save new file', async () => {
      const response = await api.post('/api/files/save', {
        path: testSaveFile,
        content: 'New file content'
      });
      
      const expected = { success: true };
      const differences = compareResponses(expected, response.data);
      
      await recordTestResult('files-save-new', 'POST /api/files/save', expected, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ success: true });
      
      // Verify file was created
      const content = await fs.readFile(testSaveFile, 'utf8');
      expect(content).toBe('New file content');
    });

    it('should create backup when overwriting existing file', async () => {
      // Create original file
      await fs.writeFile(testSaveFile, 'Original content');
      
      const response = await api.post('/api/files/save', {
        path: testSaveFile,
        content: 'Updated content'
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ success: true });
      
      // Verify backup was created
      const backupContent = await fs.readFile(testSaveFile + '.backup', 'utf8');
      expect(backupContent).toBe('Original content');
      
      // Verify file was updated
      const content = await fs.readFile(testSaveFile, 'utf8');
      expect(content).toBe('Updated content');
    });

    it('should return 400 when path is missing', async () => {
      const response = await api.post('/api/files/save', {
        content: 'Some content'
      });
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Path and content are required');
    });

    it('should return 400 when content is missing', async () => {
      const response = await api.post('/api/files/save', {
        path: testSaveFile
      });
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Path and content are required');
    });
  });

  describe('GET /api/files/tree', () => {
    it('should return directory tree with default depth', async () => {
      const response = await api.get('/api/files/tree', {
        params: { path: testProjectPath }
      });
      
      const expectedStructure = {
        name: expect.any(String),
        path: testProjectPath,
        type: 'directory',
        children: expect.arrayContaining([
          expect.objectContaining({
            name: 'test.txt',
            type: 'file',
            size: expect.any(Number)
          }),
          expect.objectContaining({
            name: 'src',
            type: 'directory',
            children: expect.any(Array)
          })
        ])
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('files-tree-default', 'GET /api/files/tree', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.type).toBe('directory');
      expect(response.data.children).toBeDefined();
    });

    it('should respect maxDepth parameter', async () => {
      const response = await api.get('/api/files/tree', {
        params: { 
          path: testProjectPath,
          maxDepth: 1
        }
      });
      
      expect(response.status).toBe(200);
      
      // Find src directory
      const srcDir = response.data.children.find(child => child.name === 'src');
      expect(srcDir).toBeDefined();
      expect(srcDir.type).toBe('directory');
      
      // With maxDepth=1, src should not have expanded children
      expect(srcDir.children).toBeUndefined();
    });

    it('should return single file info when path is a file', async () => {
      const filePath = path.join(testProjectPath, 'test.txt');
      
      const response = await api.get('/api/files/tree', {
        params: { path: filePath }
      });
      
      const expectedStructure = {
        name: 'test.txt',
        path: filePath,
        type: 'file',
        size: expect.any(Number)
      };

      const differences = compareResponses(expectedStructure, response.data);
      
      await recordTestResult('files-tree-file', 'GET /api/files/tree', expectedStructure, response.data, differences);
      
      expect(response.status).toBe(200);
      expect(response.data.type).toBe('file');
      expect(response.data.children).toBeUndefined();
    });

    it('should return 404 for non-existent path', async () => {
      const response = await api.get('/api/files/tree', {
        params: { path: '/non/existent/path' }
      });
      
      expect(response.status).toBe(404);
      expect(response.data.error).toContain('not found');
    });

    it('should return 400 when path is missing', async () => {
      const response = await api.get('/api/files/tree');
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Path is required');
    });
  });

  describe('GET /api/files/binary', () => {
    it('should stream binary file with correct headers', async () => {
      const imagePath = path.join(testProjectPath, 'image.png');
      
      const response = await api.get('/api/files/binary', {
        params: { path: imagePath },
        responseType: 'arraybuffer'
      });
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/png');
      expect(response.headers['content-disposition']).toContain('image.png');
      
      // Verify PNG header
      const buffer = Buffer.from(response.data);
      expect(buffer[0]).toBe(0x89);
      expect(buffer[1]).toBe(0x50);
      expect(buffer[2]).toBe(0x4E);
      expect(buffer[3]).toBe(0x47);
    });

    it('should stream text file as octet-stream', async () => {
      const textPath = path.join(testProjectPath, 'test.txt');
      
      const response = await api.get('/api/files/binary', {
        params: { path: textPath },
        responseType: 'arraybuffer'
      });
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/octet-stream');
      
      const content = Buffer.from(response.data).toString('utf8');
      expect(content).toBe('Hello World\n');
    });

    it('should return 404 for non-existent file', async () => {
      const response = await api.get('/api/files/binary', {
        params: { path: '/non/existent/file.bin' }
      });
      
      expect(response.status).toBe(404);
      expect(response.data.error).toContain('not found');
    });

    it('should return 400 when path is missing', async () => {
      const response = await api.get('/api/files/binary');
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Path is required');
    });
  });
});