import {mergeTests} from '@playwright/test';
import base from './playwright.base';

export default mergeTests(base, {
  testDir: '.',
  projects: [
    {
      name: 'chromium',
      testMatch: '**/*.browser.e2e.{ts,tsx}',
      use: {browserName: 'chromium', headless: true},
    },
    {
      name: 'firefox',
      testMatch: '**/*.browser.e2e.{ts,tsx}',
      use: {browserName: 'firefox', headless: true},
    },
    {
      name: 'webkit',
      testMatch: '**/*.browser.e2e.{ts,tsx}',
      use: {browserName: 'webkit', headless: true},
    },
  ],
});
