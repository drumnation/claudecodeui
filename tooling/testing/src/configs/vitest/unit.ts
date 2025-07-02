/**
 * Unit test configuration
 * - Uses jsdom environment for DOM testing
 * - Fast execution with no isolation
 * - Coverage enabled with 85% thresholds
 */

import {mergeConfig} from 'vitest/config';
import baseConfig, {
  createTestSuiteConfig,
  includePatterns,
  excludePatterns,
} from './base';

export default mergeConfig(baseConfig, {
  test: {
    ...createTestSuiteConfig('unit', {
      environment: 'jsdom',
      timeout: 'fast',
      pool: 'fast', // No isolation for faster execution
      // setupFiles should be configured per-package if needed
      include: includePatterns.unit,
      exclude: excludePatterns.unit,
      coverage: {
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.spec.{ts,tsx}',
          'src/**/__tests__/**',
          'src/**/test/**',
        ],
      },
    }).test,
    // Mock configuration for unit tests
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
});
