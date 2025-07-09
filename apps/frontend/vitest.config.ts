import {defineConfig} from 'vitest/config';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import react from '@vitejs/plugin-react';
import macrosPlugin from 'vite-plugin-babel-macros';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  cacheDir: 'node_modules/.vitest-cache',
  plugins: [
    react({
      babel: {
        plugins: [
          [
            '@emotion/babel-plugin',
            {
              sourceMap: false, // Disable source maps in tests for performance
              autoLabel: 'never', // Disable auto-labeling in tests
              labelFormat: '[local]',
              cssPropOptimization: true,
            },
          ],
        ],
      },
    }),
    macrosPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    // Optimized timeouts for faster feedback
    testTimeout: 15000,
    hookTimeout: 5000,
    teardownTimeout: 5000,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        url: 'http://localhost:3000',
      },
    },
    // Performance optimizations
    maxConcurrency: 4,
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 2,
        isolate: true,
      },
    },
    // Skip slow tests in development
    slowTestThreshold: 3000,
    // Enable better mocking
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    // Disable CSS parsing in tests for speed
    css: false,
    // Optimize bundle size to prevent Babel deoptimization
    esbuild: {
      target: 'es2020',
      sourcemap: false,
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        '**/*.stories.{ts,tsx}',
        'src/test-setup.ts',
      ],
    },
    // Cache configuration for faster subsequent runs
    // Using Vite's cacheDir instead of deprecated cache.dir
    // Environment optimization
    logLevel: 'error',
    reporter: process.env.CI ? 'verbose' : 'default',
  },
});
