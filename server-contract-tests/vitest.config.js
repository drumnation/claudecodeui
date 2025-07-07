import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./src/setup.js'],
    reporters: ['default', 'json'],
    outputFile: {
      json: `./results/${process.env.SERVER_TYPE || 'current'}-results.json`
    },
    coverage: {
      enabled: false
    }
  }
});