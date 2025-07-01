import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.e2e.test.{ts,tsx,js,jsx}'],
    exclude: ['node_modules', 'dist', '.turbo'],
    timeout: 30000, // E2E tests might take longer
  },
});
