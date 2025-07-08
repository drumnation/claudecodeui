import { Request, Response } from 'express';
import { BacklogService, TaskFilter, CreateTaskRequest, UpdateTaskRequest } from './modules/backlog/backlog.service.js';
import { AiPlanningService } from './modules/backlog/ai-planning.service.js';
import { projectsService } from './modules/projects/projects.service.js';
import { backlogCliService } from './modules/backlog/backlog-cli.service.js';
import { createLogger } from '@kit/logger/node';

// Initialize services
const backlogService = new BacklogService();
const aiPlanningService = new AiPlanningService();
const logger = createLogger({ scope: 'backlog-controller' });

// GET /api/projects/:projectName/backlog
export async function handleGetBacklog(req: Request, res: Response) {
  try {
    const { projectName } = req.params;
    const project = await projectsService.getProjectByName(projectName);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const projectPath = project.fullPath;
    
    // Parse filter parameters from query
    const filter: TaskFilter = {};
    
    if (req.query.status) {
      filter.status = Array.isArray(req.query.status) 
        ? req.query.status as any[]
        : [req.query.status as any];
    }
    
    if (req.query.priority) {
      filter.priority = Array.isArray(req.query.priority)
        ? req.query.priority as any[]
        : [req.query.priority as any];
    }
    
    if (req.query.assignee) {
      filter.assignee = req.query.assignee as string;
    }
    
    if (req.query.labels) {
      filter.labels = Array.isArray(req.query.labels)
        ? req.query.labels as string[]
        : [req.query.labels as string];
    }
    
    if (req.query.search) {
      filter.search = req.query.search as string;
    }
    
    const tasks = await backlogService.listTasks(projectPath, filter);
    res.json({ success: true, tasks });
  } catch (error: any) {
    console.error('Error getting backlog:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get backlog' 
    });
  }
}

// POST /api/projects/:projectName/backlog/tasks
export async function handleCreateTask(req: Request, res: Response) {
  try {
    const { projectName } = req.params;
    const project = await projectsService.getProjectByName(projectName);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const projectPath = project.fullPath;
    
    const taskData: CreateTaskRequest = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      assignee: req.body.assignee,
      labels: req.body.labels,
      dependencies: req.body.dependencies,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
    };
    
    // Validate required fields
    if (!taskData.title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Task title is required' 
      });
    }
    
    const task = await backlogService.createTask(projectPath, taskData);
    res.json({ success: true, task });
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create task' 
    });
  }
}

// PUT /api/projects/:projectName/backlog/tasks/:taskId
export async function handleUpdateTask(req: Request, res: Response) {
  try {
    const { projectName, taskId } = req.params;
    const project = await projectsService.getProjectByName(projectName);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const projectPath = project.fullPath;
    
    const updates: UpdateTaskRequest = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      assignee: req.body.assignee,
      labels: req.body.labels,
      dependencies: req.body.dependencies,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
    };
    
    // Remove undefined fields
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof UpdateTaskRequest] === undefined) {
        delete updates[key as keyof UpdateTaskRequest];
      }
    });
    
    const task = await backlogService.updateTask(projectPath, taskId, updates);
    res.json({ success: true, task });
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update task' 
    });
  }
}

// DELETE /api/projects/:projectName/backlog/tasks/:taskId
export async function handleDeleteTask(req: Request, res: Response) {
  try {
    const { projectName, taskId } = req.params;
    const project = await projectsService.getProjectByName(projectName);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const projectPath = project.fullPath;
    
    await backlogService.deleteTask(projectPath, taskId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete task' 
    });
  }
}

// GET /api/projects/:projectName/backlog/board
export async function handleGetBoard(req: Request, res: Response) {
  try {
    const { projectName } = req.params;
    const project = await projectsService.getProjectByName(projectName);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const projectPath = project.fullPath;
    
    const board = await backlogService.getBoardData(projectPath);
    res.json({ success: true, board });
  } catch (error: any) {
    console.error('Error getting board:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get board' 
    });
  }
}

// POST /api/projects/:projectName/backlog/plan
export async function handleGenerateTasks(req: Request, res: Response) {
  try {
    const { projectName } = req.params;
    const project = await projectsService.getProjectByName(projectName);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const projectPath = project.fullPath;
    
    const { planText, projectContext } = req.body;
    
    if (!planText) {
      return res.status(400).json({ 
        success: false, 
        error: 'Planning text is required' 
      });
    }
    
    // Generate tasks using AI
    const generatedTasks = await aiPlanningService.generateTasksFromPlan(
      projectPath,
      planText,
      projectContext
    );
    
    // Create tasks in backlog
    const createdTasks = [];
    for (const taskData of generatedTasks) {
      try {
        const task = await backlogService.createTask(projectPath, {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          labels: taskData.labels,
          dependencies: taskData.dependencies
        });
        createdTasks.push(task);
      } catch (error) {
        console.error('Failed to create generated task:', error);
      }
    }
    
    res.json({ 
      success: true, 
      generatedTasks,
      createdTasks,
      failedCount: generatedTasks.length - createdTasks.length
    });
  } catch (error: any) {
    console.error('Error generating tasks:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate tasks' 
    });
  }
}

// POST /api/projects/:projectName/backlog/review
export async function handleReviewTasks(req: Request, res: Response) {
  try {
    const { projectName } = req.params;
    const project = await projectsService.getProjectByName(projectName);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const projectPath = project.fullPath;
    
    const { changesSummary, projectContext } = req.body;
    
    if (!changesSummary) {
      return res.status(400).json({ 
        success: false, 
        error: 'Changes summary is required' 
      });
    }
    
    // Get current tasks
    const currentTasks = await backlogService.listTasks(projectPath);
    
    // Review tasks using AI
    const taskUpdates = await aiPlanningService.reviewAndUpdateTasks(
      projectPath,
      currentTasks,
      changesSummary,
      projectContext
    );
    
    // Apply updates
    const updatedTasks = [];
    const failedUpdates = [];
    
    for (const update of taskUpdates) {
      try {
        const task = await backlogService.updateTask(
          projectPath,
          update.taskId,
          update.updates as UpdateTaskRequest
        );
        updatedTasks.push({ task, reason: update.reason });
      } catch (error) {
        console.error('Failed to apply task update:', error);
        failedUpdates.push({ taskId: update.taskId, error });
      }
    }
    
    res.json({ 
      success: true, 
      updatedTasks,
      failedUpdates,
      totalReviewed: taskUpdates.length
    });
  } catch (error: any) {
    console.error('Error reviewing tasks:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to review tasks' 
    });
  }
}

// GET /api/backlog/health
export async function handleBacklogHealth(req: Request, res: Response) {
  try {
    const status = await backlogCliService.checkInstallation();
    
    if (status.installed) {
      res.json({
        status: 'healthy',
        backlogAvailable: true,
        backlogVersion: status.version,
        backlogPath: status.path,
        message: 'Backlog CLI is available and ready'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        backlogAvailable: false,
        error: status.error || 'Backlog CLI not found',
        installInstructions: 'Use the install endpoint or run: npm install -g backlog.md'
      });
    }
  } catch (error: any) {
    logger.error('Error checking backlog health', { error });
    res.status(500).json({
      status: 'error',
      backlogAvailable: false,
      error: error.message || 'Failed to check backlog status'
    });
  }
}

// POST /api/backlog/install
export async function handleBacklogInstall(req: Request, res: Response) {
  try {
    // Check if already installed
    const currentStatus = await backlogCliService.checkInstallation();
    if (currentStatus.installed) {
      return res.json({
        success: true,
        alreadyInstalled: true,
        version: currentStatus.version,
        message: 'Backlog is already installed'
      });
    }

    // Stream installation progress
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const sendProgress = (progress: any) => {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    };

    try {
      const result = await backlogCliService.installBacklog(sendProgress);
      
      sendProgress({
        status: 'completed',
        message: 'Installation completed successfully',
        version: result.version,
        progress: 100
      });
      
      res.end();
    } catch (error: any) {
      sendProgress({
        status: 'failed',
        message: error.message,
        progress: 0
      });
      
      res.end();
    }
  } catch (error: any) {
    logger.error('Error installing backlog', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to install backlog'
    });
  }
}

// GET /api/backlog/install-instructions
export async function handleBacklogInstallInstructions(req: Request, res: Response) {
  try {
    const instructions = await backlogCliService.getInstallInstructions();
    res.json({
      success: true,
      instructions,
      format: 'markdown'
    });
  } catch (error: any) {
    logger.error('Error getting install instructions', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get install instructions'
    });
  }
}