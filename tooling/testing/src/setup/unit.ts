/**
 * Global setup for unit tests
 * This file is automatically loaded before unit tests run
 */

import {beforeAll, afterEach, afterAll, vi} from 'vitest';

// Mock console methods in tests to avoid noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Setup DOM testing utilities if in jsdom environment
if (typeof window !== 'undefined') {
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Global test lifecycle hooks
beforeAll(() => {
  // Set test environment variables
  process.env['NODE_ENV'] = 'test';
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();

  // Clear all timers
  vi.clearAllTimers();
});

afterAll(() => {
  // Cleanup after all tests
  vi.restoreAllMocks();
});

// Increase timeout for slow CI environments
if (process.env['CI']) {
  vi.setConfig({testTimeout: 10000});
}
