import {defineConfig, devices} from '@playwright/test';

/**
 * Playwright configuration for Storybook E2E tests
 * Optimized for fast, parallel execution with comprehensive coverage
 */
export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.test.ts',

  // Parallel execution
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,

  // Timeouts
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  // Retry configuration
  retries: process.env.CI ? 2 : 1,

  // Reporter configuration
  reporter: [
    ['html', {outputFolder: 'test-results/playwright-html-report'}],
    ['json', {outputFile: 'test-results/playwright-results.json'}],
    ['junit', {outputFile: 'test-results/playwright-junit.xml'}],
    ['line'],
  ],

  // Global test configuration
  use: {
    // Base URL for Storybook
    baseURL: 'http://localhost:6006',

    // Browser options
    headless: process.env.CI ? true : false,

    // Viewport
    viewport: {width: 1280, height: 720},

    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Reduce flakiness
    actionTimeout: 10000,
    navigationTimeout: 15000,

    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
  },

  // Output directory
  outputDir: './test-results/playwright-output',

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
    },
    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
    },
    {
      name: 'mobile-chrome',
      use: {...devices['Pixel 5']},
    },
    {
      name: 'mobile-safari',
      use: {...devices['iPhone 12']},
    },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Global setup and teardown
  globalSetup: require.resolve('./src/test/global-setup.ts'),
  globalTeardown: require.resolve('./src/test/global-teardown.ts'),
});
