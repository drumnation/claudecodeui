const { exec } = require('child_process');
const http = require('http');

const NGROK_API_URL = 'http://localhost:4040/api/tunnels';
const MAX_RETRIES = 10;
const RETRY_DELAY = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getNgrokUrl() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await new Promise((resolve, reject) => {
        http.get(NGROK_API_URL, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });
      
      const tunnels = JSON.parse(response);
      if (tunnels.tunnels && tunnels.tunnels.length > 0) {
        const tunnel = tunnels.tunnels.find(t => t.proto === 'https') || tunnels.tunnels[0];
        return tunnel.public_url;
      }
    } catch (error) {
      // Ngrok might not be ready yet
    }
    await sleep(RETRY_DELAY);
  }
  throw new Error('Failed to get ngrok URL after ' + MAX_RETRIES + ' attempts');
}

// Kill any existing ngrok processes first
exec('pkill -f ngrok', (error) => {
  // Ignore errors from pkill if no process exists
  
  // Wait a moment for the process to die
  setTimeout(() => {
    console.log('Starting ngrok tunnel...');
    const ngrok = exec('ngrok http 8766 --subdomain=claude-code', (error) => {
      if (error) {
        console.error('Ngrok process error:', error);
        if (error.message.includes('already online')) {
          console.log('\n⚠️  Ngrok tunnel already exists. You may need to:');
          console.log('   1. Kill all ngrok processes: pkill -f ngrok');
          console.log('   2. Or access the existing tunnel at: https://claude-code.ngrok.io');
          console.log('   3. Check ngrok dashboard at: http://localhost:4040\n');
        }
      }
    });
    
    // Store ngrok process reference
    process.ngrok = ngrok;
  }, 500);
});

// Wait a bit for ngrok to start
setTimeout(async () => {
  try {
    const url = await getNgrokUrl();
    console.log('\n' + '='.repeat(60));
    console.log('🌐 NGROK TUNNEL IS READY!');
    console.log('📱 Access your app at: ' + url);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('Failed to get ngrok URL:', error.message);
    console.log('Check ngrok dashboard at: http://localhost:4040');
  }
}, 2000);

// Keep the process running and handle cleanup
process.on('SIGINT', () => {
  if (process.ngrok) {
    process.ngrok.kill();
  }
  exec('pkill -f ngrok', () => {
    process.exit();
  });
});

process.on('SIGTERM', () => {
  if (process.ngrok) {
    process.ngrok.kill();
  }
  exec('pkill -f ngrok', () => {
    process.exit();
  });
});