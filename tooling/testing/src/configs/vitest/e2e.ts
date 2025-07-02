/**
 * E2E test configuration
 * - Uses Node environment
 * - Sequential execution for stability
 * - Long timeouts for end-to-end scenarios
 * - Coverage can be enabled via environment variable
 */

import {mergeConfig} from 'vitest/config';
import baseConfig, {
  createTestSuiteConfig,
  includePatterns,
  excludePatterns,
} from './base';

const E2E_COVERAGE = process.env['E2E_COVERAGE'] === 'true';

export default mergeConfig(
  baseConfig,
  createTestSuiteConfig('e2e', {
    environment: 'node',
    timeout: 'slow',
    pool: 'sequential',
    // setupFiles should be configured per-package if needed
    include: includePatterns.e2e,
    exclude: excludePatterns.e2e,
    coverage: {
      enabled: E2E_COVERAGE, // Can override with E2E_COVERAGE=true
    },
    env: {
      NODE_ENV: 'test',
      E2E_TEST: 'true',
    },
    retry: process.env['CI'] ? 3 : 1, // More retries for flaky E2E tests
  }),
);
