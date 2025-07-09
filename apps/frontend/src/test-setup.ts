import '@testing-library/jest-dom/vitest';
import {afterEach, beforeEach, beforeAll, afterAll, vi} from 'vitest';
import {cleanup, configure} from '@testing-library/react';
import React from 'react';

// Configure React Testing Library with performance optimizations
configure({
  testIdAttribute: 'data-testid',
  // Disable throw on multiple elements for performance
  throwSuggestions: false,
  // Reduce error verbosity
  getElementError: (message, _container) => {
    const error = new Error(message || 'Element not found');
    error.name = 'TestingLibraryElementError';
    error.stack = undefined;
    return error;
  },
});

// Mock the logger context
vi.mock('@kit/logger/react', () => ({
  useLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
  LoggerProvider: ({children}: {children: React.ReactNode}) => children,
}));

// Performance optimization: setup global mocks once
beforeAll(() => {
  // Mock window.matchMedia
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

  // Mock ResizeObserver with proper constructor
  const ResizeObserverMock = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  global.ResizeObserver = ResizeObserverMock;
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock Clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    writable: true,
  });
});

// Lightweight per-test setup
beforeEach(() => {
  // Ensure document.body exists and is properly set up
  if (!document.body) {
    document.body = document.createElement('body');
    document.documentElement.appendChild(document.body);
  }

  // Clear any existing containers
  document.body.innerHTML = '';

  // Create a root element for React Testing Library
  const root = document.createElement('div');
  root.id = 'vitest-root';
  document.body.appendChild(root);

  // Ensure the root element is properly set up for React Testing Library
  // Don't reassign read-only properties, they're already correctly set up

  // Fast DOM cleanup and setup
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  cleanup();
  // Clear the DOM
  if (document.body) {
    document.body.innerHTML = '';
  }
});

// Global cleanup
afterAll(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});