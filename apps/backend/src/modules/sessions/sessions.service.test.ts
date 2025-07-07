import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { promises as fs } from 'fs';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    access: vi.fn(),
  }
}));

// Create mock for OpenAI
const mockOpenAICreate = vi.fn();

// Mock OpenAI module
vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: mockOpenAICreate
      }
    }
  }
}));

// Import after mocks are set up
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  let service: SessionsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SessionsService();
  });

  describe('generateSessionTitleLocal', () => {
    it('should extract "help with" patterns', () => {
      const messages = [
        { role: 'user' as const, content: 'Help me with implementing a chat interface' }
      ];
      const title = service.generateSessionTitleLocal(messages);
      expect(title).toBe('implementing a chat interface');
    });

    it('should extract "how to" patterns', () => {
      const messages = [
        { role: 'user' as const, content: 'How do I set up TypeScript?' }
      ];
      const title = service.generateSessionTitleLocal(messages);
      expect(title).toBe('How to set up TypeScript');
    });

    it('should extract "fix" patterns', () => {
      const messages = [
        { role: 'user' as const, content: 'Please fix the authentication bug in my app' }
      ];
      const title = service.generateSessionTitleLocal(messages);
      expect(title).toBe('Fix the authentication bug in');
    });

    it('should extract "test" patterns', () => {
      const messages = [
        { role: 'user' as const, content: 'I need to test the payment module' }
      ];
      const title = service.generateSessionTitleLocal(messages);
      expect(title).toBe('Test the payment module');
    });

    it('should use first few words as fallback', () => {
      const messages = [
        { role: 'user' as const, content: 'Claude can you hear me?' }
      ];
      const title = service.generateSessionTitleLocal(messages);
      expect(title).toBe('Claude can you hear');
    });

    it('should return "New Session" for empty messages', () => {
      const messages: any[] = [];
      const title = service.generateSessionTitleLocal(messages);
      expect(title).toBe('New Session');
    });

    it('should handle special characters', () => {
      const messages = [
        { role: 'user' as const, content: 'Help with @mentions and #hashtags!' }
      ];
      const title = service.generateSessionTitleLocal(messages);
      expect(title).toBe('mentions and hashtags');
    });
  });

  describe('generateSessionTitle', () => {
    it('should generate title using OpenAI', async () => {
      const messages = [
        { role: 'user' as const, content: 'Help me build a React app' },
        { role: 'assistant' as const, content: 'I can help you build a React app...' },
        { role: 'user' as const, content: 'Great, let\'s start with routing' }
      ];

      mockOpenAICreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'React App Development'
          }
        }]
      });

      const title = await service.generateSessionTitle(messages);
      expect(title).toBe('React App Development');
      
      expect(mockOpenAICreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: expect.any(Array),
        max_tokens: 20,
        temperature: 0.7,
      });
    });

    it('should handle OpenAI errors gracefully', async () => {
      const messages = [
        { role: 'user' as const, content: 'Help me with coding' }
      ];

      mockOpenAICreate.mockRejectedValueOnce(new Error('API error'));

      const title = await service.generateSessionTitle(messages);
      expect(title).toBe('New Session');
    });

    it('should truncate long titles', async () => {
      const messages = [
        { role: 'user' as const, content: 'Help me with something' }
      ];

      mockOpenAICreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'This is a very long title that exceeds the maximum allowed character limit and should be truncated'
          }
        }]
      });

      const title = await service.generateSessionTitle(messages);
      expect(title).toBe('This is a very long title that exceeds the max...');
      expect(title.length).toBe(50);
    });

    it('should return "New Session" for empty messages', async () => {
      const messages: any[] = [];
      const title = await service.generateSessionTitle(messages);
      expect(title).toBe('New Session');
      expect(mockOpenAICreate).not.toHaveBeenCalled();
    });

    it('should filter only user messages', async () => {
      const messages = [
        { role: 'system' as const, content: 'System message' },
        { role: 'user' as const, content: 'First user message' },
        { role: 'assistant' as const, content: 'Assistant response' },
        { role: 'user' as const, content: 'Second user message' }
      ];

      mockOpenAICreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'User Messages Title'
          }
        }]
      });

      await service.generateSessionTitle(messages);
      
      const call = mockOpenAICreate.mock.calls[0][0];
      const userPrompt = call.messages[1].content;
      expect(userPrompt).toContain('First user message');
      expect(userPrompt).toContain('Second user message');
      expect(userPrompt).not.toContain('System message');
      expect(userPrompt).not.toContain('Assistant response');
    });
  });

  describe('updateSessionTitle', () => {
    it('should update existing summary in JSONL file', async () => {
      const projectPath = '/home/user/.claude/projects/test-project';
      const sessionId = 'session-123';
      const title = 'Updated Title';

      const existingContent = JSON.stringify({ type: 'summary', summary: 'Old Title' }) + '\n' +
                             JSON.stringify({ type: 'message', content: 'Hello' }) + '\n';

      (fs.readFile as Mock).mockResolvedValueOnce(existingContent);

      await service.updateSessionTitle(projectPath, sessionId, title);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('session-123.jsonl'),
        expect.stringContaining('"summary":"Updated Title"')
      );
    });

    it('should add new summary if none exists', async () => {
      const projectPath = '/home/user/.claude/projects/test-project';
      const sessionId = 'session-456';
      const title = 'New Title';

      const existingContent = JSON.stringify({ type: 'message', content: 'Hello' }) + '\n';

      (fs.readFile as Mock).mockResolvedValueOnce(existingContent);

      await service.updateSessionTitle(projectPath, sessionId, title);

      const writeCall = (fs.writeFile as Mock).mock.calls[0];
      const writtenContent = writeCall[1];
      
      expect(writtenContent).toContain('"type":"summary"');
      expect(writtenContent).toContain('"summary":"New Title"');
      expect(writtenContent).toContain('"type":"message"');
    });

    it('should handle read errors gracefully', async () => {
      const projectPath = '/home/user/.claude/projects/test-project';
      const sessionId = 'session-789';
      const title = 'Title';

      (fs.readFile as Mock).mockRejectedValueOnce(new Error('File not found'));

      // Should not throw
      await expect(service.updateSessionTitle(projectPath, sessionId, title)).resolves.toBeUndefined();
    });

    it('should handle empty files', async () => {
      const projectPath = '/home/user/.claude/projects/test-project';
      const sessionId = 'session-empty';
      const title = 'Title for Empty';

      (fs.readFile as Mock).mockResolvedValueOnce('');

      await service.updateSessionTitle(projectPath, sessionId, title);

      // Should not call writeFile for empty files
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });
});