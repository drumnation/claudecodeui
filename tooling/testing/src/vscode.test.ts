import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  defineVSCodeConfig,
  defaultVSCodeTestConfig,
  generateVSCodeTestTsConfig,
  vscodeTestTsConfig,
  vscodeTestRunnerTemplate,
  vscodeTestSuiteTemplate,
  vscodeTestTemplate,
  vscodeTestScripts,
  setupVSCodeTesting,
  type VSCodeTestConfig,
} from './vscode.js';

// Mock the vscode test CLI module
vi.mock('@vscode/test-cli', () => ({
  defineConfig: vi.fn((config: any) => config),
}));

describe('VSCode Testing Configuration', () => {
  describe('defineVSCodeConfig', () => {
    it('should return default configuration when no config provided', () => {
      const config = defineVSCodeConfig();

      expect(config).toEqual({
        files: 'out/test/**/*.test.js',
        version: 'stable',
        workspaceFolder: process.cwd(),
        launchArgs: ['--disable-extensions'],
        env: {},
        mocha: {
          ui: 'tdd',
          timeout: 20000,
          reporter: 'spec',
          grep: '',
        },
      });
    });

    it('should merge custom configuration with defaults', () => {
      const customConfig: VSCodeTestConfig = {
        testFiles: 'dist/test/**/*.spec.js',
        vscodeVersion: 'insiders',
        launchArgs: ['--disable-gpu'],
        mocha: {
          timeout: 30000,
          reporter: 'json',
        },
      };

      const config = defineVSCodeConfig(customConfig);

      expect(config.files).toBe('dist/test/**/*.spec.js');
      expect(config.version).toBe('insiders');
      expect(config.launchArgs).toEqual(['--disable-gpu']);
      expect(config.mocha).toEqual({
        ui: 'tdd',
        timeout: 30000,
        reporter: 'json',
        grep: '',
      });
    });

    it('should handle partial mocha configuration', () => {
      const config = defineVSCodeConfig({
        mocha: {ui: 'bdd'},
      });

      expect(config.mocha).toEqual({
        ui: 'bdd',
        timeout: 20000,
        reporter: 'spec',
        grep: '',
      });
    });

    it('should handle environment variables', () => {
      const config = defineVSCodeConfig({
        env: {
          NODE_ENV: 'test',
          DEBUG: 'true',
        },
      });

      expect(config.env).toEqual({
        NODE_ENV: 'test',
        DEBUG: 'true',
      });
    });
  });

  describe('generateVSCodeTestTsConfig', () => {
    it('should generate tsconfig with default base path', () => {
      const tsConfig = generateVSCodeTestTsConfig();

      expect(tsConfig.extends).toBe('./tsconfig.json');
      expect(tsConfig.compilerOptions).toMatchObject({
        types: ['mocha', 'node', 'vscode'],
        module: 'commonjs',
        target: 'ES2018',
        sourceMap: true,
        outDir: './out/test',
      });
    });

    it('should use custom base config path', () => {
      const tsConfig = generateVSCodeTestTsConfig('../tsconfig.base.json');

      expect(tsConfig.extends).toBe('../tsconfig.base.json');
    });

    it('should include correct file patterns', () => {
      const tsConfig = generateVSCodeTestTsConfig();

      expect(tsConfig.include).toEqual(['src/test/**/*.ts']);
      expect(tsConfig.exclude).toEqual(['node_modules', 'out', 'dist']);
    });
  });

  describe('Template Generation', () => {
    it('should generate valid test runner template', () => {
      expect(vscodeTestRunnerTemplate).toContain('import { runTests }');
      expect(vscodeTestRunnerTemplate).toContain('@vscode/test-electron');
      expect(vscodeTestRunnerTemplate).toContain('extensionDevelopmentPath');
      expect(vscodeTestRunnerTemplate).toContain('extensionTestsPath');
    });

    it('should generate valid test suite template', () => {
      expect(vscodeTestSuiteTemplate).toContain("import Mocha from 'mocha'");
      expect(vscodeTestSuiteTemplate).toContain("glob('**/**.test.js'");
      expect(vscodeTestSuiteTemplate).toContain('mocha.addFile');
      expect(vscodeTestSuiteTemplate).toContain("ui: 'tdd'");
    });

    it('should generate valid test template', () => {
      expect(vscodeTestTemplate).toContain('import * as vscode');
      expect(vscodeTestTemplate).toContain("suite('Extension Test Suite'");
      expect(vscodeTestTemplate).toContain("test('Sample test'");
      expect(vscodeTestTemplate).toContain('assert.strictEqual');
    });
  });

  describe('vscodeTestScripts', () => {
    it('should contain all necessary scripts', () => {
      expect(vscodeTestScripts).toHaveProperty('compile-tests');
      expect(vscodeTestScripts).toHaveProperty('pretest');
      expect(vscodeTestScripts).toHaveProperty('test');
      expect(vscodeTestScripts).toHaveProperty('test:unit');
      expect(vscodeTestScripts).toHaveProperty('watch-tests');
    });

    it('should use correct commands', () => {
      expect(vscodeTestScripts['compile-tests']).toBe(
        'tsc -p tsconfig.spec.json',
      );
      expect(vscodeTestScripts.test).toBe('vscode-test');
      expect(vscodeTestScripts['watch-tests']).toBe(
        'tsc -p tsconfig.spec.json -w',
      );
    });
  });

  describe('setupVSCodeTesting', () => {
    it('should return complete setup configuration', () => {
      const projectRoot = '/mock/project/root';
      const setup = setupVSCodeTesting(projectRoot);

      expect(setup).toHaveProperty('templates');
      expect(setup).toHaveProperty('dependencies');
      expect(setup).toHaveProperty('scripts');
    });

    it('should generate correct template paths', () => {
      const setup = setupVSCodeTesting('/project');
      const templatePaths = setup.templates.map((t) => t.path);

      expect(templatePaths).toContain('src/test/runTest.ts');
      expect(templatePaths).toContain('src/test/suite/index.ts');
      expect(templatePaths).toContain('src/test/suite/extension.test.ts');
      expect(templatePaths).toContain('.vscode-test.mjs');
      expect(templatePaths).toContain('tsconfig.spec.json');
    });

    it('should include all necessary dependencies', () => {
      const setup = setupVSCodeTesting('/project');

      expect(setup.dependencies).toHaveProperty('@types/mocha');
      expect(setup.dependencies).toHaveProperty('@types/node');
      expect(setup.dependencies).toHaveProperty('@types/vscode');
      expect(setup.dependencies).toHaveProperty('@vscode/test-cli');
      expect(setup.dependencies).toHaveProperty('@vscode/test-electron');
      expect(setup.dependencies).toHaveProperty('mocha');
    });

    it('should include correct dependency versions', () => {
      const setup = setupVSCodeTesting('/project');

      expect(setup.dependencies['@types/mocha']).toBe('^10.0.6');
      expect(setup.dependencies['mocha']).toBe('^10.6.1');
      expect(setup.dependencies['@vscode/test-cli']).toBe('^0.0.9');
    });

    it('should generate valid .vscode-test.mjs content', () => {
      const setup = setupVSCodeTesting('/project');
      const vscodeTestFile = setup.templates.find(
        (t) => t.path === '.vscode-test.mjs',
      );

      expect(vscodeTestFile?.content).toContain('import { defineConfig }');
      expect(vscodeTestFile?.content).toContain(
        "files: 'out/test/**/*.test.js'",
      );
    });

    it('should generate valid tsconfig.spec.json content', () => {
      const setup = setupVSCodeTesting('/project');
      const tsconfigFile = setup.templates.find(
        (t) => t.path === 'tsconfig.spec.json',
      );

      const parsedConfig = JSON.parse(tsconfigFile?.content || '{}');
      expect(parsedConfig.extends).toBe('./tsconfig.json');
      expect(parsedConfig.compilerOptions.module).toBe('commonjs');
    });
  });

  describe('Default Configuration Values', () => {
    it('should have correct default test file pattern', () => {
      expect(defaultVSCodeTestConfig.testFiles).toBe('out/test/**/*.test.js');
    });

    it('should have correct default mocha configuration', () => {
      expect(defaultVSCodeTestConfig.mocha).toEqual({
        ui: 'tdd',
        timeout: 20000,
        reporter: 'spec',
        grep: '',
      });
    });

    it('should have correct default launch arguments', () => {
      expect(defaultVSCodeTestConfig.launchArgs).toEqual([
        '--disable-extensions',
      ]);
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have correct compiler options for VSCode', () => {
      expect(vscodeTestTsConfig.compilerOptions).toMatchObject({
        module: 'commonjs',
        target: 'ES2018',
        sourceMap: true,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      });
    });

    it('should include necessary type definitions', () => {
      expect(vscodeTestTsConfig.compilerOptions.types).toContain('mocha');
      expect(vscodeTestTsConfig.compilerOptions.types).toContain('node');
      expect(vscodeTestTsConfig.compilerOptions.types).toContain('vscode');
    });
  });
});
