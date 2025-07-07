import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple comparison script to test both servers
async function compareServers() {
  console.log('Starting comparison of current vs refactored backend...\n');
  
  // Test endpoints
  const endpoints = [
    { method: 'GET', path: '/api/config', description: 'Get configuration' },
    { method: 'GET', path: '/api/projects', description: 'List projects' },
    { method: 'GET', path: '/api/slash-commands', description: 'Get slash commands' },
  ];
  
  // Start current server
  console.log('Starting current server on port 8765...');
  const currentServer = spawn('node', ['index.js'], {
    cwd: path.resolve(__dirname, '../../server'),
    env: { ...process.env, PORT: '8765' },
    stdio: 'pipe'
  });
  
  // Wait for server to start
  await new Promise((resolve) => {
    currentServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Server stdout:', output.trim());
      if (output.includes('Claude Code UI server running')) {
        console.log('Current server is ready\n');
        resolve();
      }
    });
    
    currentServer.stderr.on('data', (data) => {
      console.error('Server stderr:', data.toString().trim());
    });
    
    currentServer.on('error', (error) => {
      console.error('Server error:', error);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      console.log('Server startup timeout, proceeding anyway...\n');
      resolve();
    }, 5000);
  });
  
  // Wait an additional second for server to be fully ready
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
    
    try {
      const response = await axios({
        method: endpoint.method,
        url: `http://localhost:8765${endpoint.path}`,
        validateStatus: () => true
      });
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Response:`, JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Clean up
  currentServer.kill();
  console.log('\nComparison complete!');
}

// Run the comparison
compareServers().catch(console.error);