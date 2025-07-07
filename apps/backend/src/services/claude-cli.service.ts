import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { createLogger } from '@kit/logger/node';

const logger = createLogger({ scope: 'claude-cli-service' });

// Types for Claude CLI communication
export interface ClaudeStatusData {
  message: string;
  tokens: number;
  can_interrupt: boolean;
  raw?: string;
}

export interface ClaudeMessage {
  type: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: string;
}

export interface ClaudeStreamResponse {
  type?: string;
  subtype?: string;
  message?: {
    role: string;
    content?: string;
  };
  session_id?: string;
  timestamp?: string;
}

export interface ClaudeOptions {
  cwd?: string;
  projectPath?: string;
  sessionId?: string;
  resume?: boolean;
  command?: string;
  toolsSettings?: {
    allowedTools?: string[];
    disallowedTools?: string[];
    skipPermissions?: boolean;
  };
}

export interface ClaudeEvent {
  type: 'status' | 'message' | 'interactive-prompt' | 'error' | 'exit' | 'stream-end' | 'session-created' | 'claude-response' | 'claude-output';
  data?: any;
  sessionId?: string;
}

export class ClaudeCliService extends EventEmitter {
  private process: ChildProcess | null = null;
  private sessionId: string;
  private stdoutBuffer: string = '';
  private stderrBuffer: string = '';
  private messageBuffer: string = '';
  private isInAssistantResponse: boolean = false;

  constructor(sessionId: string) {
    super();
    this.sessionId = sessionId;
  }

  async start(options: ClaudeOptions): Promise<void> {
    try {
      const settings = options.toolsSettings || {
        allowedTools: [],
        disallowedTools: [],
        skipPermissions: false
      };

      // Build Claude CLI command - start with print/resume flags first
      const args: string[] = [];
      
      // Add print flag with command if we have a command
      if (options.command && options.command.trim()) {
        args.push('--print', options.command);
      }
      
      // Add resume flag if resuming
      if (options.resume && options.sessionId) {
        args.push('--resume', options.sessionId);
      }
      
      // Add basic flags
      args.push('--output-format', 'stream-json', '--verbose');
      
      // Add model for new sessions
      if (!options.resume) {
        args.push('--model', 'sonnet');
      }
      
      // Add tools settings flags
      if (settings.skipPermissions) {
        args.push('--dangerously-skip-permissions');
        logger.warn('Using --dangerously-skip-permissions (skipping other tool settings)');
      } else {
        // Only add allowed/disallowed tools if not skipping permissions
        // Add allowed tools
        if (settings.allowedTools && settings.allowedTools.length > 0) {
          for (const tool of settings.allowedTools) {
            args.push('--allowedTools', tool);
            logger.info('Allowing tool', { tool });
          }
        }
        
        // Add disallowed tools
        if (settings.disallowedTools && settings.disallowedTools.length > 0) {
          for (const tool of settings.disallowedTools) {
            args.push('--disallowedTools', tool);
            logger.info('Disallowing tool', { tool });
          }
        }
      }

      // Use cwd (actual project directory) instead of projectPath (Claude's metadata directory)
      const workingDir = options.cwd || process.cwd();
      logger.info('Spawning Claude CLI', { args, workingDir });

      // Spawn Claude CLI process
      this.process = spawn('claude', args, {
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { 
          ...process.env,
          FORCE_COLOR: '3',
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          CI: 'false' // Some CLIs check this to determine if they're in a TTY
        }
      });

      // Set up event handlers
      this.setupProcessHandlers();

      // Handle stdin for interactive mode
      if (options.command) {
        // For --print mode with arguments, we don't need to write to stdin
        this.process.stdin?.end();
      } else {
        // For interactive mode, keep stdin open
        // Command will be sent via sendCommand method
      }
    } catch (error) {
      logger.error('Failed to start Claude CLI', { error });
      this.emit('error', { 
        type: 'error', 
        data: 'Failed to start Claude CLI. Make sure claude is installed and in your PATH.' 
      });
      throw error;
    }
  }

  private setupProcessHandlers(): void {
    if (!this.process) return;

    // Handle stdout
    this.process.stdout?.on('data', (data) => {
      this.handleStdout(data);
    });

    // Handle stderr
    this.process.stderr?.on('data', (data) => {
      this.handleStderr(data);
    });

    // Handle process exit
    this.process.on('close', (code) => {
      logger.info('Claude CLI process exited', { code, sessionId: this.sessionId });
      
      this.emit('exit', { 
        type: 'exit', 
        data: {
          exitCode: code,
          sessionId: this.sessionId
        }
      });
      
      this.emit('stream-end', { type: 'stream-end' });
    });

    // Handle process errors
    this.process.on('error', (error) => {
      logger.error('Claude CLI process error', { error });
      this.emit('error', { 
        type: 'error', 
        data: error.message 
      });
    });
  }

  private handleStdout(chunk: string): void {
    const rawOutput = chunk.toString();
    logger.debug('Claude CLI stdout', { rawOutput });
    
    // Add to buffer
    this.stdoutBuffer += rawOutput;
    
    // Split by newlines but keep track of whether the last chunk ends with a newline
    const lines = this.stdoutBuffer.split('\n');
    const endsWithNewline = rawOutput.endsWith('\n');
    
    // If it doesn't end with a newline, the last "line" is incomplete - save it for later
    if (!endsWithNewline && lines.length > 0) {
      this.stdoutBuffer = lines.pop() || ''; // Remove and save the incomplete line
    } else {
      this.stdoutBuffer = ''; // Clear buffer if we have complete lines
    }
    
    // Process complete lines
    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const response: ClaudeStreamResponse = JSON.parse(line);
        logger.debug('Parsed JSON response', { response });
        
        // Capture session ID if it's in the response
        if (response.session_id && !this.sessionId) {
          const previousSessionId = this.sessionId;
          this.sessionId = response.session_id;
          logger.info('Captured session ID', { sessionId: this.sessionId });
          
          // Send session-created event for new sessions
          if (!previousSessionId) {
            this.emit('session-created', {
              type: 'session-created',
              sessionId: this.sessionId
            });
          }
        }
        
        // Check if this is a status/progress message
        if (response.type === 'status' || response.type === 'progress' || 
            (response.type === 'system' && response.subtype === 'status')) {
          logger.debug('Detected status message', { response });
          // Send status update directly for JSON format
          this.emit('status', {
            type: 'status',
            data: response
          });
        } else {
          // Send parsed response
          this.emit('claude-response', {
            type: 'claude-response',
            data: response
          });
        }
      } catch (parseError) {
        logger.debug('Non-JSON response', { line });
        
        // Check for status messages in non-JSON output
        if (this.isStatusMessage(line)) {
          logger.debug('Status message detected in line', { line });
          this.parseAndEmitStatus(line);
        } else {
          // Send as raw output
          this.emit('claude-output', {
            type: 'claude-output',
            data: line
          });
        }
      }
    }
    
    // Check buffer for interactive prompts or status
    this.checkBufferForSpecialContent();
  }

  private handleStderr(chunk: string): void {
    const stderrText = chunk.toString();
    logger.debug('Claude CLI stderr', { stderrText });
    
    // Check if this is a status message on stderr
    if (this.isStatusMessage(stderrText)) {
      logger.debug('Status message detected in stderr', { stderrText });
      this.parseAndEmitStatus(stderrText);
    } else {
      // Only emit as error if it's not a status message
      this.emit('error', {
        type: 'error',
        data: stderrText
      });
    }
  }

  private isStatusMessage(text: string): boolean {
    return text.includes('✻') || 
           text.includes('✹') || 
           text.includes('✸') || 
           text.includes('✶') ||
           text.includes('⚒') ||
           text.includes('tokens') ||
           text.includes('esc to interrupt');
  }

  private parseAndEmitStatus(text: string): void {
    const tokensMatch = text.match(/⚒\s*(\d+)\s*tokens/);
    const tokens = tokensMatch ? parseInt(tokensMatch[1]) : 0;
    
    const actionMatch = text.match(/[✻✹✸✶]\s*(\w+)/);
    const action = actionMatch ? actionMatch[1] : 'Working';
    
    const status: ClaudeStatusData = {
      message: action + '...',
      tokens: tokens,
      can_interrupt: text.includes('esc to interrupt'),
      raw: text
    };

    this.emit('status', { type: 'status', data: status });
  }

  private checkBufferForSpecialContent(): void {
    if (!this.stdoutBuffer) return;
    
    // Check for interactive prompts
    if (this.isInteractivePrompt(this.stdoutBuffer)) {
      logger.debug('Interactive prompt detected', { buffer: this.stdoutBuffer });
      
      this.emit('interactive-prompt', { 
        type: 'interactive-prompt', 
        data: this.stdoutBuffer,
        sessionId: this.sessionId
      });
    }
    
    // Check for status messages like "✻ Toggling… (23s · ⚒ 783 tokens · esc to interrupt)"
    if (this.isStatusMessage(this.stdoutBuffer)) {
      logger.debug('Status message in buffer', { buffer: this.stdoutBuffer });
      this.parseAndEmitStatus(this.stdoutBuffer);
    }
  }

  private isInteractivePrompt(text: string): boolean {
    return text.includes('Do you want to') ||
           text.includes('?') ||
           text.includes('>') ||
           text.includes('❯') ||
           !!text.match(/\d+\.\s+\w+/); // Matches "1. Yes" pattern
  }

  private emitAssistantMessage(content: string): void {
    const message: ClaudeMessage = {
      type: 'assistant',
      content: content,
      timestamp: new Date().toISOString()
    };

    this.emit('message', { type: 'message', data: message });
  }

  sendCommand(command: string): void {
    if (!this.process || !this.process.stdin) {
      throw new Error('Claude process not running');
    }

    logger.debug('Sending command to Claude', { command });
    this.process.stdin.write(command + '\n');
  }

  sendInteractiveResponse(response: string): void {
    if (!this.process || !this.process.stdin) {
      throw new Error('Claude process not running');
    }

    logger.debug('Sending interactive response', { response });
    this.process.stdin.write(response + '\n');
  }

  kill(): void {
    if (this.process) {
      logger.info('Killing Claude process', { sessionId: this.sessionId });
      this.process.kill();
      this.process = null;
    }
  }

  isRunning(): boolean {
    return this.process !== null && !this.process.killed;
  }
}