import {beforeAll, afterEach, beforeEach, vi} from 'vitest';
import {cleanup} from '@testing-library/react';
import '@testing-library/jest-dom';
import {server} from './mocks/server';

// Mock window.matchMedia for theme detection
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

// Mock ResizeObserver for layout components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver for scroll-based components
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scrollTo for scroll-based functionality
global.scrollTo = vi.fn();

// Mock localStorage for theme persistence
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock WebSocket for testing
(global as any).WebSocket = vi.fn().mockImplementation(() => ({
  readyState: 1,
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})) as any;

// Mock console methods in tests to reduce noise
beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Start MSW server
  server.listen({onUnhandledRequest: 'warn'});
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();

  // Reset localStorage
  localStorage.clear();

  // Reset window.location
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:6006',
      origin: 'http://localhost:6006',
      pathname: '/',
      search: '',
      hash: '',
    },
    writable: true,
  });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up MSW server
beforeAll(() => {
  return () => {
    server.close();
  };
});

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock Storybook globals
(globalThis as any).__STORYBOOK_ADDONS_MANAGER__ = {
  getChannel: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
};

// Mock performance API for performance testing
global.performance = {
  ...global.performance,
  getEntriesByType: vi.fn(() => []),
  mark: vi.fn(),
  measure: vi.fn(),
};

// Mock canvas context for chart components
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({width: 0})),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})) as any;

// Mock URL for file handling
(global as any).URL = {
  ...global.URL,
  createObjectURL: vi.fn(),
  revokeObjectURL: vi.fn(),
} as any;

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    ...global.crypto,
    randomUUID: vi.fn(() => 'mock-uuid'),
  },
  writable: true,
});

// Enhanced console assertions for better test output
const originalError = console.error;
console.error = (...args) => {
  // Filter out React warnings in tests
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
    return;
  }
  originalError.call(console, ...args);
};
