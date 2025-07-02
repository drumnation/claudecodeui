/**
 * Global setup for Storybook tests
 * This file is automatically loaded before Storybook tests run
 */

import {beforeAll, afterEach, vi} from 'vitest';
import {setProjectAnnotations} from '@storybook/react';

// Apply global Storybook configuration
// Note: Consumers should provide their own Storybook preview config
// via setProjectAnnotations in their test setup if needed
const annotations = setProjectAnnotations([]);

// Setup DOM testing utilities
beforeAll(annotations.beforeAll);

// Mock console methods in tests to avoid noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: () => [],
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

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((cb) => {
  return setTimeout(() => cb(Date.now()), 0);
});

global.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
  return clearTimeout(id);
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();

  // Clear any mounted components
  document.body.innerHTML = '';
});

// Export test utilities
export * from '@storybook/test';
export {
  // Explicitly re-export to avoid conflicts
  render,
  screen,
  cleanup,
  act,
  renderHook,
  waitFor as waitForElement,
  waitForElementToBeRemoved,
  // Query exports
  queries,
  queryHelpers,
  getDefaultNormalizer,
  // Config exports
  getConfig,
  configure as configureTestingLibrary,
  // Types
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
export {userEvent} from '@testing-library/user-event';
