/**
 * Playwright configuration for backend E2E tests (non-browser)
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
    // Backend tests don't need a browser
    headless: true,
  },
  projects: [
    {
      name: 'backend',
      use: {},
    },
  ],
  outputDir: join(process.cwd(), 'test-results-backend'),
});
