import {mergeConfig} from 'vitest/config';

import baseConfig from './base';

export default mergeConfig(baseConfig, {
  test: {
    coverage: {
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**'],
      include: ['src/**/*.{ts,tsx}'],
    },
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.{ts,tsx}'],
    setupFiles: ['src/setup.ts'],
  },
});
