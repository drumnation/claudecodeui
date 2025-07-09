import {defineConfig} from 'vitest/config';
import {resolve} from 'path';

export default defineConfig({
  test: {
    name: 'storybook-tests',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/storybook.setup.ts'],
    include: [
      'src/**/*.stories.test.{ts,tsx}',
      'src/**/*.storybook.test.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      'src/**/*.e2e.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage/storybook',
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.stories.{ts,tsx}',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.d.ts',
      ],
      exclude: [
        'node_modules',
        'dist',
        'build',
        'coverage',
        'src/test',
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    // Parallel execution for faster tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
});
