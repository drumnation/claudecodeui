/**
 * Storybook E2E test configuration for Playwright
 * - Tests stories in real browsers
 * - Visual regression and accessibility testing
 * - Extends unified base configuration
 */

import {
  createPlaywrightConfig,
  browserProjects,
  viewportPresets,
  webServerPresets,
} from './base';

const STORYBOOK_URL = process.env['STORYBOOK_URL'] || 'http://localhost:6006';

export default createPlaywrightConfig('storybook-e2e', {
  testDir: './tests/storybook-e2e',
  testMatch: [
    '**/*.story.e2e.test.ts',
    '**/*.stories.e2e.test.ts',
    '**/storybook-e2e/**/*.test.ts',
  ],
  baseURL: STORYBOOK_URL,
  projects: [
    browserProjects.chromium,
    browserProjects.firefox,
    browserProjects.webkit,
    browserProjects.mobile.chrome,
    browserProjects.mobile.safari,
  ],
  webServer: STORYBOOK_URL.includes('localhost')
    ? webServerPresets.storybook(6006)
    : undefined,
  use: {
    // Override viewport for consistent story screenshots
    viewport: viewportPresets.desktop,
  },
});
