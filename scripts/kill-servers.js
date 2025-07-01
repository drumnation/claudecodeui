#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables to get ports
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=').trim();
      }
    }
  });
}

const PORTS = [
  process.env.PORT || 8765,
  process.env.VITE_PORT || 8766,
  8765, // Old backend port
  8766, // Old frontend port
  8767, // Alternative backend port
  8768, // Alternative backend port
  8769, // Alternative frontend port
  9000, // New frontend port
  9001  // New backend port
];

console.log('🛑 Killing Claude Code UI servers...\n');

// Kill processes on all possible ports
const killPromises = PORTS.map(port => {
  return new Promise((resolve) => {
    console.log(`🔪 Checking port ${port}...`);
    
    // First try lsof (macOS/Linux)
    exec(`lsof -ti:${port}`, (error, stdout) => {
      if (stdout && stdout.trim()) {
        const pids = stdout.trim().split('\n');
        console.log(`  Found process(es) on port ${port}: ${pids.join(', ')}`);
        
        exec(`kill -9 ${pids.join(' ')}`, (killError) => {
          if (!killError) {
            console.log(`  ✅ Killed process(es) on port ${port}`);
          } else {
            console.log(`  ⚠️  Failed to kill process on port ${port}`);
          }
          resolve();
        });
      } else {
        console.log(`  ✓ Port ${port} is free`);
        resolve();
      }
    });
  });
});

// Also kill any node processes related to the project
const killNodeProcesses = new Promise((resolve) => {
  console.log('\n🔍 Looking for related Node processes...');
  
  exec('ps aux | grep -E "node.*(claudecodeui|server/index.js|vite)" | grep -v grep', (error, stdout) => {
    if (stdout && stdout.trim()) {
      const lines = stdout.trim().split('\n');
      const pids = lines.map(line => line.split(/\s+/)[1]).filter(Boolean);
      
      if (pids.length > 0) {
        console.log(`  Found ${pids.length} related process(es)`);
        exec(`kill -9 ${pids.join(' ')}`, (killError) => {
          if (!killError) {
            console.log(`  ✅ Killed ${pids.length} Node process(es)`);
          }
          resolve();
        });
      } else {
        console.log('  ✓ No related Node processes found');
        resolve();
      }
    } else {
      console.log('  ✓ No related Node processes found');
      resolve();
    }
  });
});

// Execute all kill operations
Promise.all([...killPromises, killNodeProcesses]).then(() => {
  console.log('\n✅ All servers have been stopped!\n');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Error stopping servers:', error);
  process.exit(1);
});