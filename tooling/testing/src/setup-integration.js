// This file is used to configure the integration test environment
// It can include database connections, mock services, etc.

// Example of setting up a test env variable
process.env.NODE_ENV = 'test';

// Clean up on completion
afterAll(async () => {
  // Clean up resources
});
