/**
 * Integration test configuration for Vitest
 * @packageDocumentation
 */

import {defineConfig} from 'vitest/config';
import {TestConfigOptions} from '../types';

/**
 * Configure integration tests
 * @param options test configuration options
 */
export default function integrationTestConfig(options?: TestConfigOptions) {
  return defineConfig({
    test: {
      environment: options?.environment || 'node',
      globals: true,
      include: [
        '**/testing/integration/**/*.test.ts',
        '**/*.integration.test.ts',
      ],
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
