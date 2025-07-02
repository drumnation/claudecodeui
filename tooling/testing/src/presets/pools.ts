/**
 * Test execution pool presets
 * Configure how tests run in parallel or sequentially
 */

import type {UserConfig} from 'vitest/config';

const CI = !!process.env['CI'];

// Type for pool configuration
type PoolConfig = Pick<NonNullable<UserConfig['test']>, 'pool' | 'poolOptions'>;

/**
 * Parallel execution with threads
 */
export const parallel: PoolConfig = {
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: false,
      isolate: true,
      maxThreads: CI ? 2 : undefined,
      minThreads: 1,
    },
  },
};

/**
 * Sequential execution with forks
 */
export const sequential: PoolConfig = {
  pool: 'forks',
  poolOptions: {
    forks: {
      singleFork: true,
      isolate: true,
    },
  },
};

/**
 * Fast parallel execution (no isolation)
 */
export const fast: PoolConfig = {
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: false,
      isolate: false, // No isolation for faster execution
    },
  },
};

/**
 * VM threads for better isolation
 */
export const vmThreads: PoolConfig = {
  pool: 'vmThreads',
  poolOptions: {
    vmThreads: {
      singleThread: false,
      isolate: true,
      maxThreads: CI ? 2 : undefined,
      minThreads: 1,
    },
  },
};

/**
 * Mock settings for different pool types
 */
export const mockSettings = {
  unit: {
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
  integration: {
    mockReset: true,
    clearMocks: false,
    restoreMocks: false,
  },
  e2e: {
    mockReset: false,
    clearMocks: false,
    restoreMocks: false,
  },
};

/**
 * Get pool configuration based on test type
 */
export function getPoolForTestType(
  type: 'unit' | 'integration' | 'e2e' | 'storybook',
) {
  switch (type) {
    case 'unit':
      return fast;
    case 'storybook':
      return parallel;
    case 'integration':
    case 'e2e':
      return sequential;
    default:
      return parallel;
  }
}
