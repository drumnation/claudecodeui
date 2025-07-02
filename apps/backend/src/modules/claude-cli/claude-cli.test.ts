import {describe, it, expect} from 'vitest';
import {
  buildClaudeArgs,
  formatCommandForLogging,
  isStatusMessage,
  isInteractivePrompt,
  parseStatusMessage,
} from './claude-cli.utils.js';

describe('claude-cli utils', () => {
  describe('buildClaudeArgs', () => {
    it('should build args for new session with command', () => {
      const args = buildClaudeArgs('test command', {});
      expect(args).toContain('--print');
      expect(args).toContain('test command');
      expect(args).toContain('--model');
      expect(args).toContain('sonnet');
    });

    it('should build args for resume session', () => {
      const args = buildClaudeArgs(undefined, {
        resume: true,
        sessionId: 'test-123',
      });
      expect(args).toContain('--resume');
      expect(args).toContain('test-123');
      expect(args).not.toContain('--model');
    });

    it('should handle tools settings', () => {
      const args = buildClaudeArgs('test', {
        toolsSettings: {
          allowedTools: ['tool1', 'tool2'],
          disallowedTools: ['tool3'],
          skipPermissions: false,
        },
      });
      expect(args).toContain('--allowedTools');
      expect(args).toContain('tool1');
      expect(args).toContain('tool2');
      expect(args).toContain('--disallowedTools');
      expect(args).toContain('tool3');
    });

    it('should handle skip permissions', () => {
      const args = buildClaudeArgs('test', {
        toolsSettings: {
          allowedTools: ['tool1'],
          disallowedTools: ['tool2'],
          skipPermissions: true,
        },
      });
      expect(args).toContain('--dangerously-skip-permissions');
      expect(args).not.toContain('--allowedTools');
      expect(args).not.toContain('--disallowedTools');
    });
  });

  describe('formatCommandForLogging', () => {
    it('should format command with args', () => {
      const formatted = formatCommandForLogging('claude', [
        '--print',
        'hello world',
      ]);
      expect(formatted).toBe('claude --print "hello world"');
    });

    it('should escape newlines', () => {
      const formatted = formatCommandForLogging('claude', [
        '--print',
        'hello\nworld',
      ]);
      // The implementation escapes newlines to \\n
      expect(formatted).toBe('claude --print hello\\nworld');
    });
  });

  describe('isStatusMessage', () => {
    it('should detect status messages', () => {
      expect(isStatusMessage('✻ Working...')).toBe(true);
      expect(isStatusMessage('⚒ 123 tokens')).toBe(true);
      expect(isStatusMessage('esc to interrupt')).toBe(true);
      expect(isStatusMessage('Normal message')).toBe(false);
    });
  });

  describe('isInteractivePrompt', () => {
    it('should detect interactive prompts', () => {
      expect(isInteractivePrompt('Do you want to continue?')).toBe(true);
      expect(isInteractivePrompt('Select an option >')).toBe(true);
      expect(isInteractivePrompt('1. Yes')).toBe(true);
      expect(isInteractivePrompt('Normal message')).toBe(false);
    });
  });

  describe('parseStatusMessage', () => {
    it('should parse status message with tokens', () => {
      const {action, tokens} = parseStatusMessage('✻ Working... ⚒ 123 tokens');
      expect(action).toBe('Working');
      expect(tokens).toBe(123);
    });

    it('should handle missing tokens', () => {
      const {action, tokens} = parseStatusMessage('✻ Toggling...');
      expect(action).toBe('Toggling');
      expect(tokens).toBe(0);
    });

    it('should default to Working action', () => {
      const {action, tokens} = parseStatusMessage('Some random text');
      expect(action).toBe('Working');
      expect(tokens).toBe(0);
    });
  });
});
