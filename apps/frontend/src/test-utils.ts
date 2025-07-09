import { vi } from 'vitest';

// Comprehensive mock utilities for better test performance
export const createMockResizeObserver = () => {
  const mockObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  
  // Ensure proper constructor behavior
  Object.defineProperty(mockObserver, 'prototype', {
    value: {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    },
  });
  
  return mockObserver;
};

export const createMockIntersectionObserver = () => {
  return vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
};

export const createMockMatchMedia = () => {
  return vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

export const setupGlobalMocks = () => {
  // Mock ResizeObserver
  global.ResizeObserver = createMockResizeObserver();
  
  // Mock IntersectionObserver
  global.IntersectionObserver = createMockIntersectionObserver();
  
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: createMockMatchMedia(),
  });
  
  // Mock Clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    writable: true,
  });
  
  // Mock performance APIs
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn().mockReturnValue(Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
    },
    writable: true,
  });
};

// Fast DOM utilities
export const createTestContainer = () => {
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
  return container;
};

export const cleanupTestContainer = () => {
  const container = document.getElementById('test-container');
  if (container) {
    container.remove();
  }
};

// Performance tracking utilities
export const measureTestPerformance = (testName: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`Test "${testName}" took ${end - start}ms`);
};