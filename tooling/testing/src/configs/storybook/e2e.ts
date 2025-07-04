/**
 * Configuration for Storybook E2E testing with Playwright
 * Full browser automation testing for Storybook stories
 */

import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './src/stories',
  testMatch: '**/*.e2e.{ts,tsx}',
  
  // Timeout for each test
  timeout: 30000,
  
  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 0,
  
  // Parallel execution
  workers: process.env.CI ? 2 : undefined,
  
  // Reporter configuration
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],
  
  use: {
    // Base URL for Storybook
    baseURL: process.env.STORYBOOK_URL || 'http://localhost:6006',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
  },
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Run Storybook before tests if not running
  webServer: {
    command: 'pnpm storybook',
    port: 6006,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
};

// Import devices for cross-browser testing
import { devices } from '@playwright/test';

export default config;