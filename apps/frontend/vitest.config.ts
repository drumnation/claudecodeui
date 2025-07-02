import {mergeConfig, defineConfig} from 'vitest/config';
import {configs} from '@kit/testing';

// Frontend React app needs jsdom environment for unit tests
export default defineConfig(async () => {
  const baseConfig = await configs.vitest.unit();
  
  return mergeConfig(baseConfig, {
    test: {
      // Additional frontend-specific configuration if needed
      globals: true,
    },
  });
});
