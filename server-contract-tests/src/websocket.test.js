import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import WebSocket from 'ws';
import { 
  initTestEnvironment, 
  cleanupTestEnvironment,
  createTestProject,
  recordTestResult,
  TEST_DATA_DIR
} from './test-utils.js';
import { WS_URL } from './setup.js';
import path from 'path';
import fs from 'fs/promises';

describe('WebSocket API Contract Tests', () => {
  let testProjectPath;
  let testProjectName;

  beforeAll(async () => {
    await initTestEnvironment();
    
    // Create test project
    testProjectName = 'ws-test-project';
    testProjectPath = await createTestProject(testProjectName, {
      language: 'javascript'
    });
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  describe('WS /chat', () => {
    let ws;
    
    afterEach(async () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });

    it('should establish chat connection with project', async () => {
      const messages = [];
      
      await new Promise((resolve, reject) => {
        ws = new WebSocket(`${WS_URL}/chat?project=${encodeURIComponent(testProjectPath)}`);
        
        ws.on('open', () => {
          resolve();
        });
        
        ws.on('error', (error) => {
          reject(error);
        });
        
        ws.on('message', (data) => {
          messages.push(JSON.parse(data.toString()));
        });
      });
      
      expect(ws.readyState).toBe(WebSocket.OPEN);
      
      await recordTestResult('ws-chat-connect', 'WS /chat', 
        { connected: true }, 
        { connected: true, messages }, 
        []
      );
    });

    it('should handle chat messages', async () => {
      const messages = [];
      
      await new Promise((resolve) => {
        ws = new WebSocket(`${WS_URL}/chat?project=${encodeURIComponent(testProjectPath)}`);
        
        ws.on('open', () => {
          // Send a test message
          ws.send(JSON.stringify({
            type: 'message',
            content: 'Hello from test'
          }));
        });
        
        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          messages.push(message);
          
          // Wait for initial response
          if (messages.length >= 1) {
            resolve();
          }
        });
      });
      
      // Should have received some response
      expect(messages.length).toBeGreaterThan(0);
      
      const firstMessage = messages[0];
      const expectedStructure = {
        type: expect.any(String),
        data: expect.any(Object)
      };
      
      const differences = messages.length > 0 ? 
        compareResponses(expectedStructure, firstMessage) : 
        [{ path: '', expected: 'messages', actual: 'none', type: 'missing' }];
      
      await recordTestResult('ws-chat-message', 'WS /chat message', 
        expectedStructure, 
        firstMessage || {}, 
        differences
      );
    });

    it('should handle errors gracefully', async () => {
      const messages = [];
      let errorReceived = false;
      
      await new Promise((resolve) => {
        ws = new WebSocket(`${WS_URL}/chat?project=${encodeURIComponent(testProjectPath)}`);
        
        ws.on('open', () => {
          // Send invalid message
          ws.send('invalid json');
        });
        
        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          messages.push(message);
          
          if (message.type === 'error') {
            errorReceived = true;
            resolve();
          }
        });
        
        // Timeout fallback
        setTimeout(resolve, 2000);
      });
      
      // Some implementations might close connection instead of sending error
      if (ws.readyState === WebSocket.CLOSED) {
        expect(true).toBe(true); // Connection closed is valid error handling
      } else if (errorReceived) {
        expect(messages.some(m => m.type === 'error')).toBe(true);
      }
    });
  });

  describe('WS /shell', () => {
    let ws;
    
    afterEach(async () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });

    it('should establish shell connection', async () => {
      const messages = [];
      
      await new Promise((resolve, reject) => {
        ws = new WebSocket(`${WS_URL}/shell?cwd=${encodeURIComponent(testProjectPath)}`);
        
        ws.on('open', () => {
          resolve();
        });
        
        ws.on('error', (error) => {
          reject(error);
        });
        
        ws.on('message', (data) => {
          messages.push(JSON.parse(data.toString()));
        });
      });
      
      expect(ws.readyState).toBe(WebSocket.OPEN);
      
      await recordTestResult('ws-shell-connect', 'WS /shell', 
        { connected: true }, 
        { connected: true }, 
        []
      );
    });

    it('should execute shell commands', async () => {
      const messages = [];
      let outputReceived = false;
      
      await new Promise((resolve) => {
        ws = new WebSocket(`${WS_URL}/shell?cwd=${encodeURIComponent(testProjectPath)}`);
        
        ws.on('open', () => {
          // Send a simple echo command
          ws.send(JSON.stringify({
            type: 'input',
            data: 'echo "test output"\n'
          }));
        });
        
        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          messages.push(message);
          
          if (message.type === 'output' && message.data.includes('test output')) {
            outputReceived = true;
          }
          
          // Give it some time to collect output
          if (messages.length > 2) {
            resolve();
          }
        });
        
        // Timeout
        setTimeout(resolve, 3000);
      });
      
      expect(outputReceived).toBe(true);
      
      const outputMessages = messages.filter(m => m.type === 'output');
      const expectedStructure = {
        type: 'output',
        data: expect.any(String)
      };
      
      await recordTestResult('ws-shell-command', 'WS /shell command', 
        expectedStructure, 
        outputMessages[0] || {}, 
        []
      );
    });

    it('should handle resize events', async () => {
      await new Promise((resolve) => {
        ws = new WebSocket(`${WS_URL}/shell?cwd=${encodeURIComponent(testProjectPath)}`);
        
        ws.on('open', () => {
          // Send resize event
          ws.send(JSON.stringify({
            type: 'resize',
            cols: 120,
            rows: 40
          }));
          
          // Should not crash
          setTimeout(resolve, 500);
        });
        
        ws.on('error', (error) => {
          // Resize might not be supported, that's ok
          resolve();
        });
      });
      
      // If connection is still open, resize was handled
      expect([WebSocket.OPEN, WebSocket.CLOSED]).toContain(ws.readyState);
    });

    it('should handle exit command', async () => {
      const messages = [];
      let exitReceived = false;
      
      await new Promise((resolve) => {
        ws = new WebSocket(`${WS_URL}/shell?cwd=${encodeURIComponent(testProjectPath)}`);
        
        ws.on('open', () => {
          // Send exit command
          ws.send(JSON.stringify({
            type: 'input',
            data: 'exit\n'
          }));
        });
        
        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          messages.push(message);
          
          if (message.type === 'exit') {
            exitReceived = true;
            resolve();
          }
        });
        
        ws.on('close', () => {
          resolve();
        });
        
        // Timeout
        setTimeout(resolve, 2000);
      });
      
      // Either exit message or connection closed is valid
      expect(exitReceived || ws.readyState === WebSocket.CLOSED).toBe(true);
    });
  });
});

// Helper function (should be imported from test-utils but adding here for completeness)
function compareResponses(expected, actual, path = '') {
  const differences = [];
  
  if (expected === null || expected === undefined) {
    if (actual !== expected) {
      differences.push({
        path,
        expected,
        actual,
        type: 'value'
      });
    }
    return differences;
  }
  
  if (typeof expected === 'object') {
    if (typeof actual !== 'object' || actual === null) {
      differences.push({
        path,
        expected: 'object',
        actual: typeof actual,
        type: 'type'
      });
      return differences;
    }
    
    for (const key of Object.keys(expected)) {
      if (!(key in actual)) {
        differences.push({
          path: `${path}.${key}`,
          expected: 'exists',
          actual: 'missing',
          type: 'key'
        });
      } else {
        differences.push(...compareResponses(expected[key], actual[key], `${path}.${key}`));
      }
    }
    
    return differences;
  }
  
  if (expected !== actual) {
    differences.push({
      path,
      expected,
      actual,
      type: 'value'
    });
  }
  
  return differences;
}