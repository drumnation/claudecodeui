/**
 * Timeout configuration presets
 * Reusable timeout settings for different test scenarios
 */

const CI = !!process.env['CI'];

/**
 * Fast tests (unit tests, component tests)
 */
export const fast = {
  testTimeout: 10000,
  hookTimeout: 10000,
};

/**
 * Medium tests (integration tests)
 */
export const medium = {
  testTimeout: 30000,
  hookTimeout: 30000,
};

/**
 * Slow tests (E2E tests)
 */
export const slow = {
  testTimeout: 60000,
  hookTimeout: 60000,
};

/**
 * CI-optimized timeouts
 */
export const ci = {
  testTimeout: CI ? 20000 : 15000,
  hookTimeout: CI ? 20000 : 15000,
};

/**
 * Playwright timeout presets
 */
export const playwright = {
  default: {
    timeout: 30 * 1000,
    expect: {
      timeout: 5 * 1000,
    },
  },
  slow: {
    timeout: 60 * 1000,
    expect: {
      timeout: 10 * 1000,
    },
  },
  fast: {
    timeout: 15 * 1000,
    expect: {
      timeout: 3 * 1000,
    },
  },
  action: {
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },
};

/**
 * Get timeout based on test type
 */
export function getTimeoutForTestType(
  type: 'unit' | 'integration' | 'e2e' | 'storybook',
) {
  switch (type) {
    case 'unit':
    case 'storybook':
      return fast;
    case 'integration':
      return medium;
    case 'e2e':
      return slow;
    default:
      return ci;
  }
}
