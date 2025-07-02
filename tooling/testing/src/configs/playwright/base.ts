/**
 * Unified base configuration for all Playwright test suites
 * Features:
 * - Standardized timeouts and retries
 * - Consistent artifact collection
 * - Shared reporter configuration
 * - Coverage integration support
 */

import {defineConfig, devices, PlaywrightTestConfig} from '@playwright/test';
import {join} from 'node:path';

// Environment detection
const CI = !!process.env['CI'];

// Base Playwright configuration
export const basePlaywrightConfig: PlaywrightTestConfig = {
  // Test execution settings
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,

  // Timeouts
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },

  // Reporter configuration
  reporter: CI
    ? [
        ['json', {outputFile: 'test-results/playwright-results.json'}],
        ['html', {outputFolder: 'playwright-report', open: 'never'}],
        ['github'],
      ]
    : [['list'], ['html', {open: 'never'}]],

  // Shared settings for all projects
  use: {
    // Artifact collection
    trace: CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: CI ? 'retain-on-failure' : 'off',

    // Browser settings
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,

    // Accept downloads
    acceptDownloads: true,

    // Viewport
    viewport: {width: 1280, height: 720},

    // Locale settings
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // Color scheme
    colorScheme: 'light',

    // Permissions
    permissions: [],

    // Offline mode
    offline: false,

    // HTTP credentials
    httpCredentials: undefined,

    // Ignore HTTPS errors
    ignoreHTTPSErrors: false,

    // Extra HTTP headers
    extraHTTPHeaders: {},
  },

  // Output directory for test artifacts
  outputDir: 'test-results',

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Maximum time for the whole test run
  globalTimeout: CI ? 30 * 60 * 1000 : undefined, // 30 minutes in CI

  // Grep patterns
  grep: undefined,
  grepInvert: undefined,

  // Maximum failures
  maxFailures: CI ? 10 : undefined,

  // Preserve output
  preserveOutput: 'failures-only',

  // Quiet mode
  quiet: false,

  // Update snapshots
  updateSnapshots: 'missing',
};

// Browser configurations
export const browserProjects = {
  chromium: {
    name: 'chromium',
    use: {...devices['Desktop Chrome']},
  },
  firefox: {
    name: 'firefox',
    use: {...devices['Desktop Firefox']},
  },
  webkit: {
    name: 'webkit',
    use: {...devices['Desktop Safari']},
  },
  mobile: {
    chrome: {
      name: 'mobile-chrome',
      use: {...devices['Pixel 5']},
    },
    safari: {
      name: 'mobile-safari',
      use: {...devices['iPhone 13']},
    },
  },
};

// Viewport presets
export const viewportPresets = {
  desktop: {width: 1280, height: 720},
  laptop: {width: 1366, height: 768},
  tablet: {width: 768, height: 1024},
  mobile: {width: 375, height: 667},
  mobileWide: {width: 414, height: 896},
};

// Web server configurations
export const webServerPresets = {
  dev: (port: number = 3000) => ({
    command: 'npm run dev',
    port,
    reuseExistingServer: !CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
    },
  }),
  storybook: (port: number = 6006) => ({
    command: 'npm run storybook',
    port,
    reuseExistingServer: !CI,
    timeout: 120 * 1000,
  }),
  api: (port: number = 8080) => ({
    command: 'npm run server:dev',
    port,
    reuseExistingServer: !CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
    },
  }),
};

// Helper to create Playwright config for different test types
export function createPlaywrightConfig(
  name: string,
  options: {
    testDir?: string;
    testMatch?: string | RegExp | (string | RegExp)[];
    baseURL?: string;
    projects?: PlaywrightTestConfig['projects'];
    webServer?: PlaywrightTestConfig['webServer'];
    use?: PlaywrightTestConfig['use'];
    timeout?: number;
    outputDir?: string;
  } = {},
): PlaywrightTestConfig {
  return defineConfig({
    ...basePlaywrightConfig,
    testDir: options.testDir || './tests',
    testMatch: options.testMatch,
    use: {
      ...basePlaywrightConfig.use,
      baseURL: options.baseURL || 'http://localhost:3000',
      ...options.use,
    },
    projects: options.projects || [
      browserProjects.chromium,
      browserProjects.firefox,
      browserProjects.webkit,
    ],
    webServer: options.webServer,
    timeout: options.timeout || basePlaywrightConfig.timeout,
    outputDir: options.outputDir || join(process.cwd(), `test-results-${name}`),
  });
}

// Coverage collection utilities for Playwright
export const coverageUtils = {
  async startCSSCoverage(page: any) {
    await page.coverage.startCSSCoverage();
  },

  async startJSCoverage(page: any) {
    await page.coverage.startJSCoverage();
  },

  async stopCSSCoverage(page: any) {
    return await page.coverage.stopCSSCoverage();
  },

  async stopJSCoverage(page: any) {
    return await page.coverage.stopJSCoverage();
  },

  // Merge coverage data into NYC format
  async mergeCoverage(coverage: any[], outputPath: string) {
    // Implementation would use playwright-coverage or similar
    console.log(`Coverage data would be saved to: ${outputPath}`);
  },
};

// Default export for consistency with other config files
export default basePlaywrightConfig;
