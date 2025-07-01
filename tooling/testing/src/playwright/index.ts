/**
 * Playwright test configuration for browser E2E tests
 * @packageDocumentation
 */

import {defineConfig} from '@playwright/test';
import {join} from 'path';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? 'html' : 'list',
  use: {
    baseURL: process.env['TEST_BASE_URL'] || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {browserName: 'chromium'},
    },
    {
      name: 'firefox',
      use: {browserName: 'firefox'},
    },
    {
      name: 'webkit',
      use: {browserName: 'webkit'},
    },
  ],
  outputDir: join(process.cwd(), 'test-results'),
});
