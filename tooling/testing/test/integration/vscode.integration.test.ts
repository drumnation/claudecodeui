import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {
  mkdtempSync,
  rmSync,
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setupVSCodeTesting, defineVSCodeConfig} from '../../src/vscode.js';

describe('VSCode Testing Integration', () => {
  let testDir: string;

  beforeEach(() => {
    // Create a temporary directory for testing
    testDir = mkdtempSync(join(tmpdir(), 'vscode-test-'));
  });

  afterEach(() => {
    // Clean up the temporary directory
    rmSync(testDir, {recursive: true, force: true});
  });

  describe('setupVSCodeTesting', () => {
    it('should create all necessary files when applied to a project', () => {
      const setup = setupVSCodeTesting(testDir);

      // Create the directory structure
      mkdirSync(join(testDir, 'src', 'test', 'suite'), {recursive: true});

      // Apply all templates
      setup.templates.forEach((template) => {
        const filePath = join(testDir, template.path);
        const dir = join(filePath, '..');

        if (!existsSync(dir)) {
          mkdirSync(dir, {recursive: true});
        }

        writeFileSync(filePath, template.content);
      });

      // Verify all files were created
      expect(existsSync(join(testDir, 'src/test/runTest.ts'))).toBe(true);
      expect(existsSync(join(testDir, 'src/test/suite/index.ts'))).toBe(true);
      expect(
        existsSync(join(testDir, 'src/test/suite/extension.test.ts')),
      ).toBe(true);
      expect(existsSync(join(testDir, '.vscode-test.mjs'))).toBe(true);
      expect(existsSync(join(testDir, 'tsconfig.spec.json'))).toBe(true);
    });

    it('should generate valid TypeScript files', () => {
      const setup = setupVSCodeTesting(testDir);

      setup.templates.forEach((template) => {
        if (template.path.endsWith('.ts')) {
          // Basic syntax validation - should not throw
          expect(() => {
            // Check for basic TypeScript syntax markers
            expect(template.content).toMatch(
              /import|export|function|const|let|var/,
            );
          }).not.toThrow();
        }
      });
    });

    it('should generate valid JSON configuration', () => {
      const setup = setupVSCodeTesting(testDir);
      const tsconfigTemplate = setup.templates.find(
        (t) => t.path === 'tsconfig.spec.json',
      );

      expect(() => {
        JSON.parse(tsconfigTemplate!.content);
      }).not.toThrow();
    });

    it('should include package.json script recommendations', () => {
      const setup = setupVSCodeTesting(testDir);

      expect(setup.scripts).toHaveProperty('compile-tests');
      expect(setup.scripts).toHaveProperty('test');
      expect(setup.scripts).toHaveProperty('pretest');
    });
  });

  describe('Config Generation with Real File System', () => {
    it('should create a working vscode-test configuration', () => {
      // Create a mock package.json
      const packageJson = {
        name: 'test-extension',
        version: '1.0.0',
        engines: {
          vscode: '^1.92.0',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      // Create a tsconfig.json
      const tsconfig = {
        compilerOptions: {
          target: 'ES2022',
          module: 'Node16',
          strict: true,
        },
      };

      writeFileSync(
        join(testDir, 'tsconfig.json'),
        JSON.stringify(tsconfig, null, 2),
      );

      // Setup VSCode testing
      const setup = setupVSCodeTesting(testDir);

      // Apply the tsconfig.spec.json
      const tsconfigSpec = setup.templates.find(
        (t) => t.path === 'tsconfig.spec.json',
      );
      writeFileSync(join(testDir, 'tsconfig.spec.json'), tsconfigSpec!.content);

      // Verify the generated config extends the base tsconfig
      const generatedConfig = JSON.parse(
        readFileSync(join(testDir, 'tsconfig.spec.json'), 'utf-8'),
      );

      expect(generatedConfig.extends).toBe('./tsconfig.json');
      expect(generatedConfig.compilerOptions.module).toBe('commonjs');
    });
  });

  describe('Template Content Validation', () => {
    it('should generate runTest.ts with correct imports', () => {
      const setup = setupVSCodeTesting(testDir);
      const runTest = setup.templates.find(
        (t) => t.path === 'src/test/runTest.ts',
      );

      expect(runTest?.content).toContain("import * as path from 'path'");
      expect(runTest?.content).toContain(
        "import { runTests } from '@vscode/test-electron'",
      );
      expect(runTest?.content).toContain('extensionDevelopmentPath');
      expect(runTest?.content).toContain('extensionTestsPath');
    });

    it('should generate test suite with Mocha configuration', () => {
      const setup = setupVSCodeTesting(testDir);
      const suite = setup.templates.find(
        (t) => t.path === 'src/test/suite/index.ts',
      );

      expect(suite?.content).toContain("import Mocha from 'mocha'");
      expect(suite?.content).toContain("ui: 'tdd'");
      expect(suite?.content).toContain('color: true');
      expect(suite?.content).toContain('timeout: 20000');
    });

    it('should generate sample test with VSCode imports', () => {
      const setup = setupVSCodeTesting(testDir);
      const test = setup.templates.find(
        (t) => t.path === 'src/test/suite/extension.test.ts',
      );

      expect(test?.content).toContain("import * as vscode from 'vscode'");
      expect(test?.content).toContain("suite('Extension Test Suite'");
      expect(test?.content).toContain("test('Sample test'");
    });
  });

  describe('Configuration Merging', () => {
    it('should properly merge custom config with defaults', () => {
      const customConfig = {
        testFiles: 'build/test/**/*.spec.js',
        mocha: {
          timeout: 30000,
          ui: 'bdd' as const,
        },
      };

      const config = defineVSCodeConfig(customConfig);

      // Custom values should override
      expect(config.files).toBe('build/test/**/*.spec.js');
      expect(config.mocha?.timeout).toBe(30000);
      expect(config.mocha?.ui).toBe('bdd');

      // Default values should remain
      expect(config.version).toBe('stable');
      expect(config.mocha?.reporter).toBe('spec');
    });
  });
});
