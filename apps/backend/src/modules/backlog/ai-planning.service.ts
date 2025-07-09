import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Task, CreateTaskRequest, TaskStatus, TaskPriority } from './backlog.service.js';

export interface TaskGenerationRequest {
  planText: string;
  projectContext?: string;
  maxTasks?: number;
}

export interface TaskReviewRequest {
  currentTasks: Task[];
  changesSummary: string;
  projectContext?: string;
}

export interface GeneratedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  labels?: string[];
  dependencies?: string[];
  acceptanceCriteria?: string[];
}

export interface TaskUpdate {
  taskId: string;
  updates: Partial<GeneratedTask>;
  reason: string;
}

export class AiPlanningService {
  private claudeBinary: string;
  
  constructor() {
    this.claudeBinary = process.env.CLAUDE_BINARY || 'claude';
  }

  async generateTasksFromPlan(
    projectPath: string, 
    planText: string, 
    projectContext?: string
  ): Promise<GeneratedTask[]> {
    const promptPath = path.join(process.cwd(), '.brain/prompts/plan-generation/create-backlog-tasks.prompt.md');
    
    try {
      const promptTemplate = await fs.readFile(promptPath, 'utf-8');
      const prompt = this.buildTaskGenerationPrompt(promptTemplate, planText, projectContext);
      
      const response = await this.executeClaudeCommand(projectPath, prompt);
      return this.parseGeneratedTasks(response);
    } catch (error: any) {
      console.error('Failed to generate tasks from plan:', error);
      throw new Error(`Failed to generate tasks: ${error.message}`);
    }
  }

  async reviewAndUpdateTasks(
    projectPath: string,
    currentTasks: Task[],
    changesSummary: string,
    projectContext?: string
  ): Promise<TaskUpdate[]> {
    const promptPath = path.join(process.cwd(), '.brain/prompts/plan-generation/review-backlog-tasks.prompt.md');
    
    try {
      const promptTemplate = await fs.readFile(promptPath, 'utf-8');
      const prompt = this.buildTaskReviewPrompt(promptTemplate, currentTasks, changesSummary, projectContext);
      
      const response = await this.executeClaudeCommand(projectPath, prompt);
      return this.parseTaskUpdates(response);
    } catch (error: any) {
      console.error('Failed to review tasks:', error);
      throw new Error(`Failed to review tasks: ${error.message}`);
    }
  }

  async generateSingleTask(
    projectPath: string,
    description: string,
    context?: string
  ): Promise<GeneratedTask> {
    const promptPath = path.join(process.cwd(), '.brain/prompts/plan-generation/generate-single-task.prompt.md');
    
    try {
      const promptTemplate = await fs.readFile(promptPath, 'utf-8');
      const prompt = this.buildSingleTaskPrompt(promptTemplate, description, context);
      
      const response = await this.executeClaudeCommand(projectPath, prompt);
      const tasks = this.parseGeneratedTasks(response);
      
      if (tasks.length === 0) {
        throw new Error('No task generated');
      }
      
      return tasks[0];
    } catch (error: any) {
      console.error('Failed to generate single task:', error);
      throw new Error(`Failed to generate task: ${error.message}`);
    }
  }

  // Private helper methods
  private executeClaudeCommand(projectPath: string, prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const claudeProcess = spawn(this.claudeBinary, [], {
        cwd: projectPath,
        env: { ...process.env }
      });
      
      let output = '';
      let errorOutput = '';
      
      claudeProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      claudeProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      claudeProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Claude process exited with code ${code}: ${errorOutput}`));
        } else {
          resolve(output);
        }
      });
      
      claudeProcess.on('error', (error) => {
        reject(error);
      });
      
      // Send prompt to Claude
      claudeProcess.stdin.write(prompt);
      claudeProcess.stdin.end();
    });
  }

  private buildTaskGenerationPrompt(
    template: string,
    planText: string,
    projectContext?: string
  ): string {
    let prompt = template;
    
    // Replace placeholders in template
    prompt = prompt.replace('{{PLAN_TEXT}}', planText);
    prompt = prompt.replace('{{PROJECT_CONTEXT}}', projectContext || 'No additional context provided');
    prompt = prompt.replace('{{TIMESTAMP}}', new Date().toISOString());
    
    return prompt;
  }

  private buildTaskReviewPrompt(
    template: string,
    currentTasks: Task[],
    changesSummary: string,
    projectContext?: string
  ): string {
    let prompt = template;
    
    // Replace placeholders in template
    prompt = prompt.replace('{{CURRENT_TASKS}}', JSON.stringify(currentTasks, null, 2));
    prompt = prompt.replace('{{CHANGES_SUMMARY}}', changesSummary);
    prompt = prompt.replace('{{PROJECT_CONTEXT}}', projectContext || 'No additional context provided');
    prompt = prompt.replace('{{TIMESTAMP}}', new Date().toISOString());
    
    return prompt;
  }

  private buildSingleTaskPrompt(
    template: string,
    description: string,
    context?: string
  ): string {
    let prompt = template;
    
    // Replace placeholders in template
    prompt = prompt.replace('{{TASK_DESCRIPTION}}', description);
    prompt = prompt.replace('{{PROJECT_CONTEXT}}', context || 'No additional context provided');
    prompt = prompt.replace('{{TIMESTAMP}}', new Date().toISOString());
    
    return prompt;
  }

  private parseGeneratedTasks(response: string): GeneratedTask[] {
    try {
      // Look for JSON code block in the response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonStr = jsonMatch[1];
      const parsed = JSON.parse(jsonStr);
      
      // Validate and normalize the tasks
      if (Array.isArray(parsed)) {
        return parsed.map(task => this.normalizeTask(task));
      } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
        return parsed.tasks.map((task: any) => this.normalizeTask(task));
      } else {
        throw new Error('Invalid task format in response');
      }
    } catch (error: any) {
      console.error('Failed to parse generated tasks:', error);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  private parseTaskUpdates(response: string): TaskUpdate[] {
    try {
      // Look for JSON code block in the response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonStr = jsonMatch[1];
      const parsed = JSON.parse(jsonStr);
      
      // Validate and normalize the updates
      if (Array.isArray(parsed)) {
        return parsed.map(update => this.normalizeTaskUpdate(update));
      } else if (parsed.updates && Array.isArray(parsed.updates)) {
        return parsed.updates.map((update: any) => this.normalizeTaskUpdate(update));
      } else {
        throw new Error('Invalid update format in response');
      }
    } catch (error: any) {
      console.error('Failed to parse task updates:', error);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  private normalizeTask(task: any): GeneratedTask {
    return {
      title: task.title || 'Untitled Task',
      description: task.description || '',
      priority: this.normalizePriority(task.priority),
      status: this.normalizeStatus(task.status),
      labels: Array.isArray(task.labels) ? task.labels : [],
      dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
      acceptanceCriteria: Array.isArray(task.acceptanceCriteria) ? task.acceptanceCriteria : []
    };
  }

  private normalizeTaskUpdate(update: any): TaskUpdate {
    return {
      taskId: update.taskId || update.id || '',
      updates: {
        title: update.updates?.title,
        description: update.updates?.description,
        priority: update.updates?.priority ? this.normalizePriority(update.updates.priority) : undefined,
        status: update.updates?.status ? this.normalizeStatus(update.updates.status) : undefined,
        labels: update.updates?.labels,
        dependencies: update.updates?.dependencies,
        acceptanceCriteria: update.updates?.acceptanceCriteria
      },
      reason: update.reason || 'No reason provided'
    };
  }

  private normalizePriority(priority: any): TaskPriority {
    const priorityStr = String(priority).toLowerCase();
    switch (priorityStr) {
      case 'critical':
        return TaskPriority.CRITICAL;
      case 'high':
        return TaskPriority.HIGH;
      case 'low':
        return TaskPriority.LOW;
      case 'medium':
      default:
        return TaskPriority.MEDIUM;
    }
  }

  private normalizeStatus(status: any): TaskStatus {
    const statusStr = String(status).toLowerCase().replace(/[\s-_]/g, '');
    switch (statusStr) {
      case 'inprogress':
      case 'doing':
        return TaskStatus.IN_PROGRESS;
      case 'done':
      case 'completed':
        return TaskStatus.DONE;
      case 'blocked':
        return TaskStatus.BLOCKED;
      case 'archived':
        return TaskStatus.ARCHIVED;
      case 'todo':
      case 'new':
      default:
        return TaskStatus.TODO;
    }
  }
}