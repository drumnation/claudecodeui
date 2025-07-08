import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createHash } from 'crypto';
import { backlogCliService } from './backlog-cli.service.js';
import { createLogger } from '@kit/logger/node';
import { resolveCli, getEnhancedEnv } from '../../lib/cliResolver.js';

const execFileAsync = promisify(execFile);
const logger = createLogger({ scope: 'backlog-service' });

// TypeScript interfaces
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  labels?: string[];
  dependencies?: string[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  metadata?: Record<string, any>;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
  BLOCKED = 'blocked',
  ARCHIVED = 'archived'
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  labels?: string[];
  dependencies?: string[];
  dueDate?: Date;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  labels?: string[];
  dependencies?: string[];
  dueDate?: Date;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string;
  labels?: string[];
  search?: string;
}

export class BacklogService {
  private async ensureCliAvailable(): Promise<void> {
    const status = await backlogCliService.checkInstallation();
    if (!status.installed) {
      throw new Error(
        'Backlog CLI is not installed. Please install it with: npm install -g backlog.md\n' +
        'If already installed, ensure npm global bin directory is in your PATH.\n' +
        'For more help, check the installation guide in the backlog tab.'
      );
    }
  }

  private encodeProjectPath(projectPath: string): string {
    return createHash('md5').update(projectPath).digest('hex');
  }

  private getBacklogPath(projectPath: string): string {
    const encodedPath = this.encodeProjectPath(projectPath);
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    return path.join(homeDir, '.claude', 'projects', encodedPath, 'backlog');
  }

  async ensureBacklogInitialized(projectPath: string): Promise<void> {
    await this.ensureCliAvailable();
    
    const backlogPath = this.getBacklogPath(projectPath);
    const backlogCommand = backlogCliService.getCommand();
    
    try {
      await fs.access(backlogPath);
      // Check if backlog is initialized by looking for .backlog directory
      await fs.access(path.join(backlogPath, '.backlog'));
    } catch (error) {
      // Create directory if it doesn't exist
      await fs.mkdir(backlogPath, { recursive: true });
      
      // Initialize backlog with enhanced environment
      try {
        const cliPath = await resolveCli('backlog', 'BACKLOG_CLI_PATH');
        const command = cliPath || backlogCommand;
        const env = getEnhancedEnv();
        
        await execFileAsync(command, ['init'], { 
          cwd: backlogPath,
          env
        });
      } catch (execError: any) {
        logger.error('Failed to initialize backlog', { error: execError, backlogPath });
        throw new Error(`Failed to initialize backlog: ${execError.message}`);
      }
    }
  }

  async listTasks(projectPath: string, filter?: TaskFilter): Promise<Task[]> {
    await this.ensureBacklogInitialized(projectPath);
    const backlogPath = this.getBacklogPath(projectPath);
    
    try {
      const cliPath = await resolveCli('backlog', 'BACKLOG_CLI_PATH');
      const command = cliPath || backlogCliService.getCommand();
      const env = getEnhancedEnv();
      
      const { stdout } = await execFileAsync(command, ['task', 'list', '--json'], { 
        cwd: backlogPath,
        env
      });
      
      let tasks: Task[] = JSON.parse(stdout);
      
      // Apply filters
      if (filter) {
        tasks = this.applyFilters(tasks, filter);
      }
      
      return tasks;
    } catch (error: any) {
      console.error('Failed to list tasks:', error);
      // Fallback to reading markdown files directly
      return this.readTasksFromMarkdown(backlogPath, filter);
    }
  }

  async createTask(projectPath: string, taskData: CreateTaskRequest): Promise<Task> {
    await this.ensureBacklogInitialized(projectPath);
    const backlogPath = this.getBacklogPath(projectPath);
    
    const args = ['task', 'create', '--title', taskData.title];
    
    if (taskData.description) {
      args.push('--description', taskData.description);
    }
    if (taskData.status) {
      args.push('--status', taskData.status);
    }
    if (taskData.priority) {
      args.push('--priority', taskData.priority);
    }
    if (taskData.assignee) {
      args.push('--assignee', taskData.assignee);
    }
    if (taskData.labels && taskData.labels.length > 0) {
      args.push('--labels', taskData.labels.join(','));
    }
    if (taskData.dependencies && taskData.dependencies.length > 0) {
      args.push('--dependencies', taskData.dependencies.join(','));
    }
    if (taskData.dueDate) {
      args.push('--due', taskData.dueDate.toISOString());
    }
    
    try {
      const cliPath = await resolveCli('backlog', 'BACKLOG_CLI_PATH');
      const command = cliPath || backlogCliService.getCommand();
      const env = getEnhancedEnv();
      
      const { stdout } = await execFileAsync(command, args, { 
        cwd: backlogPath,
        env
      });
      const taskId = this.extractTaskIdFromOutput(stdout);
      
      // Retrieve the created task
      const tasks = await this.listTasks(projectPath);
      const createdTask = tasks.find(t => t.id === taskId);
      
      if (!createdTask) {
        throw new Error('Created task not found');
      }
      
      return createdTask;
    } catch (error: any) {
      console.error('Failed to create task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  async updateTask(projectPath: string, taskId: string, updates: UpdateTaskRequest): Promise<Task> {
    await this.ensureBacklogInitialized(projectPath);
    const backlogPath = this.getBacklogPath(projectPath);
    
    const args = ['task', 'edit', taskId];
    
    if (updates.title) {
      args.push('--title', updates.title);
    }
    if (updates.description !== undefined) {
      args.push('--description', updates.description || '');
    }
    if (updates.status) {
      args.push('--status', updates.status);
    }
    if (updates.priority) {
      args.push('--priority', updates.priority);
    }
    if (updates.assignee !== undefined) {
      args.push('--assignee', updates.assignee || '');
    }
    if (updates.labels) {
      args.push('--labels', updates.labels.join(','));
    }
    if (updates.dependencies) {
      args.push('--dependencies', updates.dependencies.join(','));
    }
    if (updates.dueDate) {
      args.push('--due', updates.dueDate.toISOString());
    }
    
    try {
      const cliPath = await resolveCli('backlog', 'BACKLOG_CLI_PATH');
      const command = cliPath || backlogCliService.getCommand();
      const env = getEnhancedEnv();
      
      await execFileAsync(command, args, { 
        cwd: backlogPath,
        env
      });
      
      // Retrieve the updated task
      const tasks = await this.listTasks(projectPath);
      const updatedTask = tasks.find(t => t.id === taskId);
      
      if (!updatedTask) {
        throw new Error('Updated task not found');
      }
      
      return updatedTask;
    } catch (error: any) {
      console.error('Failed to update task:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  async deleteTask(projectPath: string, taskId: string): Promise<void> {
    await this.ensureBacklogInitialized(projectPath);
    const backlogPath = this.getBacklogPath(projectPath);
    
    try {
      const cliPath = await resolveCli('backlog', 'BACKLOG_CLI_PATH');
      const command = cliPath || backlogCliService.getCommand();
      const env = getEnhancedEnv();
      
      await execFileAsync(command, ['task', 'archive', taskId], { 
        cwd: backlogPath,
        env
      });
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async getBoardData(projectPath: string): Promise<Record<TaskStatus, Task[]>> {
    const tasks = await this.listTasks(projectPath);
    
    const board: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]: [],
      [TaskStatus.BLOCKED]: [],
      [TaskStatus.ARCHIVED]: []
    };
    
    tasks.forEach(task => {
      if (board[task.status]) {
        board[task.status].push(task);
      }
    });
    
    return board;
  }

  // Private helper methods
  private applyFilters(tasks: Task[], filter: TaskFilter): Task[] {
    return tasks.filter(task => {
      if (filter.status && filter.status.length > 0 && !filter.status.includes(task.status)) {
        return false;
      }
      
      if (filter.priority && filter.priority.length > 0 && task.priority && !filter.priority.includes(task.priority)) {
        return false;
      }
      
      if (filter.assignee && task.assignee !== filter.assignee) {
        return false;
      }
      
      if (filter.labels && filter.labels.length > 0) {
        const hasLabel = filter.labels.some(label => task.labels?.includes(label));
        if (!hasLabel) return false;
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDescription = task.description?.toLowerCase().includes(searchLower) || false;
        if (!matchesTitle && !matchesDescription) return false;
      }
      
      return true;
    });
  }

  private extractTaskIdFromOutput(output: string): string {
    // Parse task ID from CLI output
    const match = output.match(/Task created with ID: (\w+)/);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error('Could not extract task ID from output');
  }

  private async readTasksFromMarkdown(backlogPath: string, filter?: TaskFilter): Promise<Task[]> {
    // Fallback implementation to read tasks directly from markdown files
    try {
      const tasksPath = path.join(backlogPath, 'tasks');
      const files = await fs.readdir(tasksPath);
      const tasks: Task[] = [];
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(path.join(tasksPath, file), 'utf-8');
          const task = this.parseTaskFromMarkdown(content, file);
          if (task) {
            tasks.push(task);
          }
        }
      }
      
      return filter ? this.applyFilters(tasks, filter) : tasks;
    } catch (error) {
      console.error('Failed to read tasks from markdown:', error);
      return [];
    }
  }

  private parseTaskFromMarkdown(content: string, filename: string): Task | null {
    // Basic markdown parsing for task data
    try {
      const id = filename.replace('.md', '');
      const lines = content.split('\n');
      const title = lines[0].replace(/^#\s+/, '');
      
      // Parse metadata from frontmatter or content
      const task: Task = {
        id,
        title,
        status: TaskStatus.TODO,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Additional parsing logic would go here
      
      return task;
    } catch (error) {
      console.error('Failed to parse task from markdown:', error);
      return null;
    }
  }
}