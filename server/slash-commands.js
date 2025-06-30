const pty = require('node-pty');
const path = require('path');

let cachedCommands = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getSlashCommands() {
  // Return cached commands if still fresh
  if (cachedCommands && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedCommands;
  }

  return new Promise((resolve, reject) => {
    const commands = [];
    let output = '';
    let captureMode = false;
    
    // Start Claude in interactive mode
    const claudeProcess = pty.spawn('claude', [], {
      name: 'xterm-color',
      cwd: process.env.HOME,
      env: process.env,
    });

    // Set a timeout
    const timeout = setTimeout(() => {
      claudeProcess.kill();
      reject(new Error('Timeout getting slash commands'));
    }, 5000);

    claudeProcess.onData((data) => {
      output += data;
      
      // Look for the slash command menu pattern
      if (data.includes('/') && !captureMode) {
        captureMode = true;
      }
      
      if (captureMode) {
        // Parse command lines (they usually appear as "/command - description")
        const lines = data.split('\n');
        for (const line of lines) {
          const match = line.match(/^\s*(\/\w+)\s*[-–]\s*(.+)/);
          if (match) {
            commands.push({
              command: match[1].trim(),
              description: match[2].trim()
            });
          }
        }
        
        // Check if we've captured commands
        if (commands.length > 5) { // Assume we have most commands
          clearTimeout(timeout);
          claudeProcess.kill();
          cachedCommands = commands;
          lastFetchTime = Date.now();
          resolve(commands);
        }
      }
    });

    // Send slash to trigger command menu
    setTimeout(() => {
      claudeProcess.write('/');
    }, 1000);

    // Fallback: Send Ctrl+C and exit after getting some output
    setTimeout(() => {
      claudeProcess.write('\x03'); // Ctrl+C
      claudeProcess.write('exit\r');
    }, 2000);

    claudeProcess.onExit(() => {
      clearTimeout(timeout);
      if (commands.length > 0) {
        cachedCommands = commands;
        lastFetchTime = Date.now();
        resolve(commands);
      } else {
        // Fallback to known commands if discovery fails
        resolve(getDefaultCommands());
      }
    });
  });
}

function getDefaultCommands() {
  // Fallback list based on Claude Code documentation
  return [
    { command: '/analyze', description: 'Analyze code or project structure' },
    { command: '/build', description: 'Build the project' },
    { command: '/cleanup', description: 'Clean up code or project files' },
    { command: '/deploy', description: 'Deploy the application' },
    { command: '/design', description: 'Design system architecture or components' },
    { command: '/dev-setup', description: 'Set up development environment' },
    { command: '/document', description: 'Generate or update documentation' },
    { command: '/estimate', description: 'Estimate time or complexity' },
    { command: '/explain', description: 'Explain code or concepts' },
    { command: '/git', description: 'Git operations' },
    { command: '/help', description: 'Show help information' },
    { command: '/improve', description: 'Improve existing code' },
    { command: '/plan', description: 'Plan implementation approach' },
    { command: '/review', description: 'Review code' },
    { command: '/scan', description: 'Scan for issues or vulnerabilities' },
    { command: '/test', description: 'Run or create tests' },
    { command: '/troubleshoot', description: 'Debug issues' }
  ];
}

module.exports = { getSlashCommands };