import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration for different server types
const SERVER_CONFIGS = {
  current: {
    port: 8765,
    startCommand: 'node',
    args: ['index.js'],
    cwd: path.resolve(__dirname, '../../server'),
    readyMessage: 'Claude Code UI server running',
    env: {
      PORT: '8765',
      NODE_ENV: 'test',
      LOG_LEVEL: 'error'
    }
  },
  refactored: {
    port: 8766,
    startCommand: 'pnpm',
    args: ['run', 'dev'],
    cwd: path.resolve(__dirname, '../../apps/backend'),
    readyMessage: 'Server running',
    env: {
      PORT: '8766',
      NODE_ENV: 'test',
      LOG_LEVEL: 'error'
    }
  }
};

// Global server process
let serverProcess = null;
let serverReady = false;

// Get server type from environment
const SERVER_TYPE = process.env.SERVER_TYPE || 'current';
const config = SERVER_CONFIGS[SERVER_TYPE];

// Base URL for tests
export const BASE_URL = `http://localhost:${config.port}`;
export const WS_URL = `ws://localhost:${config.port}`;

// Start server before all tests
export async function startTestServer() {
  if (serverProcess) return;

  console.log(`Starting ${SERVER_TYPE} server...`);
  console.log(`Working directory: ${config.cwd}`);
  
  // Check if directory exists
  if (!existsSync(config.cwd)) {
    throw new Error(`Server directory does not exist: ${config.cwd}`);
  }

  return new Promise((resolve, reject) => {
    serverProcess = spawn(config.startCommand, config.args, {
      cwd: config.cwd,
      env: { ...process.env, ...config.env },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${SERVER_TYPE}] ${output}`);
      
      if (output.includes(config.readyMessage) && !serverReady) {
        serverReady = true;
        console.log(`${SERVER_TYPE} server is ready`);
        // Give it a moment to fully initialize
        setTimeout(resolve, 1000);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[${SERVER_TYPE} ERROR] ${data.toString()}`);
    });

    serverProcess.on('error', (error) => {
      console.error(`Failed to start ${SERVER_TYPE} server:`, error);
      reject(error);
    });

    serverProcess.on('exit', (code) => {
      if (!serverReady) {
        reject(new Error(`Server exited with code ${code} before becoming ready`));
      }
    });

    // Timeout if server doesn't start
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error(`${SERVER_TYPE} server failed to start within 30 seconds`));
      }
    }, 30000);
  });
}

// Stop server after all tests
export async function stopTestServer() {
  if (!serverProcess) return;

  console.log(`Stopping ${SERVER_TYPE} server...`);
  
  return new Promise((resolve) => {
    serverProcess.on('exit', () => {
      console.log(`${SERVER_TYPE} server stopped`);
      serverProcess = null;
      serverReady = false;
      resolve();
    });

    // Try graceful shutdown first
    serverProcess.kill('SIGTERM');

    // Force kill after 5 seconds
    setTimeout(() => {
      if (serverProcess) {
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
  });
}

// Setup and teardown hooks
beforeAll(async () => {
  await startTestServer();
});

afterAll(async () => {
  await stopTestServer();
});

// Export test utilities
export { config, SERVER_TYPE };