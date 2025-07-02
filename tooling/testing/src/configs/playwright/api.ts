/**
 * Playwright configuration for backend/API E2E tests
 * - No browser needed, focused on API testing
 * - Extends unified base configuration
 * - Optimized for backend service testing
 */

import {createPlaywrightConfig, webServerPresets} from './base';

export default createPlaywrightConfig('backend-api', {
  testDir: './tests/backend',
  testMatch: [
    '**/*.backend.test.ts',
    '**/*.backend.spec.ts',
    '**/*.api.test.ts',
    '**/*.api.spec.ts',
    '**/backend/**/*.test.ts',
    '**/backend/**/*.spec.ts',
  ],
  baseURL: process.env['API_BASE_URL'] || 'http://localhost:8080',
  projects: [
    {
      name: 'backend-api',
      use: {
        // Custom test attributes for backend
        testIdAttribute: 'data-test-id',
        // Extra HTTP headers for API testing
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  ],
  webServer: process.env['API_BASE_URL']
    ? undefined
    : webServerPresets.api(8080),
  use: {
    // Override trace collection for backend tests
    trace: process.env['CI'] ? 'retain-on-failure' : 'off',
  },
});
