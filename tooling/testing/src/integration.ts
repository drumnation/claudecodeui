import {mergeConfig} from 'vitest/config';

import baseConfig from './base';

export default mergeConfig(baseConfig, {
  test: {
    coverage: {
      exclude: ['src/**/*.integration.test.{ts,tsx}', 'src/**/__tests__/**'],
      include: ['src/**/*.{ts,tsx}'],
    },
    include: ['**/*.integration.test.{ts,tsx}'],
    setupFiles: ['./jest.setup.ts'],
    testTimeout: 30000,
  },
});
