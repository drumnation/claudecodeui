/**
 * E2E test configuration for Vitest
 * @packageDocumentation
 */

import {defineConfig} from 'vitest/config';
import {TestConfigOptions} from '../types';

/**
 * Configure E2E tests
 * @param options test configuration options
 */
export default function e2eTestConfig(options?: TestConfigOptions) {
  return defineConfig({
    test: {
      environment: options?.environment || 'node',
      globals: true,
      include: ['**/testing/e2e/**/*.test.ts', '**/*.e2e.test.ts'],
      coverage: options?.coverage
        ? {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/test/**'],
          }
        : undefined,
    },
  });
}
