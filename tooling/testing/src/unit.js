import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.{ts,tsx,js,jsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.turbo',
      '**/*.e2e.test.{ts,tsx,js,jsx}',
      '**/*.integration.test.{ts,tsx,js,jsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.{ts,tsx,js,jsx}'],
    },
  },
});
