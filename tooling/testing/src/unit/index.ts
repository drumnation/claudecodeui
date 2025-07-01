/**
 * Unit test configuration for Vitest
 * @packageDocumentation
 */

import {defineConfig} from 'vitest/config';
import {TestConfigOptions} from '../types';

/**
 * Configure unit tests
 * @param options test configuration options
 */
export default function unitTestConfig(options?: TestConfigOptions) {
  return defineConfig({
    test: {
      environment: options?.environment || 'jsdom',
      globals: true,
      setupFiles: ['./setup.ts'],
      include: ['**/*.unit.test.ts', '**/*.unit.test.tsx'],
      coverage: options?.coverage
        ? {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/test/**'],
          }
        : undefined,
      testTimeout: options?.timeout || 10000,
    },
  });
}
