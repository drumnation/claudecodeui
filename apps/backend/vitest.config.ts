import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Optimized timeouts for faster feedback
    testTimeout: 10000,
    hookTimeout: 5000,
    teardownTimeout: 5000,
    // Enable better isolation between tests
    isolate: true,
    // Add setup files
    setupFiles: ['./src/test-setup.ts'],
    // Configure mock cleanup
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    // Optimized pool configuration for performance
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true,
      },
    },
    // Performance optimizations
    maxConcurrency: 8,
    minThreads: 1,
    maxThreads: 4,
    // Skip slow tests in development
    slowTestThreshold: 5000,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/test-setup.ts',
      ],
    },
    // Cache configuration for faster subsequent runs
    cache: {
      dir: 'node_modules/.vitest',
    },
    // Environment optimization
    logLevel: 'error',
    reporter: process.env.CI ? 'verbose' : 'default',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});