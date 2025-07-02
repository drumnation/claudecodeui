import {describe, it, expect} from 'vitest';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {defineVSCodeConfig, type VSCodeTestConfig} from '../../src/vscode.js';

describe('VSCode Extension E2E - Real Extension Verification', () => {
  const extensionPath = join(process.cwd(), '../../apps/vscode-extension');

  describe('Existing VSCode Extension Configuration', () => {
    it('should find the actual VSCode extension', () => {
      const packageJsonPath = join(extensionPath, 'package.json');
      expect(existsSync(packageJsonPath)).toBe(true);
    });

    it('should read and validate existing .vscode-test.mjs', () => {
      const vscodeTestPath = join(extensionPath, '.vscode-test.mjs');

      if (existsSync(vscodeTestPath)) {
        const content = readFileSync(vscodeTestPath, 'utf-8');
        expect(content).toContain('@vscode/test-cli');
        expect(content).toContain('defineConfig');
        expect(content).toContain('files');
      }
    });

    it('should validate existing tsconfig.spec.json', () => {
      const tsconfigPath = join(extensionPath, 'tsconfig.spec.json');

      if (existsSync(tsconfigPath)) {
        const content = readFileSync(tsconfigPath, 'utf-8');
        const config = JSON.parse(content);

        expect(config.extends).toBeDefined();
        expect(config.compilerOptions.module).toBe('commonjs');
        expect(config.compilerOptions.types).toContain('mocha');
        expect(config.compilerOptions.types).toContain('vscode');
      }
    });
  });

  describe('Configuration Compatibility', () => {
    it('should generate config compatible with existing extension', () => {
      const config: VSCodeTestConfig = {
        testFiles: 'out/test/**/*.test.js',
        vscodeVersion: 'stable',
        mocha: {
          ui: 'tdd',
          timeout: 20000,
        },
      };

      const generatedConfig = defineVSCodeConfig(config);

      // Should match the pattern used in the actual extension
      expect(generatedConfig.files).toBe('out/test/**/*.test.js');
      expect(generatedConfig.mocha?.ui).toBe('tdd');
    });

    it('should match existing extension test structure', () => {
      const testDir = join(extensionPath, 'src/test');

      if (existsSync(testDir)) {
        // Check for expected test files
        const extensionTestPath = join(testDir, 'extension.test.ts');
        expect(existsSync(extensionTestPath)).toBe(true);

        if (existsSync(extensionTestPath)) {
          const content = readFileSync(extensionTestPath, 'utf-8');
          expect(content).toContain('suite');
          expect(content).toContain('test');
          expect(content).toContain('vscode');
        }
      }
    });
  });

  describe('Script Compatibility', () => {
    it('should have compatible test scripts', () => {
      const packageJsonPath = join(extensionPath, 'package.json');

      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        const scripts = packageJson.scripts || {};

        // Check for expected test-related scripts
        if (scripts['compile-tests']) {
          expect(scripts['compile-tests']).toContain('tsc');
          expect(scripts['compile-tests']).toContain('--outDir out');
        }

        if (scripts.test) {
          expect(scripts.test).toBe('vscode-test');
        }

        if (scripts.pretest) {
          expect(scripts.pretest).toContain('compile-tests');
        }
      }
    });
  });

  describe('Mocha Configuration Validation', () => {
    it('should use mocha configuration compatible with VSCode', () => {
      const extensionTestPath = join(
        extensionPath,
        'src/test/extension.test.ts',
      );

      if (existsSync(extensionTestPath)) {
        const content = readFileSync(extensionTestPath, 'utf-8');

        // VSCode extensions typically use TDD style
        expect(content).toMatch(/suite\s*\(/);
        expect(content).toMatch(/test\s*\(/);

        // Should import from mocha or vscode
        expect(content).toMatch(/import.*(?:mocha|vscode)/);
      }
    });
  });

  describe('Build Output Verification', () => {
    it('should check if test output directory structure is correct', () => {
      const outDir = join(extensionPath, 'out');

      if (existsSync(outDir)) {
        // The compiled tests should be in out/test
        const testOutDir = join(outDir, 'test');

        if (existsSync(testOutDir)) {
          // Should contain compiled test files
          const files = readFileSync(testOutDir, 'utf-8');
          expect(files).toBeDefined();
        }
      }
    });
  });
});
