import { EventEmitter } from 'events';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '@kit/logger/node';
import { 
  PlannerRequest, 
  AgentType, 
  AgentResult, 
  PlannerProgress, 
  PlannerComplete,
  PlannerServiceState,
  CodeContext,
  ValidationResult
} from './planner.types.js';
import { CodeQAIAdapter } from './codeqai.adapter.js';
import { AgentRunner } from './agent-runner.js';
import { ValidationService } from './validation.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger({ scope: 'planner-service' });

export class PlannerService extends EventEmitter {
  private codeqaiAdapter: CodeQAIAdapter;
  private validationService: ValidationService;
  private activeAgents: Map<string, AgentRunner> = new Map();
  private state: PlannerServiceState;
  private lastSyncTimes: Map<string, number> = new Map();
  
  constructor() {
    super();
    this.codeqaiAdapter = new CodeQAIAdapter();
    this.validationService = new ValidationService();
    this.state = {
      isRunning: false,
      currentRequest: null,
      agentResults: new Map(),
      progress: {
        currentAgent: null,
        completedAgents: [],
        overallStatus: 'idle',
        totalAgents: 0,
        completedCount: 0,
        progressPercentage: 0
      },
      startTime: 0,
      sessionId: ''
    };
  }

  async planFeature(request: PlannerRequest): Promise<PlannerComplete> {
    if (this.state.isRunning) {
      throw new Error('Planner is already running');
    }

    this.state.isRunning = true;
    this.state.currentRequest = request;
    this.state.sessionId = request.sessionId || this.generateSessionId();
    this.state.startTime = Date.now();
    this.state.agentResults.clear();
    
    // Initialize progress
    this.state.progress = {
      currentAgent: null,
      completedAgents: [],
      overallStatus: 'running',
      totalAgents: request.selectedAgents.length,
      completedCount: 0,
      progressPercentage: 0
    };

    try {
      logger.info('Starting feature planning', { 
        sessionId: this.state.sessionId,
        projectPath: request.projectPath,
        selectedAgents: request.selectedAgents,
        featureDescription: request.featureDescription.substring(0, 100) + '...'
      });

      // Pre-flight validation
      const validation = await this.validationService.validatePlannerDependencies(request);
      if (!validation.success) {
        const errorMessage = validation.errors.join('; ');
        logger.error('Pre-flight validation failed', {
          sessionId: this.state.sessionId,
          errors: validation.errors,
          errorType: validation.errorType
        });
        
        this.emit('planner-error', {
          error: errorMessage,
          errorType: validation.errorType,
          sessionId: this.state.sessionId
        });
        
        throw new Error(errorMessage);
      }

      // Ensure CodeQAI index is up to date
      await this.ensureCodeQAISync(request.projectPath);

      this.emitProgress();

      // Execute agents sequentially
      const agentResults: AgentResult[] = [];
      let previousOutputs: { [key: string]: string } = {};

      for (const agentType of request.selectedAgents) {
        this.state.progress.currentAgent = agentType;
        this.emitProgress();

        const result = await this.executeAgent(
          agentType, 
          request, 
          previousOutputs
        );
        
        agentResults.push(result);
        this.state.agentResults.set(agentType, result);
        
        // Store output for next agent
        previousOutputs[agentType.toLowerCase()] = result.output;
        
        // Update progress
        this.state.progress.completedAgents.push(agentType);
        this.state.progress.completedCount++;
        this.state.progress.progressPercentage = 
          (this.state.progress.completedCount / this.state.progress.totalAgents) * 100;
        
        this.emitProgress();
      }

      // Generate final plan
      const finalPlan = this.generateFinalPlan(agentResults);
      const totalDuration = Date.now() - this.state.startTime;
      
      this.state.progress.currentAgent = null;
      this.state.progress.overallStatus = 'completed';
      this.state.progress.progressPercentage = 100;
      this.emitProgress();

      const result: PlannerComplete = {
        finalPlan,
        agentResults,
        totalDuration,
        status: 'completed',
        summary: this.generateSummary(agentResults)
      };

      logger.info('Feature planning completed', { 
        sessionId: this.state.sessionId,
        totalDuration,
        agentCount: agentResults.length
      });

      this.emit('planner-complete', result);
      return result;

    } catch (error: any) {
      this.state.progress.overallStatus = 'failed';
      this.emitProgress();
      
      logger.error('Feature planning failed', { 
        sessionId: this.state.sessionId,
        error: error.message
      });

      this.emit('planner-error', {
        error: error.message,
        sessionId: this.state.sessionId
      });

      throw error;
    } finally {
      this.state.isRunning = false;
      this.cleanup();
    }
  }

  private async executeAgent(
    agentType: AgentType, 
    request: PlannerRequest,
    previousOutputs: { [key: string]: string }
  ): Promise<AgentResult> {
    
    logger.info('Executing agent', { 
      agentType,
      sessionId: this.state.sessionId
    });

    try {
      // Get agent-specific code context with more comprehensive search
      const codeContext = await this.codeqaiAdapter.getAgentContext(
        request.projectPath,
        agentType,
        request.featureDescription,
        { maxResults: 20, contextLength: 1500 } // Significantly increased for deeper research
      );

      // Determine prompt path
      const promptPath = this.getPromptPath(agentType);
      
      // Validate prompt file exists
      const promptValidation = await this.validationService.validatePromptFile(promptPath);
      if (!promptValidation.success) {
        throw new Error(`Prompt file not found: ${promptPath}`);
      }
      
      // Create agent runner
      const agentRunner = new AgentRunner({
        agentType,
        projectPath: request.projectPath,
        promptPath,
        codeContext,
        featureDescription: request.featureDescription,
        screenshots: request.screenshots,
        archOutput: previousOutputs.arch,
        diffOutput: previousOutputs.diff,
        depsOutput: previousOutputs.deps,
        sessionId: this.state.sessionId
      });

      // Store active agent
      this.activeAgents.set(agentType, agentRunner);

      // Set up agent event handlers
      agentRunner.on('agent-status', (data) => {
        this.emit('planner-status', {
          agentType,
          status: data.status,
          message: data.message,
          progress: this.state.progress
        });
      });

      agentRunner.on('agent-output', (data) => {
        this.emit('planner-output', {
          agentType,
          output: data.output,
          partial: data.partial
        });
      });

      // Execute the agent
      const result = await agentRunner.execute();
      
      logger.info('Agent execution completed', { 
        agentType,
        duration: result.duration,
        outputLength: result.output.length
      });

      return result;

    } catch (error: any) {
      logger.error('Agent execution failed', { 
        agentType,
        error: error.message,
        stack: error.stack
      });

      // Emit error to WebSocket with additional context
      this.emit('planner-error', {
        error: `${agentType} agent failed: ${error.message}`,
        sessionId: this.state.sessionId,
        agentType,
        errorType: error.errorType || 'AGENT_EXECUTION_ERROR'
      });

      return {
        agentType,
        output: '',
        status: 'failed',
        duration: 0,
        error: error.message,
        startTime: Date.now(),
        endTime: Date.now()
      };
    } finally {
      // Clean up agent
      this.activeAgents.delete(agentType);
    }
  }

  private getPromptPath(agentType: AgentType): string {
    const promptMap = {
      [AgentType.ARCH]: '.brain/prompts/plan-generation/ARCH/arch-deep-analysis.prompt.md',
      [AgentType.DIFF]: '.brain/prompts/plan-generation/DIFF/diff-analysis.prompt.md',
      [AgentType.DEPS]: '.brain/prompts/plan-generation/DEPS/deps-analysis.prompt.md'
    };
    
    // Get the repository root (5 levels up from this module)
    const repoRoot = path.resolve(__dirname, '../../../../..');
    return path.join(repoRoot, promptMap[agentType]);
  }

  private generateFinalPlan(agentResults: AgentResult[]): string {
    const sections = [];
    
    const title = agentResults.length === 1 ? 'Single Agent Feature Planning Results' : 'Multi-Agent Feature Planning Results';
    sections.push(`# ${title}`);
    sections.push(`\nGenerated on: ${new Date().toISOString()}`);
    sections.push(`\nTotal agents executed: ${agentResults.length}`);
    sections.push(`\nTotal planning time: ${this.formatDuration(Date.now() - this.state.startTime)}`);
    
    for (const result of agentResults) {
      if (result.status === 'completed' && result.output.trim()) {
        sections.push(`\n## ${result.agentType} Agent Analysis`);
        sections.push(`\n*Execution time: ${this.formatDuration(result.duration || 0)}*`);
        sections.push(`\n${result.output}`);
      } else if (result.status === 'failed') {
        sections.push(`\n## ${result.agentType} Agent Analysis`);
        sections.push(`\n*Status: FAILED*`);
        sections.push(`\n*Error: ${result.error || 'Unknown error'}*`);
      }
    }
    
    // Add summary section
    sections.push('\n## Summary');
    sections.push(this.generateSummary(agentResults));
    
    return sections.join('\n');
  }

  private generateSummary(agentResults: AgentResult[]): string {
    const completedAgents = agentResults.filter(r => r.status === 'completed');
    const failedAgents = agentResults.filter(r => r.status === 'failed');
    
    const summary = [];
    summary.push(`Successfully executed ${completedAgents.length} out of ${agentResults.length} agents.`);
    
    if (failedAgents.length > 0) {
      summary.push(`Failed agents: ${failedAgents.map(a => a.agentType).join(', ')}`);
    }
    
    if (completedAgents.length > 0) {
      const avgDuration = completedAgents.reduce((sum, agent) => sum + (agent.duration || 0), 0) / completedAgents.length;
      summary.push(`Average execution time: ${this.formatDuration(avgDuration)}`);
    }
    
    return summary.join('\n');
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  private emitProgress(): void {
    this.emit('planner-status', {
      progress: this.state.progress,
      sessionId: this.state.sessionId
    });
  }

  private generateSessionId(): string {
    return `planner-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  public abortPlanning(): void {
    if (!this.state.isRunning) {
      return;
    }

    logger.info('Aborting planning session', { 
      sessionId: this.state.sessionId 
    });

    this.state.progress.overallStatus = 'failed';
    this.emitProgress();

    // Kill all active agents
    for (const [agentType, agent] of this.activeAgents) {
      logger.info('Killing agent', { agentType, sessionId: this.state.sessionId });
      agent.kill();
    }

    this.state.isRunning = false;
    this.cleanup();

    this.emit('planner-error', {
      error: 'Planning session aborted',
      sessionId: this.state.sessionId
    });
  }

  private cleanup(): void {
    this.activeAgents.clear();
    this.codeqaiAdapter.clearCache();
  }

  public getState(): PlannerServiceState {
    return { ...this.state };
  }

  public isRunning(): boolean {
    return this.state.isRunning;
  }

  private async ensureCodeQAISync(projectPath: string): Promise<void> {
    const syncKey = `sync:${projectPath}`;
    const lastSync = this.lastSyncTimes.get(syncKey);
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    
    // Skip sync if we've synced recently
    if (lastSync && (now - lastSync) < ONE_HOUR) {
      logger.info('Skipping CodeQAI sync, index is fresh', { 
        projectPath,
        lastSyncAge: Math.round((now - lastSync) / 1000 / 60) + ' minutes'
      });
      return;
    }
    
    try {
      logger.info('Checking CodeQAI index status', { projectPath });
      
      // Check if index is stale
      const isStale = await this.codeqaiAdapter.isIndexStale(projectPath, 24);
      
      if (isStale) {
        logger.info('CodeQAI index is stale, syncing...', { projectPath });
        this.emit('planner-status', {
          progress: {
            ...this.state.progress,
            overallStatus: 'syncing',
            message: 'Updating code search index...'
          },
          sessionId: this.state.sessionId
        });
        
        await this.codeqaiAdapter.syncIndex(projectPath, true);
        this.lastSyncTimes.set(syncKey, now);
        
        logger.info('CodeQAI sync completed', { projectPath });
      } else {
        logger.info('CodeQAI index is fresh', { projectPath });
        this.lastSyncTimes.set(syncKey, now);
      }
    } catch (error) {
      logger.warn('Failed to sync CodeQAI index, continuing without it', { 
        error,
        projectPath 
      });
      // Don't fail the whole planning session if sync fails
    }
  }
}