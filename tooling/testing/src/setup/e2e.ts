/**
 * Global setup for E2E tests
 * This file is automatically loaded before E2E tests run
 */

import {beforeAll, afterEach, afterAll, vi} from 'vitest';

// Set longer timeouts for E2E tests
vi.setConfig({
  testTimeout: 60000,
  hookTimeout: 60000,
});

// Global test lifecycle hooks
beforeAll(async () => {
  // Set test environment variables
  process.env['NODE_ENV'] = 'test';
  process.env['E2E_TEST'] = 'true';

  // Wait for application to be ready
  await waitForApplication();
});

afterEach(async () => {
  // Clear application state between tests
  // await resetApplicationState();
  // Clear browser storage if testing web app
  // await clearBrowserStorage();
  // Take screenshot on failure
  // if (testFailed) await takeScreenshot();
});

afterAll(async () => {
  // Cleanup after all tests
  // await cleanupTestEnvironment();
});

// Helper to wait for application to be ready
async function waitForApplication(timeout = 60000): Promise<void> {
  const start = Date.now();
  const baseUrl = process.env['TEST_BASE_URL'] || 'http://localhost:3000';

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // Application not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('Application did not become ready in time');
}

// Export utilities for E2E tests
export {waitForApplication};
