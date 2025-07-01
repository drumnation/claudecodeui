import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', {open: 'never'}], ['list']],
  use: {
    actionTimeout: 0,
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
  outputDir: 'test-results',
  webServer: process.env.CI
    ? {
        command: 'pnpm build && pnpm preview',
        port: 3000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
