import {defineConfig as defineVSCodeTestConfig} from '@vscode/test-cli';
import type {UserConfig as VitestConfig} from 'vitest/config';
import {readFileSync, existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * VSCode Extension Test Configuration
 *
 * Provides a standardized testing setup for VSCode extensions using Mocha.
 * This configuration handles the special requirements of VSCode extension testing:
 * - CommonJS output for compatibility with VSCode's test runner
 * - Mocha test framework integration
 * - VSCode API mocking and test environment setup
 */

export interface VSCodeTestConfig {
  /**
   * Path to the compiled test files (default: out/test/[star][star]/[star].test.js)
   */
  testFiles?: string;

  /**
   * VSCode version to test against (default: 'stable')
   */
  vscodeVersion?: string;

  /**
   * Platform-specific VSCode executable path
   */
  vscodeExecutablePath?: string;

  /**
   * Extension development path (default: process.cwd())
   */
  extensionDevelopmentPath?: string;

  /**
   * Launch arguments for VSCode
   */
  launchArgs?: string[];

  /**
   * Environment variables for the test process
   */
  env?: Record<string, string>;

  /**
   * Mocha options
   */
  mocha?: {
    ui?: 'tdd' | 'bdd' | 'qunit' | 'exports';
    timeout?: number;
    reporter?: string;
    grep?: string;
  };
}

/**
 * Default VSCode test configuration
 */
export const defaultVSCodeTestConfig: Required<VSCodeTestConfig> = {
  testFiles: 'out/test/**/*.test.js',
  vscodeVersion: 'stable',
  vscodeExecutablePath: '',
  extensionDevelopmentPath: process.cwd(),
  launchArgs: ['--disable-extensions'],
  env: {},
  mocha: {
    ui: 'tdd' as const,
    timeout: 20000,
    reporter: 'spec',
    grep: '',
  },
};

/**
 * Creates a VSCode test configuration
 */
export function defineVSCodeConfig(config: VSCodeTestConfig = {}) {
  // Validate and sanitize inputs
  const validatedConfig: VSCodeTestConfig = {
    testFiles:
      typeof config.testFiles === 'string' ? config.testFiles : undefined,
    vscodeVersion:
      typeof config.vscodeVersion === 'string'
        ? config.vscodeVersion
        : undefined,
    vscodeExecutablePath:
      typeof config.vscodeExecutablePath === 'string'
        ? config.vscodeExecutablePath
        : undefined,
    extensionDevelopmentPath:
      typeof config.extensionDevelopmentPath === 'string'
        ? config.extensionDevelopmentPath
        : undefined,
    launchArgs: Array.isArray(config.launchArgs)
      ? config.launchArgs
      : undefined,
    env:
      config.env && typeof config.env === 'object' && !Array.isArray(config.env)
        ? config.env
        : undefined,
    mocha:
      config.mocha &&
      typeof config.mocha === 'object' &&
      !Array.isArray(config.mocha)
        ? config.mocha
        : undefined,
  };

  const mergedConfig = {
    ...defaultVSCodeTestConfig,
    ...validatedConfig,
    mocha: {
      ...defaultVSCodeTestConfig.mocha,
      ...(validatedConfig.mocha || {}),
    },
  };

  return defineVSCodeTestConfig({
    files: mergedConfig.testFiles || defaultVSCodeTestConfig.testFiles,
    version:
      mergedConfig.vscodeVersion || defaultVSCodeTestConfig.vscodeVersion,
    workspaceFolder:
      mergedConfig.extensionDevelopmentPath ||
      defaultVSCodeTestConfig.extensionDevelopmentPath,
    launchArgs: mergedConfig.launchArgs ?? defaultVSCodeTestConfig.launchArgs,
    env: mergedConfig.env ?? defaultVSCodeTestConfig.env,
    mocha: mergedConfig.mocha,
  });
}

/**
 * TypeScript configuration for VSCode extension tests
 */
export const vscodeTestTsConfig = {
  extends: './tsconfig.json',
  compilerOptions: {
    types: ['mocha', 'node', 'vscode'],
    module: 'commonjs' as const,
    target: 'ES2018' as const,
    sourceMap: true,
    outDir: './out/test',
    rootDir: './src',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
  },
  include: ['src/test/**/*.ts'],
  exclude: ['node_modules', 'out', 'dist'],
};

/**
 * Generate a tsconfig.spec.json for VSCode extension tests
 */
export function generateVSCodeTestTsConfig(baseConfigPath = './tsconfig.json') {
  return {
    ...vscodeTestTsConfig,
    extends: baseConfigPath || './tsconfig.json',
  };
}

/**
 * VSCode extension test runner template
 */
export const vscodeTestRunnerTemplate = `import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test script
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Download VS Code, unzip it and run the integration test
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
`;

/**
 * VSCode test suite loader template
 */
export const vscodeTestSuiteTemplate = `import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 20000
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return reject(err);
      }

      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run(failures => {
          if (failures > 0) {
            reject(new Error(\`\${failures} tests failed.\`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  });
}
`;

/**
 * Sample VSCode extension test template
 */
export const vscodeTestTemplate = `import * as assert from 'assert';
import * as vscode from 'vscode';
// import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});
`;

/**
 * Package.json scripts for VSCode extension testing
 */
export const vscodeTestScripts = {
  'compile-tests': 'tsc -p tsconfig.spec.json',
  pretest: 'pnpm run compile-tests && pnpm run compile && pnpm run lint',
  test: 'vscode-test',
  'test:unit': 'pnpm run compile-tests && vscode-test',
  'watch-tests': 'tsc -p tsconfig.spec.json -w',
};

/**
 * Helper to set up VSCode extension testing in a project
 */
export function setupVSCodeTesting(projectRoot: string) {
  const templates = [
    {
      path: 'src/test/runTest.ts',
      content: vscodeTestRunnerTemplate,
    },
    {
      path: 'src/test/suite/index.ts',
      content: vscodeTestSuiteTemplate,
    },
    {
      path: 'src/test/suite/extension.test.ts',
      content: vscodeTestTemplate,
    },
    {
      path: '.vscode-test.mjs',
      content: `import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'out/test/**/*.test.js',
});
`,
    },
    {
      path: 'tsconfig.spec.json',
      content: JSON.stringify(generateVSCodeTestTsConfig(), null, 2),
    },
  ];

  return {
    templates,
    dependencies: {
      '@types/mocha': '^10.0.6',
      '@types/node': '^22.5.0',
      '@types/vscode': '^1.92.0',
      '@vscode/test-cli': '^0.0.9',
      '@vscode/test-electron': '^2.4.0',
      mocha: '^10.6.1',
    },
    scripts: vscodeTestScripts,
  };
}
