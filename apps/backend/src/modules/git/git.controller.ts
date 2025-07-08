import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { promises as fs } from 'fs';
import { createLogger } from '@kit/logger/node';
import { projectsService } from '../projects/projects.service';

const execAsync = promisify(exec);
const logger = createLogger({ scope: 'git-controller' });

// Helper function to get the actual project path from the encoded project name
async function getActualProjectPath(projectName: string): Promise<string> {
  logger.info('Getting actual project path', { projectName });
  
  // Get all projects to find the actual path
  const projects = await projectsService.getProjects();
  
  // Try to find the project by exact name match first
  const project = projects.find(p => p.name === projectName);
  
  if (project && project.fullPath) {
    logger.info('Found project by name', { name: project.name, fullPath: project.fullPath });
    return project.fullPath;
  }
  
  // If not found, try without leading dash
  const normalizedProjectName = projectName.replace(/^-/, '');
  const normalizedProject = projects.find(p => p.name === normalizedProjectName || p.name === `-${normalizedProjectName}`);
  
  if (normalizedProject && normalizedProject.fullPath) {
    logger.info('Found project by normalized name', { name: normalizedProject.name, fullPath: normalizedProject.fullPath });
    return normalizedProject.fullPath;
  }
  
  logger.warn('Project not found in list, using fallback', { projectName, availableProjects: projects.map(p => p.name) });
  
  // Fallback: This should not happen in normal operation
  // but we keep it for backward compatibility
  const cleanedName = projectName.replace(/^-/, '');
  const simplePath = '/' + cleanedName.replace(/-/g, '/');
  return simplePath;
}

export async function handleGitStatus(req: Request, res: Response) {
  const { project } = req.query;
  
  logger.debug('Git status endpoint called', { queryParams: req.query, project });
  
  if (!project) {
    logger.error('Git status: No project name provided');
    return res.status(400).json({ error: 'Project name is required' });
  }

  // Validate project parameter format
  if (typeof project !== 'string' || project.length === 0) {
    logger.error('Git status: Invalid project parameter format', { project });
    return res.status(400).json({ error: 'Invalid project parameter format' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    logger.info('Git status request', {
      originalProject: project,
      resolvedPath: projectPath,
      cwd: process.cwd()
    });
    
    // Check if directory exists
    try {
      await fs.access(projectPath);
      logger.debug('Directory exists', { projectPath });
    } catch (err) {
      logger.error('Project path not found', { path: projectPath, error: (err as Error).message });
      return res.json({ error: `Project directory not found: ${projectPath}. Please ensure the project exists and is accessible.` });
    }

    // Check if it's a git repository
    try {
      await execAsync('git rev-parse --git-dir', { cwd: projectPath });
    } catch (err) {
      logger.error('Not a git repository', { path: projectPath, error: (err as Error).message });
      return res.json({ error: `Not a git repository: ${projectPath}. Initialize with 'git init' to use version control.` });
    }

    // Get current branch
    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath });
    
    // Get git status
    const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: projectPath });
    logger.debug('Git status output', {
      length: statusOutput.length,
      preview: statusOutput ? statusOutput.substring(0, 200) : 'EMPTY'
    });
    
    const modified: string[] = [];
    const added: string[] = [];
    const deleted: string[] = [];
    const untracked: string[] = [];
    
    statusOutput.split('\n').forEach(line => {
      if (!line.trim()) return;
      
      const status = line.substring(0, 2);
      const file = line.substring(3);
      
      logger.trace('Git file status', { file, status });
      
      if (status === 'M ' || status === ' M' || status === 'MM') {
        modified.push(file);
      } else if (status === 'A ' || status === 'AM') {
        added.push(file);
      } else if (status === 'D ' || status === ' D') {
        deleted.push(file);
      } else if (status === '??') {
        untracked.push(file);
      }
    });
    
    logger.info('Git status summary', {
      modified: modified.length,
      added: added.length,
      deleted: deleted.length,
      untracked: untracked.length
    });
    
    res.json({
      branch: branch.trim(),
      modified,
      added,
      deleted,
      untracked
    });
  } catch (error) {
    logger.error('Git status error', { error });
    res.json({ error: (error as Error).message });
  }
}

export async function handleGitBranches(req: Request, res: Response) {
  const { project } = req.query;
  
  if (!project) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const projectPath = await getActualProjectPath(project as string);
    logger.info('Git branches request', { project, projectPath });
    
    // Get all branches
    const { stdout } = await execAsync('git branch -a', { cwd: projectPath });
    
    // Parse branches
    const branches = stdout
      .split('\n')
      .map(branch => branch.trim())
      .filter(branch => branch && !branch.includes('->')) // Remove empty lines and HEAD pointer
      .map(branch => {
        // Remove asterisk from current branch
        if (branch.startsWith('* ')) {
          return branch.substring(2);
        }
        // Remove remotes/ prefix
        if (branch.startsWith('remotes/origin/')) {
          return branch.substring(15);
        }
        return branch;
      })
      .filter((branch, index, self) => self.indexOf(branch) === index); // Remove duplicates
    
    res.json({ branches });
  } catch (error) {
    logger.error('Git branches error', { error });
    res.json({ error: (error as Error).message });
  }
}

export async function handleGitDiff(req: Request, res: Response) {
  const { project, file } = req.query;
  
  if (!project || !file) {
    return res.status(400).json({ error: 'Project name and file path are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project as string);
    
    // Check if file is untracked
    const { stdout: statusOutput } = await execAsync(
      `git status --porcelain "${file}"`, 
      { cwd: projectPath }
    );
    const isUntracked = statusOutput.startsWith('??');
    
    let diff: string;
    if (isUntracked) {
      // For untracked files, show the entire file content as additions
      const fileContent = await fs.readFile(path.join(projectPath, file as string), 'utf-8');
      const lines = fileContent.split('\n');
      diff = `--- /dev/null\n+++ b/${file}\n@@ -0,0 +1,${lines.length} @@\n` + 
             lines.map(line => `+${line}`).join('\n');
    } else {
      // Get diff for tracked files
      const { stdout } = await execAsync(`git diff HEAD -- "${file}"`, { cwd: projectPath });
      diff = stdout || '';
      
      // If no unstaged changes, check for staged changes
      if (!diff) {
        const { stdout: stagedDiff } = await execAsync(
          `git diff --cached -- "${file}"`, 
          { cwd: projectPath }
        );
        diff = stagedDiff;
      }
    }
    
    res.json({ diff });
  } catch (error) {
    logger.error('Git diff error', { error });
    res.json({ error: (error as Error).message });
  }
}

export async function handleGitCommit(req: Request, res: Response) {
  const { project, message, files } = req.body;
  
  if (!project || !message || !files || files.length === 0) {
    return res.status(400).json({ error: 'Project name, commit message, and files are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Stage selected files
    for (const file of files) {
      await execAsync(`git add "${file}"`, { cwd: projectPath });
    }
    
    // Commit with message
    const { stdout } = await execAsync(
      `git commit -m "${message.replace(/"/g, '\\"')}"`, 
      { cwd: projectPath }
    );
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    logger.error('Git commit error', { error });
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function handleGitCheckout(req: Request, res: Response) {
  const { project, branch } = req.body;
  
  if (!project || !branch) {
    return res.status(400).json({ error: 'Project name and branch are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Checkout the branch
    const { stdout } = await execAsync(`git checkout "${branch}"`, { cwd: projectPath });
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    logger.error('Git checkout error', { error });
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function handleGitCreateBranch(req: Request, res: Response) {
  const { project, branch } = req.body;
  
  if (!project || !branch) {
    return res.status(400).json({ error: 'Project name and branch name are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Create and checkout new branch
    const { stdout } = await execAsync(`git checkout -b "${branch}"`, { cwd: projectPath });
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    logger.error('Git create branch error', { error });
    res.status(500).json({ error: (error as Error).message });
  }
}