/**
 * Unified base configuration for all Vitest test suites
 * Features:
 * - Coverage enabled by default with 85% thresholds
 * - Standardized reporters and cache settings
 * - Common exclude patterns
 * - Agentic validation hooks
 * - Performance optimizations
 */

import {defineConfig} from 'vitest/config';
import type {UserConfig} from 'vitest/config';
import * as presets from '../../presets/index';

// Environment detection
const CI = !!process.env['CI'];

// Re-export from presets for backward compatibility
export const baseCoverageConfig = {
  ...presets.coverage.base,
  exclude: presets.excludePatterns,
};

// Base test configuration
export const baseTestConfig: NonNullable<UserConfig['test']> = {
  // Cache configuration for faster subsequent runs
  cache: {
    dir: 'node_modules/.cache/vitest',
  },

  // Coverage with agentic validation
  coverage: baseCoverageConfig,

  // Reporters including our coverage multiplier
  reporters: presets.reporters.getReporters(),

  // Default test environment
  environment: 'node',

  // Files to exclude from test runs
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.{idea,git,cache,output,temp,turbo}/**',
    '**/coverage/**',
  ],

  // Global variables available in tests
  globals: true,

  // Don't pass if no tests found
  passWithNoTests: false,

  // Test timeout defaults
  testTimeout: CI ? 15000 : 10000,
  hookTimeout: CI ? 15000 : 10000,

  // Retry configuration
  retry: CI ? 2 : 0,

  // Pool configuration for parallel execution
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: false,
      maxThreads: CI ? 2 : undefined,
      minThreads: 1,
    },
  },

  // Type checking (disabled by default for performance)
  typecheck: {
    enabled: false,
    checker: 'tsc',
    tsconfig: './tsconfig.json',
  },

  // Output configuration
  outputFile: presets.reporters.outputFiles[CI ? 'ci' : 'local'],
};

// Re-export presets for convenience
export const timeoutPresets = presets.timeouts;
export const poolPresets = presets.pools;

// Include patterns for different test types
export const includePatterns = {
  unit: [
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
    '**/test/*.{ts,tsx}',
    '**/__tests__/*.{ts,tsx}',
  ],
  integration: [
    '**/*.integration.test.{ts,tsx}',
    '**/*.integration.spec.{ts,tsx}',
    '**/integration/**/*.test.{ts,tsx}',
    '**/integration/**/*.spec.{ts,tsx}',
  ],
  e2e: [
    '**/*.e2e.test.{ts,tsx}',
    '**/*.e2e.spec.{ts,tsx}',
    '**/e2e/**/*.test.{ts,tsx}',
    '**/e2e/**/*.spec.{ts,tsx}',
  ],
  storybook: [
    '**/*.stories.test.{ts,tsx}',
    '**/*.story.test.{ts,tsx}',
    '**/stories/**/*.test.{ts,tsx}',
    '**/__stories__/**/*.test.{ts,tsx}',
  ],
};

// Exclude patterns to add for specific test types
export const excludePatterns = {
  unit: [
    '**/*.integration.test.{ts,tsx}',
    '**/*.integration.spec.{ts,tsx}',
    '**/*.e2e.test.{ts,tsx}',
    '**/*.e2e.spec.{ts,tsx}',
    '**/integration/**',
    '**/e2e/**',
  ],
  integration: [
    '**/*.unit.test.{ts,tsx}',
    '**/*.unit.spec.{ts,tsx}',
    '**/*.e2e.test.{ts,tsx}',
    '**/*.e2e.spec.{ts,tsx}',
    '**/unit/**',
    '**/e2e/**',
  ],
  e2e: [
    '**/*.unit.test.{ts,tsx}',
    '**/*.unit.spec.{ts,tsx}',
    '**/*.integration.test.{ts,tsx}',
    '**/*.integration.spec.{ts,tsx}',
    '**/unit/**',
    '**/integration/**',
  ],
  storybook: [
    '**/*.unit.test.{ts,tsx}',
    '**/*.integration.test.{ts,tsx}',
    '**/*.e2e.test.{ts,tsx}',
  ],
};

// Export the base configuration
export default defineConfig({
  test: baseTestConfig,
});

// Helper to create test suite config
export function createTestSuiteConfig(
  name: string,
  options: {
    environment?: 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime';
    timeout?: 'fast' | 'medium' | 'slow' | 'ci';
    pool?: 'parallel' | 'sequential' | 'fast';
    setupFiles?: string | string[];
    include?: string[];
    exclude?: string[];
    coverage?: Partial<typeof baseCoverageConfig>;
    env?: Record<string, string>;
    retry?: number;
  } = {},
): UserConfig {
  return {
    test: {
      name,
      environment: options.environment,
      ...timeoutPresets[options.timeout || 'fast'],
      ...poolPresets[options.pool || 'parallel'],
      setupFiles: options.setupFiles,
      include: options.include,
      exclude: [...(baseTestConfig.exclude || []), ...(options.exclude || [])],
      coverage: {
        ...baseCoverageConfig,
        ...options.coverage,
      },
      env: options.env,
      retry: options.retry ?? baseTestConfig.retry,
    },
  };
}
