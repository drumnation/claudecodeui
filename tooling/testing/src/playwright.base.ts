import {defineConfig} from '@playwright/test';

export default defineConfig({
  reporter: [['html', {open: 'never'}], ['list']],
  outputDir: 'playwright-report',
  timeout: 60_000,
});
