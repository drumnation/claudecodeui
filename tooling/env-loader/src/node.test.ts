import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  loadEnvironment,
  getEnv,
  requireEnv,
  getIntEnv,
  getBoolEnv,
  getFilteredEnv,
} from './node.js';

vi.mock('node:fs');
vi.mock('dotenv');

describe('node environment loader', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {...originalEnv};
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadEnvironment', () => {
    it('should detect monorepo root by pnpm-workspace.yaml', () => {
      const mockCwd = '/Users/test/monorepo/apps/frontend';
      const mockRoot = '/Users/test/monorepo';

      vi.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return p === path.join(mockRoot, 'pnpm-workspace.yaml');
      });

      const result = loadEnvironment();

      expect(result.success).toBe(true);
      expect(vi.mocked(fs.existsSync)).toHaveBeenCalledWith(
        path.join(mockRoot, 'pnpm-workspace.yaml'),
      );
    });

    it('should validate required environment variables', () => {
      process.env['EXISTING_VAR'] = 'value';

      const result = loadEnvironment({
        required: ['EXISTING_VAR', 'MISSING_VAR'],
      });

      expect(result.success).toBe(false);
      expect(result.missingRequired).toEqual(['MISSING_VAR']);
    });

    it('should load root and local env files in correct order', async () => {
      const mockCwd = '/Users/test/monorepo/apps/backend';
      const mockRoot = '/Users/test/monorepo';

      vi.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return (
          pathStr === path.join(mockRoot, 'pnpm-workspace.yaml') ||
          pathStr === path.join(mockRoot, '.env') ||
          pathStr === path.join(mockCwd, '.env')
        );
      });

      const dotenv = await import('dotenv');
      vi.mocked(dotenv.config).mockReturnValue({parsed: {}} as any);

      const result = loadEnvironment({debug: true});

      // Should be called twice: once for root, once for local
      expect(dotenv.config).toHaveBeenCalledTimes(2);
      expect(result.rootEnvFound).toBe(true);
      expect(result.loadedPaths).toHaveLength(2);
    });
  });

  describe('getEnv', () => {
    it('should return environment variable value', () => {
      process.env['TEST_VAR'] = 'test-value';
      expect(getEnv('TEST_VAR')).toBe('test-value');
    });

    it('should return default value if not found', () => {
      expect(getEnv('MISSING_VAR', 'default')).toBe('default');
    });
  });

  describe('requireEnv', () => {
    it('should return value if exists', () => {
      process.env['REQUIRED_VAR'] = 'value';
      expect(requireEnv('REQUIRED_VAR')).toBe('value');
    });

    it('should throw if not found', () => {
      expect(() => requireEnv('MISSING_VAR')).toThrow(
        'Required environment variable MISSING_VAR is not defined',
      );
    });
  });

  describe('getIntEnv', () => {
    it('should parse integer values', () => {
      process.env['INT_VAR'] = '42';
      expect(getIntEnv('INT_VAR')).toBe(42);
    });

    it('should return default for invalid integers', () => {
      process.env['INVALID_INT'] = 'not-a-number';
      expect(getIntEnv('INVALID_INT', 10)).toBe(10);
    });

    it('should return undefined if no default provided', () => {
      expect(getIntEnv('MISSING_INT')).toBeUndefined();
    });
  });

  describe('getBoolEnv', () => {
    it.each([
      ['true', true],
      ['TRUE', true],
      ['1', true],
      ['yes', true],
      ['YES', true],
      ['false', false],
      ['FALSE', false],
      ['0', false],
      ['no', false],
      ['anything-else', false],
    ])('should parse "%s" as %s', (value, expected) => {
      process.env['BOOL_VAR'] = value;
      expect(getBoolEnv('BOOL_VAR')).toBe(expected);
    });

    it('should return default if not found', () => {
      expect(getBoolEnv('MISSING_BOOL', true)).toBe(true);
    });
  });

  describe('getFilteredEnv', () => {
    it('should return all env vars without prefix', () => {
      process.env['VAR1'] = 'value1';
      process.env['VAR2'] = 'value2';

      const filtered = getFilteredEnv();
      expect(filtered['VAR1']).toBe('value1');
      expect(filtered['VAR2']).toBe('value2');
    });

    it('should filter by prefix', () => {
      process.env['APP_VAR1'] = 'value1';
      process.env['APP_VAR2'] = 'value2';
      process.env['OTHER_VAR'] = 'value3';

      const filtered = getFilteredEnv('APP_');
      expect(filtered['APP_VAR1']).toBe('value1');
      expect(filtered['APP_VAR2']).toBe('value2');
      expect(filtered['OTHER_VAR']).toBeUndefined();
    });
  });
});
