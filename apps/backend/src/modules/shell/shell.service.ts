import { spawn, ChildProcess, execFile } from 'child_process';
import { createLogger } from '@kit/logger/node';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

const logger = createLogger({ scope: 'shell-service' });

export interface ShellServiceOptions {
  projectPath: string;
  sessionId?: string;
  hasSession?: boolean;
}

export class ShellService extends EventEmitter {
  private process: ChildProcess | null = null;
  private isRunning = false;

  constructor(private options: ShellServiceOptions) {
    super();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Shell service already running');
      return;
    }

    try {
      // Check if claude CLI is available
      await this.checkClaudeAvailable();

      const { projectPath, sessionId, hasSession } = this.options;

      logger.info('Starting Claude shell', {
        projectPath,
        sessionId,
        hasSession
      });

      // Build claude command arguments
      const claudeArgs: string[] = [];
      let isResuming = false;
      if (hasSession && sessionId) {
        claudeArgs.push('--resume', sessionId);
        isResuming = true;
      }

      logger.info('Spawning claude process', {
        command: 'claude',
        args: claudeArgs,
        cwd: projectPath
      });

      // Spawn claude process
      const claudePath = process.env.CLAUDE_CLI_PATH || 'claude';
      logger.info('Spawning claude with args', { command: claudePath, args: claudeArgs });
      
      // If we have a custom path and it exists, check if it's a Node.js script
      if (process.env.CLAUDE_CLI_PATH && fs.existsSync(claudePath)) {
        const content = fs.readFileSync(claudePath, 'utf8');
        if (content.startsWith('#!/usr/bin/env node') || content.startsWith('#!/usr/bin/node')) {
          // It's a Node.js script, spawn it with node directly
          const nodeExecutable = process.execPath; // Path to the current Node.js executable
          this.process = spawn(nodeExecutable, [claudePath, ...claudeArgs], {
            cwd: projectPath,
            env: {
              ...process.env,
              PATH: process.env.PATH + ':/Users/dmieloch/.npm-global/bin',
              TERM: 'xterm-256color',
              COLORTERM: 'truecolor',
              FORCE_COLOR: '3',
              // Override browser opening commands to echo URL for detection
              BROWSER: 'echo "OPEN_URL:"'
            },
            stdio: ['pipe', 'pipe', 'pipe']
          });
        } else {
          // It's a binary or other executable
          this.process = spawn(claudePath, claudeArgs, {
            cwd: projectPath,
            env: {
              ...process.env,
              PATH: process.env.PATH + ':/Users/dmieloch/.npm-global/bin',
              TERM: 'xterm-256color',
              COLORTERM: 'truecolor',
              FORCE_COLOR: '3',
              // Override browser opening commands to echo URL for detection
              BROWSER: 'echo "OPEN_URL:"'
            },
            stdio: ['pipe', 'pipe', 'pipe']
          });
        }
      } else {
        // Use system claude command
        this.process = spawn(claudePath, claudeArgs, {
          cwd: projectPath,
          env: {
            ...process.env,
            PATH: process.env.PATH + ':/Users/dmieloch/.npm-global/bin',
            TERM: 'xterm-256color',
            COLORTERM: 'truecolor',
            FORCE_COLOR: '3',
            // Override browser opening commands to echo URL for detection
            BROWSER: 'echo "OPEN_URL:"'
          },
          stdio: ['pipe', 'pipe', 'pipe']
        });
      }

      this.isRunning = true;

      // Set up a timeout for session resume
      let startupTimeout: NodeJS.Timeout | null = null;
      if (isResuming) {
        startupTimeout = setTimeout(() => {
          logger.warn('Session resume timeout - starting fresh session', { sessionId });
          
          // Kill the stuck process
          if (this.process && !this.process.killed) {
            // Remove event listeners to prevent duplicate handlers
            this.process.removeAllListeners();
            this.process.kill('SIGTERM');
          }
          
          // Emit error message
          this.emit('output', '\r\n\x1b[33mSession resume timed out. Starting a fresh session...\x1b[0m\r\n\r\n');
          
          // Start a fresh session
          setTimeout(() => {
            // Reset the service state first
            this.process = null;
            this.isRunning = false;
            this.startFreshSession(projectPath);
          }, 1000);
        }, 10000); // 10 second timeout for resume
      }

      // Clear timeout on successful startup
      let hasStarted = false;

      // Handle stdout
      this.process.stdout?.on('data', (data) => {
        const output = data.toString();
        logger.debug('Shell stdout', { length: output.length });
        
        // Clear startup timeout on first output
        if (!hasStarted && startupTimeout) {
          hasStarted = true;
          clearTimeout(startupTimeout);
          startupTimeout = null;
        }
        
        // Check for URL patterns
        this.detectUrls(output);
        
        this.emit('output', output);
      });

      // Handle stderr
      this.process.stderr?.on('data', (data) => {
        const error = data.toString();
        logger.error('Shell stderr', { error });
        this.emit('error', error);
      });

      // Handle process exit
      this.process.on('exit', (code, signal) => {
        logger.info('Claude process exited', { code, signal });
        this.isRunning = false;
        this.emit('exit', { code, signal });
      });

      // Handle process errors
      this.process.on('error', (error) => {
        logger.error('Claude process error', { 
          error: error.message,
          code: (error as any).code,
          syscall: (error as any).syscall,
          path: (error as any).path
        });
        this.isRunning = false;
        this.emit('process-error', error);
      });
      
      // Handle spawn event to confirm process started
      this.process.on('spawn', () => {
        logger.info('Claude process spawned successfully');
      });

      // Send initial output
      const welcomeMsg = hasSession 
        ? `\x1b[36mResuming Claude session ${sessionId} in: ${projectPath}\x1b[0m\r\n`
        : `\x1b[36mStarting new Claude session in: ${projectPath}\x1b[0m\r\n`;
      
      this.emit('output', welcomeMsg);

    } catch (error) {
      logger.error('Failed to start shell service', { error });
      this.isRunning = false;
      throw error;
    }
  }

  write(data: string): void {
    if (!this.process || !this.isRunning) {
      logger.warn('Cannot write to shell - process not running');
      return;
    }

    logger.debug('Writing to shell stdin', { length: data.length });
    this.process.stdin?.write(data);
  }

  kill(): void {
    if (!this.process) {
      return;
    }

    logger.info('Killing shell process');
    this.process.kill('SIGTERM');
    
    // Force kill after timeout
    setTimeout(() => {
      if (this.process && !this.process.killed) {
        logger.warn('Force killing shell process');
        this.process.kill('SIGKILL');
      }
    }, 1000);

    this.isRunning = false;
  }

  private async startFreshSession(projectPath: string): Promise<void> {
    try {
      logger.info('Starting fresh Claude session', { projectPath });

      // Send welcome message for fresh session
      this.emit('output', `\x1b[36mStarting new Claude session in: ${projectPath}\x1b[0m\r\n`);

      // Spawn claude process without resume
      const claudePath = process.env.CLAUDE_CLI_PATH || 'claude';
      logger.info('Spawning fresh claude', { command: claudePath });
      
      // If we have a custom path and it exists, check if it's a Node.js script
      if (process.env.CLAUDE_CLI_PATH && fs.existsSync(claudePath)) {
        const content = fs.readFileSync(claudePath, 'utf8');
        if (content.startsWith('#!/usr/bin/env node') || content.startsWith('#!/usr/bin/node')) {
          // It's a Node.js script, spawn it with node directly
          const nodeExecutable = process.execPath; // Path to the current Node.js executable
          this.process = spawn(nodeExecutable, [claudePath], {
            cwd: projectPath,
            env: {
              ...process.env,
              PATH: process.env.PATH + ':/Users/dmieloch/.npm-global/bin',
              TERM: 'xterm-256color',
              COLORTERM: 'truecolor',
              FORCE_COLOR: '3',
              BROWSER: 'echo "OPEN_URL:"'
            },
            stdio: ['pipe', 'pipe', 'pipe']
          });
        } else {
          // It's a binary or other executable
          this.process = spawn(claudePath, [], {
            cwd: projectPath,
            env: {
              ...process.env,
              PATH: process.env.PATH + ':/Users/dmieloch/.npm-global/bin',
              TERM: 'xterm-256color',
              COLORTERM: 'truecolor',
              FORCE_COLOR: '3',
              BROWSER: 'echo "OPEN_URL:"'
            },
            stdio: ['pipe', 'pipe', 'pipe']
          });
        }
      } else {
        // Use system claude command
        this.process = spawn(claudePath, [], {
          cwd: projectPath,
          env: {
            ...process.env,
            PATH: process.env.PATH + ':/Users/dmieloch/.npm-global/bin',
            TERM: 'xterm-256color',
            COLORTERM: 'truecolor',
            FORCE_COLOR: '3',
            BROWSER: 'echo "OPEN_URL:"'
          },
          stdio: ['pipe', 'pipe', 'pipe']
        });
      }

      this.isRunning = true;

      // Set up event handlers
      this.process.stdout?.on('data', (data) => {
        const output = data.toString();
        logger.debug('Shell stdout (fresh)', { length: output.length });
        this.detectUrls(output);
        this.emit('output', output);
      });

      this.process.stderr?.on('data', (data) => {
        const error = data.toString();
        logger.error('Shell stderr (fresh)', { error });
        this.emit('error', error);
      });

      this.process.on('exit', (code, signal) => {
        logger.info('Claude process exited (fresh)', { code, signal });
        this.isRunning = false;
        this.emit('exit', { code, signal });
      });

      this.process.on('error', (error) => {
        logger.error('Claude process error (fresh)', { error });
        this.isRunning = false;
        this.emit('process-error', error);
      });

    } catch (error) {
      logger.error('Failed to start fresh session', { error });
      this.isRunning = false;
      throw error;
    }
  }

  private async checkClaudeAvailable(): Promise<void> {
    return new Promise((resolve, reject) => {
      const claudePath = process.env.CLAUDE_CLI_PATH || 'claude';
      
      // If a custom path is provided, check if the file exists
      if (process.env.CLAUDE_CLI_PATH) {
        if (fs.existsSync(claudePath)) {
          resolve();
          return;
        } else {
          reject(new Error(`Claude CLI not found at configured path: ${claudePath}`));
          return;
        }
      }
      
      // Otherwise check if claude is in PATH
      const checkProcess = spawn('which', [claudePath]);
      
      checkProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('Claude CLI not found. Please install it first: https://docs.anthropic.com/claude/docs/claude-cli'));
        }
      });

      checkProcess.on('error', (error) => {
        reject(new Error(`Failed to check for Claude CLI: ${error.message}`));
      });
    });
  }

  private detectUrls(output: string): void {
    // Check for various URL opening patterns
    const patterns = [
      // BROWSER environment variable override
      /OPEN_URL:\s*(https?:\/\/[^\s\x1b\x07]+)/g,
      // Direct browser opening commands
      /(?:xdg-open|open|start)\s+(https?:\/\/[^\s\x1b\x07]+)/g,
      // Git and other tools opening URLs
      /Opening\s+(https?:\/\/[^\s\x1b\x07]+)/gi,
      // General URL patterns that might be opened
      /Visit:\s*(https?:\/\/[^\s\x1b\x07]+)/gi,
      /View at:\s*(https?:\/\/[^\s\x1b\x07]+)/gi,
      /Browse to:\s*(https?:\/\/[^\s\x1b\x07]+)/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(output)) !== null) {
        const url = match[1];
        logger.info('Detected URL for opening', { url });
        this.emit('url-open', url);
      }
    });
  }
}