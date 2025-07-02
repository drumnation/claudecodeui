import {mergeConfig} from 'vitest/config';
import {configs} from '@kit/testing';

// Frontend React app needs jsdom environment for unit tests
const baseConfig = await configs.vitest.unit();

export default mergeConfig(baseConfig, {
  test: {
    // Additional frontend-specific configuration if needed
    globals: true,
  },
});
