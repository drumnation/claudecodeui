// Setup that runs before each test file
import { vi, afterEach } from 'vitest';

// Mock child_process to prevent actual Claude CLI spawning
vi.mock('child_process', () => ({
  spawn: vi.fn(),
  exec: vi.fn()
}));

// Mock file system operations that could interfere with tests
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    // Keep most fs functions real, but can mock specific ones if needed
    promises: {
      ...actual.promises,
      // Can add specific mocks here if needed
    }
  };
});

// Mock WebSocket to prevent actual server startup
vi.mock('ws', () => ({
  WebSocketServer: vi.fn(() => ({
    on: vi.fn(),
    close: vi.fn(),
    clients: new Set()
  }))
}));

// Setup test utilities
global.testUtils = {
  // Helper to create mock WebSocket client
  createMockWebSocket: () => ({
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    readyState: 1 // OPEN
  }),
  
  // Helper to create mock Claude CLI response
  createMockClaudeResponse: (type = 'assistant', content = 'test response') => ({
    type,
    message: {
      id: `test-${Date.now()}`,
      role: 'assistant',
      content: [{ type: 'text', text: content }]
    },
    session_id: 'test-session-123'
  })
};

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});