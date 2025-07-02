/**
 * Coverage configuration presets
 * Reusable coverage settings for different test scenarios
 */

const COVERAGE_THRESHOLD = Number(process.env['COVERAGE_THRESHOLD']) || 85;

/**
 * Common exclude patterns
 */
export const excludePatterns = [
  // Build artifacts
  'coverage/**',
  'dist/**',
  '**/node_modules/**',
  '**/.{idea,git,cache,output,temp,turbo}/**',

  // Type definitions
  '**/*.d.ts',
  '**/*.d.mts',

  // Config files
  '**/*.config.*',
  '**/vitest.config.*',
  '**/vite.config.*',

  // Test files
  '**/__tests__/**',
  '**/*.test.{ts,tsx,js,jsx}',
  '**/*.spec.{ts,tsx,js,jsx}',
  '**/*.stories.{ts,tsx,js,jsx}',
  '**/*.story.{ts,tsx,js,jsx}',
  '**/test/**',
  '**/tests/**',

  // Setup files
  '**/setup.ts',
  '**/setup.js',

  // Linting configs
  '**/.{eslint,prettier}rc.*',
];

/**
 * Base coverage configuration
 */
export const base = {
  enabled: true,
  provider: 'v8' as const,
  reporter: ['text', 'json', 'html', 'lcov'],
  reportsDirectory: './coverage',
  include: ['src/**/*.{ts,tsx}'],
  exclude: excludePatterns,
  thresholds: {
    statements: COVERAGE_THRESHOLD,
    branches: COVERAGE_THRESHOLD,
    functions: COVERAGE_THRESHOLD,
    lines: COVERAGE_THRESHOLD,
    autoUpdate: process.env['CI'] ? false : true,
  },
};

/**
 * Strict coverage (90% thresholds)
 */
export const strict = {
  ...base,
  thresholds: {
    statements: 90,
    branches: 90,
    functions: 90,
    lines: 90,
    autoUpdate: false,
  },
};

/**
 * Relaxed coverage (70% thresholds)
 */
export const relaxed = {
  ...base,
  thresholds: {
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70,
    autoUpdate: true,
  },
};

/**
 * Coverage disabled
 */
export const disabled = {
  provider: 'v8' as const,
  enabled: false,
};

/**
 * Include patterns by test type
 */
export const includePatterns = {
  source: ['src/**/*.{ts,tsx}'],
  withStories: [
    'src/**/*.{ts,tsx}',
    'src/**/*.stories.{ts,tsx}',
    'src/**/*.story.{ts,tsx}',
  ],
  lib: ['lib/**/*.{ts,tsx}'],
  packages: ['packages/**/src/**/*.{ts,tsx}'],
};
