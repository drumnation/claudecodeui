import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import * as service from './projects.service.js';
import * as repository from './projects.repository.js';
import type {
  JsonlEntry,
  Session,
  SessionsResult,
  FileWithStats,
} from './projects.types.js';

vi.mock('./projects.repository.js');

describe('projects.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDisplayName', () => {
    it('should return package.json name if available', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        name: 'my-package',
      });

      const result = await service.generateDisplayName('project-name');

      expect(result).toBe('my-package');
      expect(repository.readPackageJson).toHaveBeenCalledWith('project/name');
    });

    it('should handle project paths starting with /', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue(null);

      const result = await service.generateDisplayName(
        '-Users-john-projects-myapp',
      );

      expect(result).toBe('.../projects/myapp');
    });

    it('should return full path for short paths', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue(null);

      const result = await service.generateDisplayName('-home-app');

      expect(result).toBe('/home/app');
    });

    it('should return project path for non-absolute paths', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue(null);

      const result = await service.generateDisplayName('local-project');

      expect(result).toBe('local/project');
    });
  });

  describe('parseJsonlSessions', () => {
    it('should parse sessions from JSONL entries', async () => {
      const entries: JsonlEntry[] = [
        {
          sessionId: 'session1',
          timestamp: '2024-01-01T10:00:00Z',
          cwd: '/project',
        },
        {sessionId: 'session1', type: 'summary', summary: 'Test summary'},
        {sessionId: 'session2', timestamp: '2024-01-01T11:00:00Z'},
        {sessionId: 'session1', message: {role: 'user', content: 'Hello'}},
      ];

      vi.mocked(repository.readJsonlFileStream).mockImplementation(
        async (_, onLine) => {
          entries.forEach((entry) => onLine(entry));
        },
      );

      const result = await service.parseJsonlSessions('/path/to/file.jsonl');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('session2'); // More recent first
      expect(result[0].summary).toBe('New Session');
      expect(result[1].id).toBe('session1');
      expect(result[1].summary).toBe('Test summary');
      expect(result[1].messageCount).toBe(3);
      expect(result[1].cwd).toBe('/project');
    });

    it('should use first user message as summary if no summary type', async () => {
      const entries: JsonlEntry[] = [
        {sessionId: 'session1', timestamp: '2024-01-01T10:00:00Z'},
        {
          sessionId: 'session1',
          message: {role: 'user', content: 'This is my first message'},
        },
      ];

      vi.mocked(repository.readJsonlFileStream).mockImplementation(
        async (_, onLine) => {
          entries.forEach((entry) => onLine(entry));
        },
      );

      const result = await service.parseJsonlSessions('/path/to/file.jsonl');

      expect(result[0].summary).toBe('This is my first message');
    });

    it('should truncate long user messages for summary', async () => {
      const longMessage = 'a'.repeat(60);
      const entries: JsonlEntry[] = [
        {sessionId: 'session1', timestamp: '2024-01-01T10:00:00Z'},
        {sessionId: 'session1', message: {role: 'user', content: longMessage}},
      ];

      vi.mocked(repository.readJsonlFileStream).mockImplementation(
        async (_, onLine) => {
          entries.forEach((entry) => onLine(entry));
        },
      );

      const result = await service.parseJsonlSessions('/path/to/file.jsonl');

      expect(result[0].summary).toBe('a'.repeat(50) + '...');
    });

    it('should skip command messages for summary', async () => {
      const entries: JsonlEntry[] = [
        {sessionId: 'session1', timestamp: '2024-01-01T10:00:00Z'},
        {
          sessionId: 'session1',
          message: {role: 'user', content: '<command-name>test</command-name>'},
        },
        {
          sessionId: 'session1',
          message: {role: 'user', content: 'Real message'},
        },
      ];

      vi.mocked(repository.readJsonlFileStream).mockImplementation(
        async (_, onLine) => {
          entries.forEach((entry) => onLine(entry));
        },
      );

      const result = await service.parseJsonlSessions('/path/to/file.jsonl');

      expect(result[0].summary).toBe('Real message');
    });
  });

  describe('getSessions', () => {
    it('should return paginated sessions', async () => {
      const mockFiles = ['session1.jsonl', 'session2.jsonl'];
      const mockStats: FileWithStats[] = [
        {file: 'session1.jsonl', mtime: new Date('2024-01-01')},
        {file: 'session2.jsonl', mtime: new Date('2024-01-02')},
      ];

      vi.mocked(repository.readJsonlFiles).mockResolvedValue(mockFiles);
      vi.mocked(repository.getFileStats).mockResolvedValue(mockStats);

      // Mock readJsonlFileStream to return sessions in the order they're read
      vi.mocked(repository.readJsonlFileStream).mockImplementation(
        async (filePath, onLine) => {
          if (filePath.includes('session2.jsonl')) {
            // More recent file, processed first
            onLine({
              sessionId: 'session2',
              timestamp: '2024-01-02',
              message: {role: 'user', content: 'Test 2'},
            });
          } else {
            onLine({
              sessionId: 'session1',
              timestamp: '2024-01-01',
              message: {role: 'user', content: 'Test 1'},
            });
          }
        },
      );

      const result = await service.getSessions('/home', 'project', 1, 0);

      expect(result.sessions).toHaveLength(1);
      expect(result.sessions[0].id).toBe('session2');
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(2);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(1);
    });

    it('should handle empty project', async () => {
      vi.mocked(repository.readJsonlFiles).mockResolvedValue([]);

      const result = await service.getSessions('/home', 'project', 5, 0);

      expect(result.sessions).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(repository.readJsonlFiles).mockRejectedValue(
        new Error('File read error'),
      );

      const result = await service.getSessions('/home', 'project', 5, 0);

      expect(result.sessions).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(0);
    });

    it('should deduplicate sessions across files', async () => {
      const mockFiles = ['file1.jsonl', 'file2.jsonl'];
      const mockStats: FileWithStats[] = [
        {file: 'file1.jsonl', mtime: new Date('2024-01-02')},
        {file: 'file2.jsonl', mtime: new Date('2024-01-01')},
      ];

      vi.mocked(repository.readJsonlFiles).mockResolvedValue(mockFiles);
      vi.mocked(repository.getFileStats).mockResolvedValue(mockStats);

      // Mock readJsonlFileStream to simulate duplicate sessions across files
      vi.mocked(repository.readJsonlFileStream).mockImplementation(
        async (filePath, onLine) => {
          // Both files contain the same session
          onLine({
            sessionId: 'session1',
            timestamp: '2024-01-01',
            message: {role: 'user', content: 'Test'},
          });
        },
      );

      const result = await service.getSessions('/home', 'project', 5, 0);

      expect(result.sessions).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getSessionMessages', () => {
    it('should return messages for a specific session', async () => {
      const mockFiles = ['file1.jsonl', 'file2.jsonl'];

      vi.mocked(repository.readJsonlFiles).mockResolvedValue(mockFiles);

      let fileCount = 0;
      vi.mocked(repository.readJsonlFileStream).mockImplementation(
        async (_, onLine) => {
          // Only add messages on the first file
          if (fileCount === 0) {
            onLine({
              sessionId: 'session1',
              timestamp: '2024-01-01T10:00:00Z',
              message: {role: 'user', content: 'Hello'},
            });
            onLine({
              sessionId: 'session1',
              timestamp: '2024-01-01T10:02:00Z',
              message: {role: 'assistant', content: 'World'},
            });
          }
          fileCount++;
        },
      );

      const result = await service.getSessionMessages(
        '/home',
        'project',
        'session1',
      );

      expect(result).toHaveLength(2);
      expect(result[0].message?.content).toBe('Hello');
      expect(result[1].message?.content).toBe('World');
    });

    it('should sort messages by timestamp', async () => {
      const mockFiles = ['file1.jsonl'];
      const entries: JsonlEntry[] = [
        {
          sessionId: 'session1',
          timestamp: '2024-01-01T10:02:00Z',
          message: {role: 'user', content: 'Second'},
        },
        {
          sessionId: 'session1',
          timestamp: '2024-01-01T10:01:00Z',
          message: {role: 'user', content: 'First'},
        },
      ];

      vi.mocked(repository.readJsonlFiles).mockResolvedValue(mockFiles);
      vi.mocked(repository.readJsonlFileStream).mockImplementation(
        async (_, onLine) => {
          entries.forEach((entry) => onLine(entry));
        },
      );

      const result = await service.getSessionMessages(
        '/home',
        'project',
        'session1',
      );

      expect(result[0].message?.content).toBe('First');
      expect(result[1].message?.content).toBe('Second');
    });

    it('should handle empty results', async () => {
      vi.mocked(repository.readJsonlFiles).mockResolvedValue([]);

      const result = await service.getSessionMessages(
        '/home',
        'project',
        'session1',
      );

      expect(result).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(repository.readJsonlFiles).mockRejectedValue(
        new Error('Read error'),
      );

      const result = await service.getSessionMessages(
        '/home',
        'project',
        'session1',
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('buildProject', () => {
    it('should build project with custom display name', async () => {
      const config = {
        'project-name': {displayName: 'Custom Name'},
      };

      // Since we're testing buildProject which calls getSessions internally,
      // we need to mock the repository functions that getSessions uses
      vi.mocked(repository.readJsonlFiles).mockResolvedValue([]);

      const result = await service.buildProject(
        'project-name',
        '/path',
        config,
        '/home',
      );

      expect(result.displayName).toBe('Custom Name');
      expect(result.isCustomName).toBe(true);
      expect(result.sessions).toEqual([]);
    });

    it('should build project with auto-generated display name', async () => {
      // Mock repository functions
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        name: 'Auto Name',
      });
      vi.mocked(repository.readJsonlFiles).mockResolvedValue(['file1.jsonl']);
      vi.mocked(repository.getFileStats).mockResolvedValue([
        {file: 'file1.jsonl', mtime: new Date()},
      ]);
      vi.mocked(repository.readJsonlFileStream).mockImplementation(
        async (_, onLine) => {
          onLine({
            sessionId: 'session1',
            message: {role: 'user', content: 'Test'},
          });
        },
      );

      const result = await service.buildProject(
        'project-name',
        '/path',
        {},
        '/home',
      );

      expect(result.displayName).toBe('Auto Name');
      expect(result.isCustomName).toBe(false);
      expect(result.sessions).toHaveLength(1);
      expect(result.sessionMeta).toBeDefined();
    });

    it('should handle session loading errors', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        name: 'Auto Name',
      });
      vi.mocked(repository.readJsonlFiles).mockRejectedValue(
        new Error('Session error'),
      );

      const result = await service.buildProject(
        'project-name',
        '/path',
        {},
        '/home',
      );

      expect(result.sessions).toEqual([]);
      // sessionMeta is set to { hasMore: false, total: 0 } when getSessions fails
      expect(result.sessionMeta).toEqual({hasMore: false, total: 0});
    });
  });

  describe('filterSessionEntriesById', () => {
    it('should filter out entries for specified session', () => {
      const lines = [
        '{"sessionId":"session1","message":"test"}',
        '{"sessionId":"session2","message":"keep"}',
        '{"sessionId":"session1","message":"remove"}',
      ];

      const result = service.filterSessionEntriesById(lines, 'session1');

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('session2');
    });

    it('should keep lines that fail to parse', () => {
      const lines = [
        'invalid json',
        '{"sessionId":"session1","message":"test"}',
        '{"broken',
      ];

      const result = service.filterSessionEntriesById(lines, 'session1');

      expect(result).toHaveLength(2);
      expect(result).toContain('invalid json');
      expect(result).toContain('{"broken');
    });
  });

  describe('findSessionFile', () => {
    it('should find file containing session', async () => {
      const mockFiles = ['file1.jsonl', 'file2.jsonl'];

      vi.mocked(repository.readJsonlFiles).mockResolvedValue(mockFiles);
      vi.mocked(repository.readJsonlFile)
        .mockResolvedValueOnce('{"sessionId":"other"}\n')
        .mockResolvedValueOnce(
          '{"sessionId":"session1"}\n{"sessionId":"other"}',
        );

      const result = await service.findSessionFile(
        '/home',
        'project',
        'session1',
      );

      expect(result).toBe('/home/.claude/projects/project/file2.jsonl');
    });

    it('should return null if session not found', async () => {
      const mockFiles = ['file1.jsonl'];

      vi.mocked(repository.readJsonlFiles).mockResolvedValue(mockFiles);
      vi.mocked(repository.readJsonlFile).mockResolvedValue(
        '{"sessionId":"other"}\n',
      );

      const result = await service.findSessionFile(
        '/home',
        'project',
        'session1',
      );

      expect(result).toBeNull();
    });

    it('should handle invalid JSON lines', async () => {
      const mockFiles = ['file1.jsonl'];

      vi.mocked(repository.readJsonlFiles).mockResolvedValue(mockFiles);
      vi.mocked(repository.readJsonlFile).mockResolvedValue(
        'invalid json\n{"sessionId":"session1"}',
      );

      const result = await service.findSessionFile(
        '/home',
        'project',
        'session1',
      );

      expect(result).toBe('/home/.claude/projects/project/file1.jsonl');
    });
  });

  describe('isProjectEmpty', () => {
    it('should return true for empty project', async () => {
      vi.mocked(repository.readJsonlFiles).mockResolvedValue([]);

      const result = await service.isProjectEmpty('/home', 'project');

      expect(result).toBe(true);
    });

    it('should return false for project with sessions', async () => {
      vi.mocked(repository.readJsonlFiles).mockResolvedValue(['file1.jsonl']);
      vi.mocked(repository.getFileStats).mockResolvedValue([
        {file: 'file1.jsonl', mtime: new Date()},
      ]);
      vi.mocked(repository.readJsonlFileStream).mockImplementation(
        async (_, onLine) => {
          onLine({
            sessionId: 'session1',
            message: {role: 'user', content: 'Test'},
          });
        },
      );

      const result = await service.isProjectEmpty('/home', 'project');

      expect(result).toBe(false);
    });

    it('should return true when getSessions has error (treats as empty)', async () => {
      // When readJsonlFiles fails, getSessions catches the error and returns empty result
      // This makes isProjectEmpty return true (it appears empty)
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.mocked(repository.readJsonlFiles).mockRejectedValue(
        new Error('Read error'),
      );

      const result = await service.isProjectEmpty('/home', 'project');

      expect(result).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error reading sessions for project'),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateSessionSummary', () => {
    it('should append summary entry to file', async () => {
      vi.mocked(repository.readJsonlFiles).mockResolvedValue(['file1.jsonl']);
      vi.mocked(repository.readJsonlFile).mockResolvedValue(
        '{"sessionId":"session1"}\n',
      );
      vi.mocked(repository.appendToJsonlFile).mockResolvedValue();

      await service.updateSessionSummary(
        '/home',
        'project',
        'session1',
        'New summary',
      );

      expect(repository.appendToJsonlFile).toHaveBeenCalledWith(
        '/home/.claude/projects/project/file1.jsonl',
        expect.objectContaining({
          sessionId: 'session1',
          type: 'summary',
          summary: 'New summary',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should throw error if session not found', async () => {
      vi.mocked(repository.readJsonlFiles).mockResolvedValue(['file1.jsonl']);
      vi.mocked(repository.readJsonlFile).mockResolvedValue(
        '{"sessionId":"other"}\n',
      );

      await expect(
        service.updateSessionSummary(
          '/home',
          'project',
          'session1',
          'New summary',
        ),
      ).rejects.toThrow('Session session1 not found');
    });
  });
});
