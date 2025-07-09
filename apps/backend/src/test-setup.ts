import { vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { createLogger } from '@kit/logger/node';

// Mock the logger globally for all tests
vi.mock('@kit/logger/node', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    isLevelEnabled: vi.fn().mockReturnValue(true),
    child: vi.fn().mockReturnThis(),
  })),
}));

// Performance optimization: setup test environment once
beforeAll(() => {
  // Configure global test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce logging in tests
});

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Restore all mocks after each test
  vi.restoreAllMocks();
  // Clear any timers
  vi.clearAllTimers();
});

afterAll(() => {
  // Clean up global test environment
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    isLevelEnabled: vi.fn().mockReturnValue(true),
    child: vi.fn().mockReturnThis(),
  }),
  
  createMockRequest: (overrides = {}) => ({
    query: {},
    params: {},
    body: {},
    headers: {},
    ...overrides,
  }),
  
  createMockResponse: () => {
    const res = {
      json: vi.fn(),
      status: vi.fn(),
      send: vi.fn(),
      end: vi.fn(),
    };
    res.status.mockReturnValue(res);
    return res;
  },
  
  createMockWebSocket: () => ({
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    emit: vi.fn(),
    readyState: 1, // WebSocket.OPEN
  }),
};

// Extend global types for TypeScript
declare global {
  var testUtils: {
    createMockLogger: () => any;
    createMockRequest: (overrides?: any) => any;
    createMockResponse: () => any;
    createMockWebSocket: () => any;
  };
}