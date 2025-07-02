import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {
  getEnv,
  requireEnv,
  getIntEnv,
  getBoolEnv,
  getFilteredEnv,
  initBrowserEnv,
} from './browser.js';

describe('browser environment loader', () => {
  let originalEnv: any;
  let originalWindow: any;

  beforeEach(() => {
    originalEnv = globalThis.process?.env;
    originalWindow = globalThis.window;

    // Reset environment sources
    if (globalThis.process) {
      globalThis.process.env = {};
    }
    (globalThis as any).window = {};
  });

  afterEach(() => {
    if (originalEnv && globalThis.process) {
      globalThis.process.env = originalEnv;
    }
    if (originalWindow) {
      (globalThis as any).window = originalWindow;
    }
  });

  describe('getEnv', () => {
    it('should get value from process.env', () => {
      if (!globalThis.process) (globalThis as any).process = {env: {}};
      globalThis.process!.env = {REACT_APP_API_URL: 'https://api.test'};
      expect(getEnv('REACT_APP_API_URL')).toBe('https://api.test');
    });

    it('should get value from window.__ENV__', () => {
      (globalThis as any).window.__ENV__ = {API_URL: 'https://api.test'};
      expect(getEnv('API_URL')).toBe('https://api.test');
    });

    it('should return default value if not found', () => {
      expect(getEnv('MISSING_VAR', 'default')).toBe('default');
    });
  });

  describe('requireEnv', () => {
    it('should return value if exists in process.env', () => {
      if (!globalThis.process) (globalThis as any).process = {env: {}};
      globalThis.process!.env = {REQUIRED: 'value'};
      expect(requireEnv('REQUIRED')).toBe('value');
    });

    it('should throw if not found', () => {
      expect(() => requireEnv('MISSING')).toThrow(
        'Required environment variable MISSING is not defined',
      );
    });
  });

  describe('getIntEnv', () => {
    it('should parse integer values from process.env', () => {
      if (!globalThis.process) (globalThis as any).process = {env: {}};
      globalThis.process!.env = {PORT: '3000'};
      expect(getIntEnv('PORT')).toBe(3000);
    });

    it('should return default for invalid integers', () => {
      if (!globalThis.process) (globalThis as any).process = {env: {}};
      globalThis.process!.env = {INVALID: 'not-a-number'};
      expect(getIntEnv('INVALID', 42)).toBe(42);
    });
  });

  describe('getBoolEnv', () => {
    it.each([
      ['true', true],
      ['TRUE', true],
      ['1', true],
      ['yes', true],
      ['false', false],
      ['0', false],
      ['no', false],
    ])('should parse "%s" as %s from process.env', (value, expected) => {
      if (!globalThis.process) (globalThis as any).process = {env: {}};
      globalThis.process!.env = {BOOL_VAR: value};
      expect(getBoolEnv('BOOL_VAR')).toBe(expected);
    });
  });

  describe('getFilteredEnv', () => {
    it('should filter by prefix from process.env', () => {
      if (!globalThis.process) (globalThis as any).process = {env: {}};
      globalThis.process!.env = {
        VITE_API_URL: 'https://api.test',
        VITE_PUBLIC_KEY: 'public-123',
        SECRET_KEY: 'secret-123',
      };

      const filtered = getFilteredEnv({prefix: 'VITE_'});
      expect(filtered).toEqual({
        VITE_API_URL: 'https://api.test',
        VITE_PUBLIC_KEY: 'public-123',
      });
      expect(filtered['SECRET_KEY']).toBeUndefined();
    });

    it('should merge from window.__ENV__', () => {
      if (!globalThis.process) (globalThis as any).process = {env: {}};
      globalThis.process!.env = {VITE_VAR1: 'value1'};
      (globalThis as any).window.__ENV__ = {VITE_VAR2: 'value2'};

      const filtered = getFilteredEnv({prefix: 'VITE_'});
      expect(filtered).toEqual({
        VITE_VAR1: 'value1',
        VITE_VAR2: 'value2',
      });
    });
  });

  describe('initBrowserEnv', () => {
    it('should initialize window.__ENV__', () => {
      initBrowserEnv({
        API_URL: 'https://api.test',
        PUBLIC_KEY: 'key-123',
      });

      expect((globalThis as any).window.__ENV__).toEqual({
        API_URL: 'https://api.test',
        PUBLIC_KEY: 'key-123',
      });
    });

    it('should merge with existing window.__ENV__', () => {
      (globalThis as any).window.__ENV__ = {EXISTING: 'value'};

      initBrowserEnv({
        NEW_VAR: 'new-value',
      });

      expect((globalThis as any).window.__ENV__).toEqual({
        EXISTING: 'value',
        NEW_VAR: 'new-value',
      });
    });
  });
});
