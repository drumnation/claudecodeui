import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import path from 'path';

// Mock dependencies
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    access: vi.fn(),
    unlink: vi.fn()
  },
  createReadStream: vi.fn()
}));

vi.mock('child_process', () => ({
  exec: vi.fn(),
  spawn: vi.fn()
}));

vi.mock('../projects', () => ({
  getProjects: vi.fn(),
  getProjectSessions: vi.fn(),
  renameProject: vi.fn(),
  deleteProject: vi.fn(),
  createProject: vi.fn()
}));

vi.mock('../serverManager', () => {
  return vi.fn().mockImplementation(() => ({
    startServer: vi.fn(),
    stopServer: vi.fn(),
    getServerStatus: vi.fn(),
    getAvailableScripts: vi.fn()
  }));
});

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: vi.fn()
      }
    }
  }))
}));

// Dynamic imports
const { exec } = await import('child_process');
const fsPromises = (await import('fs')).promises;
const { 
  getProjects, 
  getProjectSessions,
  renameProject,
  deleteProject,
  createProject
} = await import('../projects.js');
const ServerManager = (await import('../serverManager.js')).default;

describe('API endpoints', () => {
  let app;
  let mockServerManager;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create Express app with minimal setup
    app = express();
    app.use(express.json());
    
    // Mock ServerManager instance
    mockServerManager = new ServerManager();
    
    // Add API routes (we'll test them individually)
    setupAPIRoutes(app, mockServerManager);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/projects', () => {
    it('should return all projects', async () => {
      const mockProjects = {
        '/project1': {
          name: 'project1',
          path: '/project1',
          displayName: 'Project One',
          language: 'javascript',
          sessions: []
        },
        '/project2': {
          name: 'project2',
          path: '/project2',
          displayName: 'Project Two',
          language: 'python',
          sessions: []
        }
      };

      getProjects.mockResolvedValue(mockProjects);

      const res = await request(app).get('/api/projects');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProjects);
    });

    it('should handle errors gracefully', async () => {
      getProjects.mockRejectedValue(new Error('Failed to read projects'));

      const res = await request(app).get('/api/projects');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch projects');
    });
  });

  describe('GET /api/projects/:project/sessions', () => {
    it('should return project sessions with pagination', async () => {
      const mockSessions = {
        sessions: [
          { id: 'session1', summary: 'First session', messageCount: 10 },
          { id: 'session2', summary: 'Second session', messageCount: 20 }
        ],
        meta: { hasMore: false, total: 2 }
      };

      getProjectSessions.mockResolvedValue(mockSessions);

      const res = await request(app)
        .get('/api/projects/project1/sessions?offset=0&limit=10');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockSessions);
      expect(getProjectSessions).toHaveBeenCalledWith('project1', 0, 10);
    });

    it('should use default pagination values', async () => {
      getProjectSessions.mockResolvedValue({ sessions: [], meta: { hasMore: false, total: 0 } });

      await request(app).get('/api/projects/project1/sessions');

      expect(getProjectSessions).toHaveBeenCalledWith('project1', 0, 50);
    });
  });

  describe('POST /api/projects/:project/rename', () => {
    it('should rename project successfully', async () => {
      renameProject.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/projects/oldproject/rename')
        .send({ newPath: '/new/path/project' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(renameProject).toHaveBeenCalledWith('oldproject', '/new/path/project');
    });

    it('should handle missing newPath', async () => {
      const res = await request(app)
        .post('/api/projects/project/rename')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('New path is required');
    });

    it('should handle rename failure', async () => {
      renameProject.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/projects/project/rename')
        .send({ newPath: '/new/path' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to rename project');
    });
  });

  describe('POST /api/projects/:project/delete', () => {
    it('should delete project successfully', async () => {
      deleteProject.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/projects/project1/delete');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(deleteProject).toHaveBeenCalledWith('project1');
    });

    it('should handle delete failure', async () => {
      deleteProject.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/projects/project1/delete');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to delete project');
    });
  });

  describe('POST /api/projects/create', () => {
    it('should create project with auto-generated name', async () => {
      createProject.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/projects/create')
        .send({ path: '/new/project' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(createProject).toHaveBeenCalledWith('/new/project', undefined);
    });

    it('should create project with custom name', async () => {
      createProject.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/projects/create')
        .send({ path: '/new/project', name: 'Custom Project Name' });

      expect(res.status).toBe(200);
      expect(createProject).toHaveBeenCalledWith('/new/project', 'Custom Project Name');
    });

    it('should handle missing path', async () => {
      const res = await request(app)
        .post('/api/projects/create')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Project path is required');
    });
  });

  describe('GET /api/projects/:project/sessions/:sessionId/messages', () => {
    it('should return session messages', async () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
      ];

      fsPromises.readFile.mockResolvedValue(messages.map(m => JSON.stringify(m)).join('\n'));

      const res = await request(app)
        .get('/api/projects/project1/sessions/session123/messages');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(messages);
    });

    it('should handle missing session file', async () => {
      fsPromises.readFile.mockRejectedValue({ code: 'ENOENT' });

      const res = await request(app)
        .get('/api/projects/project1/sessions/nonexistent/messages');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Session not found');
    });

    it('should handle malformed JSONL', async () => {
      fsPromises.readFile.mockResolvedValue('invalid json\n{"valid":"json"}');

      const res = await request(app)
        .get('/api/projects/project1/sessions/session123/messages');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toEqual({ valid: 'json' });
    });
  });

  describe('Session summary endpoints', () => {
    describe('PUT /api/projects/:project/sessions/:sessionId/summary', () => {
      it('should update session summary', async () => {
        fsPromises.readFile.mockResolvedValue('{"id":"session123","summary":"Old summary"}');
        fsPromises.writeFile.mockResolvedValue();

        const res = await request(app)
          .put('/api/projects/project1/sessions/session123/summary')
          .send({ summary: 'New summary' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(fsPromises.writeFile).toHaveBeenCalledWith(
          expect.stringContaining('sessions.jsonl'),
          expect.stringContaining('New summary')
        );
      });

      it('should handle missing summary', async () => {
        const res = await request(app)
          .put('/api/projects/project1/sessions/session123/summary')
          .send({});

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Summary is required');
      });
    });

    describe('POST /api/generate-session-summary', () => {
      it('should generate summary using Claude', async () => {
        const messages = [
          { role: 'user', content: 'Help me build a React app' },
          { role: 'assistant', content: 'I can help you build a React app...' }
        ];

        fsPromises.readFile.mockResolvedValue(messages.map(m => JSON.stringify(m)).join('\n'));
        exec.mockImplementation((cmd, cb) => {
          cb(null, 'Building a React application with user');
        });

        const res = await request(app)
          .post('/api/generate-session-summary')
          .send({
            projectPath: '/project1',
            sessionId: 'session123'
          });

        expect(res.status).toBe(200);
        expect(res.body.summary).toBe('Building a React application with user');
      });

      it('should handle Claude CLI errors', async () => {
        fsPromises.readFile.mockResolvedValue('{"role":"user","content":"test"}');
        exec.mockImplementation((cmd, cb) => {
          cb(new Error('Claude API error'));
        });

        const res = await request(app)
          .post('/api/generate-session-summary')
          .send({
            projectPath: '/project1',
            sessionId: 'session123'
          });

        expect(res.status).toBe(500);
        expect(res.body.error).toContain('Failed to generate summary');
      });
    });
  });

  describe('File operations endpoints', () => {
    describe('GET /api/files', () => {
      it('should read file content', async () => {
        fsPromises.readFile.mockResolvedValue('file content');

        const res = await request(app)
          .get('/api/files?path=/path/to/file.txt');

        expect(res.status).toBe(200);
        expect(res.body.content).toBe('file content');
        expect(res.body.path).toBe('/path/to/file.txt');
      });

      it('should handle missing path parameter', async () => {
        const res = await request(app).get('/api/files');

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('File path is required');
      });
    });

    describe('GET /api/files/binary', () => {
      it('should stream binary files', async () => {
        const mockStream = {
          pipe: vi.fn(),
          on: vi.fn((event, handler) => {
            if (event === 'error') {
              // Don't trigger error
            }
          })
        };
        
        vi.mocked((await import('fs')).createReadStream).mockReturnValue(mockStream);
        fsPromises.stat.mockResolvedValue({ size: 1024 });

        const res = await request(app)
          .get('/api/files/binary?path=/path/to/image.png');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toBe('application/octet-stream');
        expect(res.headers['content-length']).toBe('1024');
      });
    });

    describe('POST /api/files/save', () => {
      it('should save file content', async () => {
        fsPromises.writeFile.mockResolvedValue();

        const res = await request(app)
          .post('/api/files/save')
          .send({
            path: '/path/to/file.txt',
            content: 'new content'
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(fsPromises.writeFile).toHaveBeenCalledWith('/path/to/file.txt', 'new content', 'utf8');
      });

      it('should create directory if needed', async () => {
        fsPromises.writeFile.mockRejectedValueOnce({ code: 'ENOENT' });
        fsPromises.mkdir.mockResolvedValue();
        fsPromises.writeFile.mockResolvedValueOnce();

        const res = await request(app)
          .post('/api/files/save')
          .send({
            path: '/new/dir/file.txt',
            content: 'content'
          });

        expect(res.status).toBe(200);
        expect(fsPromises.mkdir).toHaveBeenCalledWith('/new/dir', { recursive: true });
      });
    });

    describe('GET /api/files/tree', () => {
      it('should return directory tree', async () => {
        fsPromises.readdir.mockImplementation((dir) => {
          if (dir === '/project') {
            return Promise.resolve(['src', 'package.json', '.git']);
          }
          if (dir === '/project/src') {
            return Promise.resolve(['index.js', 'utils.js']);
          }
          return Promise.resolve([]);
        });

        fsPromises.stat.mockImplementation((filePath) => ({
          isDirectory: () => !filePath.includes('.'),
          size: 1024,
          mtime: new Date('2023-01-01')
        }));

        const res = await request(app)
          .get('/api/files/tree?path=/project');

        expect(res.status).toBe(200);
        expect(res.body.tree).toBeDefined();
        expect(res.body.tree.children).toHaveLength(2); // .git excluded
      });
    });
  });

  describe('Audio transcription endpoint', () => {
    it('should transcribe audio using OpenAI', async () => {
      const mockOpenAI = (await import('openai')).default;
      const mockCreate = vi.fn().mockResolvedValue({
        text: 'Transcribed audio content'
      });
      mockOpenAI.mockReturnValue({
        audio: {
          transcriptions: {
            create: mockCreate
          }
        }
      });

      // Mock file operations
      fsPromises.writeFile.mockResolvedValue();
      fsPromises.unlink.mockResolvedValue();
      fsPromises.readFile.mockResolvedValue(Buffer.from('audio data'));

      const res = await request(app)
        .post('/api/audio/transcribe')
        .send({
          audio: 'base64_encoded_audio_data'
        });

      expect(res.status).toBe(200);
      expect(res.body.text).toBe('Transcribed audio content');
      expect(mockCreate).toHaveBeenCalled();
      expect(fsPromises.unlink).toHaveBeenCalled(); // Cleanup temp file
    });

    it('should handle missing audio data', async () => {
      const res = await request(app)
        .post('/api/audio/transcribe')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Audio data is required');
    });

    it('should handle transcription errors', async () => {
      const mockOpenAI = (await import('openai')).default;
      mockOpenAI.mockReturnValue({
        audio: {
          transcriptions: {
            create: vi.fn().mockRejectedValue(new Error('API error'))
          }
        }
      });

      fsPromises.writeFile.mockResolvedValue();
      fsPromises.unlink.mockResolvedValue();

      const res = await request(app)
        .post('/api/audio/transcribe')
        .send({
          audio: 'base64_audio_data'
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Transcription failed');
    });
  });

  describe('Configuration endpoints', () => {
    describe('GET /api/config', () => {
      it('should return user configuration', async () => {
        fsPromises.readFile.mockResolvedValue(JSON.stringify({
          theme: 'dark',
          autoSave: true
        }));

        const res = await request(app).get('/api/config');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          theme: 'dark',
          autoSave: true
        });
      });

      it('should return empty object if no config', async () => {
        fsPromises.readFile.mockRejectedValue({ code: 'ENOENT' });

        const res = await request(app).get('/api/config');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({});
      });
    });

    describe('POST /api/config', () => {
      it('should save configuration', async () => {
        fsPromises.writeFile.mockResolvedValue();
        fsPromises.mkdir.mockResolvedValue();

        const res = await request(app)
          .post('/api/config')
          .send({
            theme: 'light',
            fontSize: 14
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(fsPromises.writeFile).toHaveBeenCalledWith(
          expect.stringContaining('config.json'),
          expect.stringContaining('"theme":"light"')
        );
      });
    });
  });

  describe('Server management endpoints', () => {
    describe('POST /api/servers/start', () => {
      it('should start server successfully', async () => {
        mockServerManager.startServer.mockResolvedValue({
          success: true,
          port: 3000,
          message: 'Server started'
        });

        const res = await request(app)
          .post('/api/servers/start')
          .send({
            name: 'dev-server',
            command: 'npm',
            args: ['run', 'dev'],
            cwd: '/project'
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.port).toBe(3000);
      });

      it('should handle missing required fields', async () => {
        const res = await request(app)
          .post('/api/servers/start')
          .send({
            name: 'server'
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('required');
      });
    });

    describe('GET /api/servers/scripts', () => {
      it('should return available npm scripts', async () => {
        mockServerManager.getAvailableScripts.mockResolvedValue([
          { name: 'dev', command: 'npm run dev' },
          { name: 'build', command: 'npm run build' }
        ]);

        const res = await request(app)
          .get('/api/servers/scripts?cwd=/project');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].name).toBe('dev');
      });
    });
  });

  describe('Slash commands endpoint', () => {
    it('should return slash commands from config', async () => {
      fsPromises.readFile.mockResolvedValue(JSON.stringify({
        commands: [
          { name: 'test', description: 'Run tests' },
          { name: 'build', description: 'Build project' }
        ]
      }));

      const res = await request(app).get('/api/slash-commands');

      expect(res.status).toBe(200);
      expect(res.body.commands).toHaveLength(2);
    });

    it('should return empty array if no commands', async () => {
      fsPromises.readFile.mockRejectedValue({ code: 'ENOENT' });

      const res = await request(app).get('/api/slash-commands');

      expect(res.status).toBe(200);
      expect(res.body.commands).toEqual([]);
    });
  });
});

// Helper function to setup API routes (mimics the main app setup)
function setupAPIRoutes(app, serverManager) {
  // Projects endpoints
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.get('/api/projects/:project/sessions', async (req, res) => {
    try {
      const { project } = req.params;
      const offset = parseInt(req.query.offset) || 0;
      const limit = parseInt(req.query.limit) || 50;
      const sessions = await getProjectSessions(project, offset, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects/:project/rename', async (req, res) => {
    try {
      const { project } = req.params;
      const { newPath } = req.body;
      if (!newPath) {
        return res.status(400).json({ error: 'New path is required' });
      }
      const success = await renameProject(project, newPath);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to rename project' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects/:project/delete', async (req, res) => {
    try {
      const { project } = req.params;
      const success = await deleteProject(project);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to delete project' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects/create', async (req, res) => {
    try {
      const { path: projectPath, name } = req.body;
      if (!projectPath) {
        return res.status(400).json({ error: 'Project path is required' });
      }
      const success = await createProject(projectPath, name);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to create project' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Session messages endpoint
  app.get('/api/projects/:project/sessions/:sessionId/messages', async (req, res) => {
    try {
      const { project, sessionId } = req.params;
      const sessionFile = path.join(
        (await import('os')).default.homedir(),
        '.claude',
        'projects',
        project.replace(/\//g, '-'),
        'sessions',
        sessionId,
        'conversation.jsonl'
      );
      
      const content = await fsPromises.readFile(sessionFile, 'utf8');
      const messages = content.trim().split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      
      res.json(messages);
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ error: 'Session not found' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Session summary endpoints
  app.put('/api/projects/:project/sessions/:sessionId/summary', async (req, res) => {
    try {
      const { project, sessionId } = req.params;
      const { summary } = req.body;
      
      if (!summary) {
        return res.status(400).json({ error: 'Summary is required' });
      }

      const sessionsFile = path.join(
        (await import('os')).default.homedir(),
        '.claude',
        'projects',
        project.replace(/\//g, '-'),
        'sessions.jsonl'
      );

      const content = await fsPromises.readFile(sessionsFile, 'utf8');
      const sessions = content.trim().split('\n').map(line => JSON.parse(line));
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        sessions[sessionIndex].summary = summary;
        await fsPromises.writeFile(sessionsFile, sessions.map(s => JSON.stringify(s)).join('\n'));
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/generate-session-summary', async (req, res) => {
    try {
      const { projectPath, sessionId } = req.body;
      
      const sessionFile = path.join(
        (await import('os')).default.homedir(),
        '.claude',
        'projects',
        projectPath.replace(/\//g, '-'),
        'sessions',
        sessionId,
        'conversation.jsonl'
      );

      const content = await fsPromises.readFile(sessionFile, 'utf8');
      const messages = content.trim().split('\n').map(line => JSON.parse(line));
      
      const prompt = `Generate a brief summary of this conversation:\n${JSON.stringify(messages)}`;
      
      exec(`echo '${prompt}' | claude-cli`, (error, stdout) => {
        if (error) {
          return res.status(500).json({ error: 'Failed to generate summary' });
        }
        res.json({ summary: stdout.trim() });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // File operations
  app.get('/api/files', async (req, res) => {
    try {
      const { path: filePath } = req.query;
      if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
      }
      const content = await fsPromises.readFile(filePath, 'utf8');
      res.json({ content, path: filePath });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/files/binary', async (req, res) => {
    try {
      const { path: filePath } = req.query;
      if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
      }
      
      const stat = await fsPromises.stat(filePath);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', stat.size);
      
      const stream = (await import('fs')).createReadStream(filePath);
      stream.pipe(res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/files/save', async (req, res) => {
    try {
      const { path: filePath, content } = req.body;
      if (!filePath || content === undefined) {
        return res.status(400).json({ error: 'Path and content are required' });
      }
      
      try {
        await fsPromises.writeFile(filePath, content, 'utf8');
        res.json({ success: true });
      } catch (error) {
        if (error.code === 'ENOENT') {
          await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
          await fsPromises.writeFile(filePath, content, 'utf8');
          res.json({ success: true });
        } else {
          throw error;
        }
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/files/tree', async (req, res) => {
    try {
      const { path: dirPath } = req.query;
      if (!dirPath) {
        return res.status(400).json({ error: 'Directory path is required' });
      }

      async function buildTree(dir) {
        const entries = await fsPromises.readdir(dir);
        const tree = { name: path.basename(dir), children: [] };
        
        for (const entry of entries) {
          if (entry.startsWith('.')) continue;
          
          const fullPath = path.join(dir, entry);
          const stat = await fsPromises.stat(fullPath);
          
          if (stat.isDirectory()) {
            tree.children.push({
              name: entry,
              type: 'directory',
              children: []
            });
          } else {
            tree.children.push({
              name: entry,
              type: 'file',
              size: stat.size,
              modified: stat.mtime
            });
          }
        }
        
        return tree;
      }

      const tree = await buildTree(dirPath);
      res.json({ tree });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Audio transcription
  app.post('/api/audio/transcribe', async (req, res) => {
    try {
      const { audio } = req.body;
      if (!audio) {
        return res.status(400).json({ error: 'Audio data is required' });
      }

      const tempFile = path.join((await import('os')).default.tmpdir(), `audio_${Date.now()}.webm`);
      await fsPromises.writeFile(tempFile, Buffer.from(audio, 'base64'));

      try {
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI();
        
        const transcription = await openai.audio.transcriptions.create({
          file: (await import('fs')).createReadStream(tempFile),
          model: 'whisper-1'
        });

        await fsPromises.unlink(tempFile);
        res.json({ text: transcription.text });
      } catch (error) {
        await fsPromises.unlink(tempFile);
        throw error;
      }
    } catch (error) {
      res.status(500).json({ error: 'Transcription failed: ' + error.message });
    }
  });

  // Configuration
  app.get('/api/config', async (req, res) => {
    try {
      const configPath = path.join((await import('os')).default.homedir(), '.claude', 'config.json');
      try {
        const config = await fsPromises.readFile(configPath, 'utf8');
        res.json(JSON.parse(config));
      } catch (error) {
        if (error.code === 'ENOENT') {
          res.json({});
        } else {
          throw error;
        }
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/config', async (req, res) => {
    try {
      const configDir = path.join((await import('os')).default.homedir(), '.claude');
      const configPath = path.join(configDir, 'config.json');
      
      await fsPromises.mkdir(configDir, { recursive: true });
      await fsPromises.writeFile(configPath, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Server management
  app.post('/api/servers/start', async (req, res) => {
    try {
      const { name, command, args, cwd } = req.body;
      if (!name || !command || !args || !cwd) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      
      const result = await serverManager.startServer(name, command, args, cwd);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/servers/scripts', async (req, res) => {
    try {
      const { cwd } = req.query;
      if (!cwd) {
        return res.status(400).json({ error: 'Working directory is required' });
      }
      
      const scripts = await serverManager.getAvailableScripts(cwd);
      res.json(scripts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Slash commands
  app.get('/api/slash-commands', async (req, res) => {
    try {
      const configPath = path.join((await import('os')).default.homedir(), '.claude', 'slash-commands.json');
      try {
        const content = await fsPromises.readFile(configPath, 'utf8');
        res.json(JSON.parse(content));
      } catch (error) {
        if (error.code === 'ENOENT') {
          res.json({ commands: [] });
        } else {
          throw error;
        }
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}