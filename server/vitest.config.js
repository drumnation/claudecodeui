import { defineConfig } from 'vitest/config';

// Backend-specific Vitest configuration
export default defineConfig({
  test: {
    // Node.js environment for backend testing
    environment: 'node',
    
    // Backend-specific test directory
    include: ['server/__tests__/**/*.{test,spec}.{js,ts}'],
    
    // Server environment variables for testing
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      PORT: '8765',
      TEST_MODE: 'true'
    },
    
    // Global setup for backend tests
    globalSetup: ['./server/__tests__/setup/global.js'],
    
    // Setup files for each test
    setupFiles: ['./server/__tests__/setup/backend.js'],
    
    // Coverage configuration for backend
    coverage: {
      provider: 'v8',
      include: ['server/**/*.js'],
      exclude: [
        'server/__tests__/**',
        'server/node_modules/**',
        'server/**/*.config.js',
        'server/**/*.test.js'
      ],
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/backend',
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    },
    
    // Backend tests need longer timeouts for process spawning
    testTimeout: 30000,
    
    // Disable parallel execution for server tests to avoid port conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  }
});