const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class ServerManager {
  constructor(wsServer) {
    this.wsServer = wsServer;
    this.servers = new Map();
  }

  async getAvailableScripts(projectPath) {
    try {
      console.log('🔍 Looking for scripts in:', projectPath);
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      // Check if file exists
      try {
        await fs.access(packageJsonPath);
      } catch (e) {
        console.log('📦 No package.json found at:', packageJsonPath);
        return [];
      }
      
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);
      
      if (packageJson.scripts) {
        const scripts = Object.keys(packageJson.scripts);
        console.log('📜 Found scripts:', scripts);
        return scripts;
      }
      console.log('📦 No scripts section in package.json');
      return [];
    } catch (error) {
      console.error('❌ Error reading package.json:', error.message);
      return [];
    }
  }

  async startServer(projectPath, scriptName) {
    const key = `${projectPath}:${scriptName}`;
    
    if (this.servers.has(key)) {
      const server = this.servers.get(key);
      if (server.status === 'running') {
        return { error: 'Server is already running' };
      }
    }

    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);
      
      if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
        return { error: 'Script not found' };
      }

      this.broadcastStatus(projectPath, 'starting', null, scriptName);

      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const child = spawn(npmCmd, ['run', scriptName], {
        cwd: projectPath,
        env: { ...process.env, FORCE_COLOR: '1' },
        shell: true
      });

      let port = null;
      let url = null;
      const portPatterns = [
        /Local:\s+https?:\/\/localhost:(\d+)/i,
        /listening on port (\d+)/i,
        /Server running at https?:\/\/localhost:(\d+)/i,
        /https?:\/\/localhost:(\d+)/i,
        /:\s*(\d+)$/m
      ];

      child.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[${scriptName}] ${output}`);
        
        if (!port) {
          for (const pattern of portPatterns) {
            const match = output.match(pattern);
            if (match) {
              port = match[1];
              url = `http://localhost:${port}`;
              this.broadcastStatus(projectPath, 'running', url, scriptName);
              break;
            }
          }
        }

        this.broadcastLog(projectPath, output, 'stdout');
      });

      child.stderr.on('data', (data) => {
        const output = data.toString();
        console.error(`[${scriptName} ERROR] ${output}`);
        this.broadcastLog(projectPath, output, 'stderr');
      });

      child.on('error', (error) => {
        console.error(`Failed to start server:`, error);
        this.servers.delete(key);
        this.broadcastStatus(projectPath, 'error', null, scriptName);
      });

      child.on('exit', (code) => {
        console.log(`Server process exited with code ${code}`);
        this.servers.delete(key);
        this.broadcastStatus(projectPath, 'stopped', null, scriptName);
      });

      const serverInfo = {
        process: child,
        status: 'running',
        port,
        url,
        script: scriptName,
        projectPath,
        startTime: new Date()
      };

      this.servers.set(key, serverInfo);

      setTimeout(() => {
        if (!port && serverInfo.status === 'running') {
          port = 3000;
          url = `http://localhost:${port}`;
          serverInfo.port = port;
          serverInfo.url = url;
          this.broadcastStatus(projectPath, 'running', url, scriptName);
        }
      }, 5000);

      return { success: true, url };
    } catch (error) {
      console.error('Error starting server:', error);
      this.broadcastStatus(projectPath, 'error', null, scriptName);
      return { error: error.message };
    }
  }

  async stopServer(projectPath, scriptName) {
    const keys = scriptName 
      ? [`${projectPath}:${scriptName}`]
      : Array.from(this.servers.keys()).filter(k => k.startsWith(projectPath + ':'));

    for (const key of keys) {
      const server = this.servers.get(key);
      if (server && server.process) {
        this.broadcastStatus(projectPath, 'stopping', null, server.script);
        
        try {
          if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', server.process.pid, '/f', '/t']);
          } else {
            server.process.kill('SIGTERM');
            setTimeout(() => {
              if (server.process.killed === false) {
                server.process.kill('SIGKILL');
              }
            }, 5000);
          }
          
          this.servers.delete(key);
        } catch (error) {
          console.error('Error stopping server:', error);
          this.broadcastStatus(projectPath, 'error', null, server.script);
        }
      }
    }

    return { success: true };
  }

  getServerStatus(projectPath) {
    const servers = [];
    for (const [key, server] of this.servers) {
      if (key.startsWith(projectPath + ':')) {
        servers.push({
          script: server.script,
          status: server.status,
          url: server.url,
          port: server.port,
          startTime: server.startTime
        });
      }
    }
    return servers;
  }

  broadcastStatus(projectPath, status, url, script) {
    this.wsServer.broadcast({
      type: 'server:status',
      projectPath,
      status,
      url,
      script,
      timestamp: new Date().toISOString()
    });
  }

  broadcastLog(projectPath, message, stream) {
    this.wsServer.broadcast({
      type: 'server:log',
      projectPath,
      message,
      stream,
      timestamp: new Date().toISOString()
    });
  }

  cleanupAll() {
    for (const [key, server] of this.servers) {
      if (server.process) {
        try {
          server.process.kill();
        } catch (error) {
          console.error('Error killing process:', error);
        }
      }
    }
    this.servers.clear();
  }
}

module.exports = ServerManager;