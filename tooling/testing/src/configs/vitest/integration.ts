/**
 * Integration test configuration
 * - Uses Node environment
 * - Sequential execution with forks
 * - Extended timeouts for complex tests
 * - Coverage enabled with 85% thresholds
 */

import {mergeConfig} from 'vitest/config';
import baseConfig, {
  createTestSuiteConfig,
  includePatterns,
  excludePatterns,
} from './base';

export default mergeConfig(
  baseConfig,
  createTestSuiteConfig('integration', {
    environment: 'node',
    timeout: 'medium',
    pool: 'sequential',
    // setupFiles should be configured per-package if needed
    include: includePatterns.integration,
    exclude: excludePatterns.integration,
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.integration.test.{ts,tsx}',
        'src/**/*.integration.spec.{ts,tsx}',
        'src/**/integration/**',
      ],
    },
    env: {
      NODE_ENV: 'test',
      INTEGRATION_TEST: 'true',
    },
  }),
);
