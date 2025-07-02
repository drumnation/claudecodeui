import {mergeConfig} from 'vitest/config';
import {configs} from '@kit/testing';

// E2E tests for frontend app
const baseConfig = await configs.vitest.e2e();

export default mergeConfig(baseConfig, {
  test: {
    // Frontend-specific E2E test configuration
    globals: true,
  },
});
