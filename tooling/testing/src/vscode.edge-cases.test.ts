import {describe, it, expect, vi, beforeEach} from 'vitest';
import {
  defineVSCodeConfig,
  generateVSCodeTestTsConfig,
  setupVSCodeTesting,
  type VSCodeTestConfig,
} from './vscode.js';

describe('VSCode Testing - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('defineVSCodeConfig - Edge Cases', () => {
    it('should handle undefined config gracefully', () => {
      const config = defineVSCodeConfig(undefined);
      expect(config).toBeDefined();
      expect(config.files).toBe('out/test/**/*.test.js');
    });

    it('should handle empty config object', () => {
      const config = defineVSCodeConfig({});
      expect(config).toMatchObject({
        files: 'out/test/**/*.test.js',
        version: 'stable',
        workspaceFolder: process.cwd(),
      });
    });

    it('should handle null values in config', () => {
      const config = defineVSCodeConfig({
        testFiles: null as any,
        vscodeVersion: null as any,
      });

      expect(config.files).toBe('out/test/**/*.test.js');
      expect(config.version).toBe('stable');
    });

    it('should handle empty arrays for launch args', () => {
      const config = defineVSCodeConfig({
        launchArgs: [],
      });

      expect(config.launchArgs).toEqual([]);
    });

    it('should preserve custom workspace folder', () => {
      const customPath = '/custom/workspace/path';
      const config = defineVSCodeConfig({
        extensionDevelopmentPath: customPath,
      });

      expect(config.workspaceFolder).toBe(customPath);
    });

    it('should handle special characters in file patterns', () => {
      const config = defineVSCodeConfig({
        testFiles: 'out/test/**/*.[test|spec].js',
      });

      expect(config.files).toBe('out/test/**/*.[test|spec].js');
    });

    it('should handle very long timeout values', () => {
      const config = defineVSCodeConfig({
        mocha: {
          timeout: Number.MAX_SAFE_INTEGER,
        },
      });

      expect(config.mocha?.timeout).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle empty mocha grep pattern', () => {
      const config = defineVSCodeConfig({
        mocha: {
          grep: '',
        },
      });

      expect(config.mocha?.grep).toBe('');
    });

    it('should handle special environment variables', () => {
      const config = defineVSCodeConfig({
        env: {
          NODE_OPTIONS: '--max-old-space-size=4096',
          'SPECIAL-VAR': 'value with spaces',
          '': 'empty key',
          UNICODE_VAR: '🚀',
        },
      });

      expect(config.env).toMatchObject({
        NODE_OPTIONS: '--max-old-space-size=4096',
        'SPECIAL-VAR': 'value with spaces',
        '': 'empty key',
        UNICODE_VAR: '🚀',
      });
    });
  });

  describe('generateVSCodeTestTsConfig - Edge Cases', () => {
    it('should handle undefined base config path', () => {
      const config = generateVSCodeTestTsConfig(undefined);
      expect(config.extends).toBe('./tsconfig.json');
    });

    it('should handle empty string base config path', () => {
      const config = generateVSCodeTestTsConfig('');
      expect(config.extends).toBe('./tsconfig.json');
    });

    it('should handle absolute paths', () => {
      const config = generateVSCodeTestTsConfig(
        '/absolute/path/to/tsconfig.json',
      );
      expect(config.extends).toBe('/absolute/path/to/tsconfig.json');
    });

    it('should handle Windows-style paths', () => {
      const config = generateVSCodeTestTsConfig('C:\\projects\\tsconfig.json');
      expect(config.extends).toBe('C:\\projects\\tsconfig.json');
    });

    it('should handle paths with special characters', () => {
      const config = generateVSCodeTestTsConfig('./configs/tsconfig@base.json');
      expect(config.extends).toBe('./configs/tsconfig@base.json');
    });
  });

  describe('setupVSCodeTesting - Edge Cases', () => {
    it('should handle empty project root', () => {
      const setup = setupVSCodeTesting('');
      expect(setup).toBeDefined();
      expect(setup.templates).toHaveLength(5);
    });

    it('should handle project root with spaces', () => {
      const setup = setupVSCodeTesting('/path with spaces/project');
      expect(setup).toBeDefined();
      expect(setup.templates).toHaveLength(5);
    });

    it('should handle very long project paths', () => {
      const longPath = '/'.padEnd(1000, 'very/long/path/');
      const setup = setupVSCodeTesting(longPath);
      expect(setup).toBeDefined();
    });

    it('should handle Windows UNC paths', () => {
      const setup = setupVSCodeTesting('\\\\server\\share\\project');
      expect(setup).toBeDefined();
    });

    it('should generate valid JSON even with special project paths', () => {
      const setup = setupVSCodeTesting(
        '/path/with/"quotes"/and/\'apostrophes\'',
      );
      const tsconfigTemplate = setup.templates.find(
        (t) => t.path === 'tsconfig.spec.json',
      );

      expect(() => {
        JSON.parse(tsconfigTemplate!.content);
      }).not.toThrow();
    });
  });

  describe('Template Edge Cases', () => {
    it('should handle templates with no file extension', () => {
      const setup = setupVSCodeTesting('/project');
      const templates = setup.templates;

      // All templates should have proper extensions
      templates.forEach((template) => {
        expect(template.path).toMatch(/\.(ts|mjs|json)$/);
      });
    });

    it('should escape special characters in templates', () => {
      const setup = setupVSCodeTesting('/project');
      const runTestTemplate = setup.templates.find((t) =>
        t.path.includes('runTest.ts'),
      );

      // Should properly escape backslashes in path operations
      expect(runTestTemplate?.content).toContain('path.resolve');
      expect(runTestTemplate?.content).not.toContain('\\\\');
    });
  });

  describe('Configuration Conflicts', () => {
    it('should handle conflicting mocha options', () => {
      const config = defineVSCodeConfig({
        mocha: {
          ui: 'bdd',
          timeout: 0, // No timeout
          reporter: 'tap',
          grep: '.*',
        },
      });

      expect(config.mocha).toMatchObject({
        ui: 'bdd',
        timeout: 0,
        reporter: 'tap',
        grep: '.*',
      });
    });

    it('should handle duplicate launch arguments', () => {
      const config = defineVSCodeConfig({
        launchArgs: [
          '--disable-extensions',
          '--disable-extensions',
          '--no-sandbox',
        ],
      });

      // Should preserve duplicates as-is (VSCode will handle deduplication)
      expect(config.launchArgs).toHaveLength(3);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle maximum reasonable values', () => {
      const config = defineVSCodeConfig({
        mocha: {
          timeout: 2147483647, // Max 32-bit signed integer
        },
        launchArgs: new Array(100).fill('--flag'),
        env: Object.fromEntries(
          new Array(100).fill(0).map((_, i) => [`VAR_${i}`, `value_${i}`]),
        ),
      });

      expect(config.mocha?.timeout).toBe(2147483647);
      expect(config.launchArgs).toHaveLength(100);
      expect(Object.keys(config.env || {})).toHaveLength(100);
    });

    it('should handle minimum reasonable values', () => {
      const config = defineVSCodeConfig({
        mocha: {
          timeout: 1, // 1ms timeout
        },
      });

      expect(config.mocha?.timeout).toBe(1);
    });
  });

  describe('Type Safety Edge Cases', () => {
    it('should handle incorrect types gracefully', () => {
      const config = defineVSCodeConfig({
        testFiles: 123 as any,
        vscodeVersion: true as any,
        launchArgs: 'not-an-array' as any,
        env: 'not-an-object' as any,
        mocha: 'not-an-object' as any,
      });

      // Should fall back to defaults for incorrect types
      expect(config.files).toBe('out/test/**/*.test.js');
      expect(config.version).toBe('stable');
    });
  });
});
