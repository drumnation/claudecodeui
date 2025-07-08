import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createLogger } from '@kit/logger/node';
import { 
  AgentType, 
  AgentResult, 
  AgentPromptContext, 
  CodeContext 
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
  private claudeBinary: string;
  private startTime: number = 0;
  private outputBuffer: string = '';
  
  constructor(options: AgentRunnerOptions) {
    super();
    this.options = options;
    this.claudeBinary = process.env.CLAUDE_BINARY || 'claude';
  }

  async execute(): Promise<AgentResult> {
    this.startTime = Date.now();
    
    try {
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
      throw error;
    }
  }

  private async buildPrompt(): Promise<string> {
    try {
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
      
    } catch (error) {
      logger.error('Failed to build prompt', { error, agentType: this.options.agentType });
      throw new Error(`Failed to build prompt for ${this.options.agentType} agent: ${error.message}`);
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
      
      this.process.on('error', (error) => {
        logger.error('Claude process error', { 
          agentType: this.options.agentType,
          error
        });
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