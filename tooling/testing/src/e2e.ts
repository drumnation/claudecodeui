import {mergeConfig} from 'vitest/config';

import baseConfig from './base';

export default mergeConfig(baseConfig, {
  test: {
    coverage: {
      exclude: ['src/**/*.e2e.test.{ts,tsx}', 'src/**/__tests__/**'],
      include: ['src/**/*.{ts,tsx}'],
    },
    include: ['**/*.e2e.test.{ts,tsx}'],
    testTimeout: 60000,
  },
});
