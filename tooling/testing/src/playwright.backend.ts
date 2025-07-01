import {mergeTests} from '@playwright/test';
import base from './playwright.base';

export default mergeTests(base, {
  testDir: '.',
  projects: [
    {name: 'node-backend', testMatch: '**/*.backend.e2e.{ts,tsx}', use: {}},
  ],
  timeout: 120_000,
});
