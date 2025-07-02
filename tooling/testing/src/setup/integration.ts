/**
 * Global setup for integration tests
 * This file is automatically loaded before integration tests run
 */

import {beforeAll, afterEach, afterAll, vi} from 'vitest';

// Set longer timeouts for integration tests
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
});

// Global test lifecycle hooks
beforeAll(async () => {
  // Set test environment variables
  process.env['NODE_ENV'] = 'test';
  process.env['INTEGRATION_TEST'] = 'true';

  // Setup test database connection if needed
  // await setupTestDatabase();

  // Start test servers if needed
  // await startTestServers();
});

afterEach(async () => {
  // Clear all mocks after each test
  vi.clearAllMocks();

  // Clean up test data
  // await cleanupTestData();

  // Reset any global state
  vi.resetModules();
});

afterAll(async () => {
  // Cleanup after all tests
  vi.restoreAllMocks();

  // Close database connections
  // await closeTestDatabase();

  // Stop test servers
  // await stopTestServers();
});

// Helper to wait for services to be ready
export async function waitForServices(timeout = 30000): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      // Check if services are ready
      // const response = await fetch('http://localhost:8080/health');
      // if (response.ok) return;
      return; // Remove this when implementing actual checks
    } catch {
      // Service not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Services did not become ready in time');
}
