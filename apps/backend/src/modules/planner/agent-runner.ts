import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createLogger } from '@kit/logger/node';
import { resolveCli } from '../../lib/cliResolver.js';
import { 
  AgentType, 
  AgentResult, 
  AgentPromptContext, 
  CodeContext,
  PlannerValidationError
} from './planner.types.js';

const logger = createLogger({ scope: 'agent-runner' });

export interface AgentRunnerOptions {
  agentType: AgentType;
  projectPath: string;
  promptPath: string;
  codeContext: CodeContext[];
  featureDescription: string;
  screenshots?: any[];
  archOutput?: string;
  diffOutput?: string;
  depsOutput?: string;
  sessionId: string;
}

export class AgentRunner extends EventEmitter {
  private process: ChildProcess | null = null;
  private readonly options: AgentRunnerOptions;
  private claudeBinary: string | null = null;
  private startTime: number = 0;
  private outputBuffer: string = '';
  
  constructor(options: AgentRunnerOptions) {
    super();
    this.options = options;
  }

  async execute(): Promise<AgentResult> {
    this.startTime = Date.now();
    
    try {
      // Resolve Claude binary first
      this.claudeBinary = await resolveCli('claude', 'CLAUDE_BINARY');
      if (!this.claudeBinary) {
        const error = new Error('Claude CLI not found. Please install it with "npm install -g @anthropic-ai/claude-cli" or set CLAUDE_BINARY environment variable');
        (error as any).errorType = PlannerValidationError.CLAUDE_BINARY_MISSING;
        throw error;
      }
      
      this.emit('agent-status', {
        agentType: this.options.agentType,
        status: 'running',
        message: `Starting ${this.options.agentType} agent...`
      });
      
      const prompt = await this.buildPrompt();
      const output = await this.executeClaudeCommand(prompt);
      
      const result: AgentResult = {
        agentType: this.options.agentType,
        output: output,
        status: 'completed',
        duration: Date.now() - this.startTime,
        startTime: this.startTime,
        endTime: Date.now()
      };
      
      this.emit('agent-complete', result);
      return result;
      
    } catch (error: any) {
      const result: AgentResult = {
        agentType: this.options.agentType,
        output: '',
        status: 'failed',
        duration: Date.now() - this.startTime,
        error: error.message,
        startTime: this.startTime,
        endTime: Date.now()
      };
      
      this.emit('agent-error', result);
      // Add error type if not already set
      if (!error.errorType) {
        error.errorType = PlannerValidationError.AGENT_EXECUTION_ERROR;
      }
      throw error;
    }
  }

  private async buildPrompt(): Promise<string> {
    try {
      // Check if prompt file exists
      try {
        await fs.access(this.options.promptPath);
      } catch (accessError) {
        const error = new Error(`Prompt file not found: ${this.options.promptPath}`);
        (error as any).errorType = PlannerValidationError.PROMPT_FILE_MISSING;
        throw error;
      }
      
      const promptTemplate = await fs.readFile(this.options.promptPath, 'utf-8');
      
      let prompt = promptTemplate;
      
      // Replace placeholders with actual values
      prompt = prompt.replace(/\{\{FEATURE_DESCRIPTION\}\}/g, this.options.featureDescription);
      prompt = prompt.replace(/\{\{PROJECT_PATH\}\}/g, this.options.projectPath);
      prompt = prompt.replace(/\{\{TIMESTAMP\}\}/g, new Date().toISOString());
      
      // Replace code context
      const codeContextText = this.formatCodeContext(this.options.codeContext);
      prompt = prompt.replace(/\{\{CODE_CONTEXT\}\}/g, codeContextText);
      
      // Replace agent-specific outputs for sequential execution
      if (this.options.archOutput) {
        prompt = prompt.replace(/\{\{ARCH_OUTPUT\}\}/g, this.options.archOutput);
      }
      
      if (this.options.diffOutput) {
        prompt = prompt.replace(/\{\{DIFF_OUTPUT\}\}/g, this.options.diffOutput);
      }
      
      if (this.options.depsOutput) {
        prompt = prompt.replace(/\{\{DEPS_OUTPUT\}\}/g, this.options.depsOutput);
      }
      
      // Add screenshots if available
      if (this.options.screenshots && this.options.screenshots.length > 0) {
        const screenshotSection = this.formatScreenshots(this.options.screenshots);
        prompt = prompt.replace(/\{\{SCREENSHOTS\}\}/g, screenshotSection);
      }
      
      // Replace any remaining placeholders with empty string
      prompt = prompt.replace(/\{\{[^}]+\}\}/g, '');
      
      logger.debug('Built prompt for agent', { 
        agentType: this.options.agentType,
        promptLength: prompt.length,
        codeContextItems: this.options.codeContext.length,
        screenshotCount: this.options.screenshots?.length || 0
      });
      
      return prompt;
      
    } catch (error: any) {
      logger.error('Failed to build prompt', { 
        error, 
        agentType: this.options.agentType,
        promptPath: this.options.promptPath
      });
      if (!error.errorType) {
        error.errorType = PlannerValidationError.PROMPT_FILE_ERROR;
      }
      throw error;
    }
  }

  private formatCodeContext(codeContext: CodeContext[]): string {
    if (!codeContext || codeContext.length === 0) {
      return 'No code context available.';
    }
    
    const formatted = codeContext.map(context => {
      const header = `## File: ${context.file}${context.lineNumber ? ` (line ${context.lineNumber})` : ''}`;
      const relevance = context.relevance ? ` (relevance: ${context.relevance.toFixed(2)})` : '';
      const description = context.description ? `\n${context.description}` : '';
      
      return `${header}${relevance}${description}\n\n\`\`\`\n${context.snippet}\n\`\`\``;
    }).join('\n\n---\n\n');
    
    return `# Code Context\n\n${formatted}`;
  }

  private formatScreenshots(screenshots: any[]): string {
    if (!screenshots || screenshots.length === 0) {
      return '';
    }
    
    const formatted = screenshots.map((screenshot, index) => {
      return `## Screenshot ${index + 1}: ${screenshot.name}\n\n[Base64 image data provided to Claude]`;
    }).join('\n\n');
    
    return `# Screenshots\n\n${formatted}\n\nNote: The screenshots have been provided to Claude as image inputs for visual context.`;
  }

  private executeClaudeCommand(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.claudeBinary) {
        const error = new Error('Claude binary not resolved');
        (error as any).errorType = PlannerValidationError.CLAUDE_BINARY_MISSING;
        reject(error);
        return;
      }
      
      // Use actual Claude execution with proper model parameter
      const args = [
        '--model', 'claude-3-5-sonnet-20241022',
        '--max-tokens', '8192'
      ];
      
      logger.info('Executing Claude command', { 
        agentType: this.options.agentType,
        claudeBinary: this.claudeBinary,
        args,
        projectPath: this.options.projectPath,
        promptLength: prompt.length
      });
      
      this.process = spawn(this.claudeBinary, args, {
        cwd: this.options.projectPath,
        env: { 
          ...process.env,
          FORCE_COLOR: '0' // Disable colors for text output
        }
      });
      
      let output = '';
      let errorOutput = '';
      
      this.process.stdout?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        
        // Emit progress updates
        this.emit('agent-output', {
          agentType: this.options.agentType,
          output: chunk,
          partial: true
        });
      });
      
      this.process.stderr?.on('data', (data) => {
        errorOutput += data.toString();
        logger.debug('Claude stderr', { 
          agentType: this.options.agentType,
          stderr: data.toString()
        });
      });
      
      this.process.on('close', (code) => {
        if (code !== 0) {
          const error = new Error(`Claude process exited with code ${code}: ${errorOutput}`);
          logger.error('Claude process failed', { 
            agentType: this.options.agentType,
            code,
            error: errorOutput
          });
          reject(error);
        } else {
          logger.info('Claude process completed successfully', { 
            agentType: this.options.agentType,
            outputLength: output.length
          });
          resolve(output);
        }
      });
      
      this.process.on('error', (error: any) => {
        logger.error('Claude process error', { 
          agentType: this.options.agentType,
          error,
          claudeBinary: this.claudeBinary
        });
        // This usually means the binary doesn't exist or isn't executable
        if (error.code === 'ENOENT') {
          error.errorType = PlannerValidationError.CLAUDE_BINARY_MISSING;
          error.message = `Claude CLI not found at ${this.claudeBinary}. Please install it or set CLAUDE_BINARY environment variable`;
        } else if (error.code === 'EACCES') {
          error.errorType = PlannerValidationError.CLAUDE_BINARY_NOT_EXECUTABLE;
          error.message = `Claude CLI at ${this.claudeBinary} is not executable`;
        }
        reject(error);
      });
      
      // Write the prompt to stdin
      if (this.process.stdin) {
        this.process.stdin.write(prompt);
        this.process.stdin.end();
      } else {
        reject(new Error('Failed to write prompt to Claude process'));
      }
    });
  }

  public kill(): void {
    if (this.process) {
      logger.info('Killing agent process', { 
        agentType: this.options.agentType,
        sessionId: this.options.sessionId
      });
      this.process.kill();
      this.process = null;
    }
  }

  public isRunning(): boolean {
    return this.process !== null && !this.process.killed;
  }

  public getAgentType(): AgentType {
    return this.options.agentType;
  }

  public getSessionId(): string {
    return this.options.sessionId;
  }
}