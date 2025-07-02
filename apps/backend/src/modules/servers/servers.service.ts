import {spawn, ChildProcess} from 'child_process';
import type {
  ServerInfo,
  ServerStatusInfo,
  StartServerResult,
  StopServerResult,
  WebSocketMessage,
} from './servers.types.js';
import {readPackageJson} from './servers.repository.js';

// Create a closure to maintain server state
export const createServerManager = (
  broadcast: (message: WebSocketMessage) => void,
) => {
  const servers = new Map<string, ServerInfo>();

  const broadcastStatus = (
    projectPath: string,
    status: string,
    url: string | null,
    script: string,
  ): void => {
    broadcast({
      type: 'server:status',
      projectPath,
      status,
      url,
      script,
      timestamp: new Date().toISOString(),
    });
  };

  const broadcastLog = (
    projectPath: string,
    message: string,
    stream: string,
  ): void => {
    broadcast({
      type: 'server:log',
      projectPath,
      message,
      stream,
      timestamp: new Date().toISOString(),
    });
  };

  const detectPort = (output: string): string | null => {
    const portPatterns = [
      /Local:\s+https?:\/\/localhost:(\d+)/i,
      /listening on port (\d+)/i,
      /Server running at https?:\/\/localhost:(\d+)/i,
      /https?:\/\/localhost:(\d+)/i,
      /:\s*(\d+)$/m,
    ];

    for (const pattern of portPatterns) {
      const match = output.match(pattern);
      if (match) {
        return match[1] || null;
      }
    }
    return null;
  };

  const startServer = async (
    projectPath: string,
    scriptName: string,
  ): Promise<StartServerResult> => {
    const key = `${projectPath}:${scriptName}`;

    if (servers.has(key)) {
      const server = servers.get(key)!;
      if (server.status === 'running') {
        return {error: 'Server is already running'};
      }
    }

    try {
      const packageJson = await readPackageJson(projectPath);

      if (
        !packageJson ||
        !packageJson.scripts ||
        !packageJson.scripts[scriptName]
      ) {
        return {error: 'Script not found'};
      }

      broadcastStatus(projectPath, 'starting', null, scriptName);

      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const child = spawn(npmCmd, ['run', scriptName], {
        cwd: projectPath,
        env: {...process.env, FORCE_COLOR: '1'},
        shell: true,
      });

      let port: string | null = null;
      let url: string | null = null;

      child.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(`[${scriptName}] ${output}`);

        if (!port) {
          const detectedPort = detectPort(output);
          if (detectedPort) {
            port = detectedPort;
            url = `http://localhost:${port}`;
            servers.get(key)!.port = port;
            servers.get(key)!.url = url;
            broadcastStatus(projectPath, 'running', url, scriptName);
          }
        }

        broadcastLog(projectPath, output, 'stdout');
      });

      child.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.error(`[${scriptName} ERROR] ${output}`);
        broadcastLog(projectPath, output, 'stderr');
      });

      child.on('error', (error: Error) => {
        console.error(`Failed to start server:`, error);
        servers.delete(key);
        broadcastStatus(projectPath, 'error', null, scriptName);
      });

      child.on('exit', (code: number | null) => {
        console.log(`Server process exited with code ${code}`);
        servers.delete(key);
        broadcastStatus(projectPath, 'stopped', null, scriptName);
      });

      const serverInfo: ServerInfo = {
        process: child,
        status: 'running',
        port,
        url,
        script: scriptName,
        projectPath,
        startTime: new Date(),
      };

      servers.set(key, serverInfo);

      // Fallback to default port after timeout
      setTimeout(() => {
        const server = servers.get(key);
        if (server && !server.port && server.status === 'running') {
          port = '3000';
          url = `http://localhost:${port}`;
          server.port = port;
          server.url = url;
          broadcastStatus(projectPath, 'running', url, scriptName);
        }
      }, 5000);

      return {success: true, url};
    } catch (error) {
      console.error('Error starting server:', error);
      broadcastStatus(projectPath, 'error', null, scriptName);
      return {error: (error as Error).message};
    }
  };

  const stopServer = async (
    projectPath: string,
    scriptName?: string,
  ): Promise<StopServerResult> => {
    const keys = scriptName
      ? [`${projectPath}:${scriptName}`]
      : Array.from(servers.keys()).filter((k) =>
          k.startsWith(projectPath + ':'),
        );

    for (const key of keys) {
      const server = servers.get(key);
      if (server && server.process) {
        broadcastStatus(projectPath, 'stopping', null, server.script);

        try {
          if (process.platform === 'win32') {
            spawn('taskkill', [
              '/pid',
              server.process.pid!.toString(),
              '/f',
              '/t',
            ]);
          } else {
            server.process.kill('SIGTERM');
            setTimeout(() => {
              if (!server.process.killed) {
                server.process.kill('SIGKILL');
              }
            }, 5000);
          }

          servers.delete(key);
        } catch (error) {
          console.error('Error stopping server:', error);
          broadcastStatus(projectPath, 'error', null, server.script);
        }
      }
    }

    return {success: true};
  };

  const getServerStatus = (projectPath: string): ServerStatusInfo[] => {
    const result: ServerStatusInfo[] = [];
    for (const [key, server] of servers) {
      if (key.startsWith(projectPath + ':')) {
        result.push({
          script: server.script,
          status: server.status,
          url: server.url,
          port: server.port,
          startTime: server.startTime,
        });
      }
    }
    return result;
  };

  const cleanupAll = (): void => {
    for (const [key, server] of servers) {
      if (server.process) {
        try {
          server.process.kill();
        } catch (error) {
          console.error('Error killing process:', error);
        }
      }
    }
    servers.clear();
  };

  return {
    startServer,
    stopServer,
    getServerStatus,
    cleanupAll,
  };
};
