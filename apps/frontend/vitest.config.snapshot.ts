import { mergeConfig } from 'vitest/config';
import { configs } from '@kit/testing';

// Load unit test config as base
const baseConfig = await configs.vitest.unit();

// Extend for snapshot testing
export default mergeConfig(baseConfig, {
  test: {
    // Snapshot-specific settings
    snapshotFormat: {
      printBasicPrototype: false,
      escapeString: false,
    },
    resolveSnapshotPath: (testPath, snapshotExtension) =>
      testPath.replace('src/', 'src/__snapshots__/') + snapshotExtension,
  },
});