import {mergeConfig} from 'vitest/config';
import {configs} from '@kit/testing';

// Integration tests for frontend app
const baseConfig = await configs.vitest.integration();

export default mergeConfig(baseConfig, {
  test: {
    // Frontend-specific integration test configuration
    globals: true,
  },
});
