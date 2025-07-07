// Global setup for backend tests
// This runs once before all tests start

export async function setup() {
  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent';
  
  // Prevent actual Claude CLI from running in tests
  process.env.CLAUDE_CLI_MOCK = 'true';
  
  console.log('🧪 Backend test environment initialized');
}

export async function teardown() {
  // Cleanup after all tests complete
  console.log('🧹 Backend test environment cleaned up');
}