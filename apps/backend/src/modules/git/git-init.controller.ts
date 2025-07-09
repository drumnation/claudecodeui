import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from '@kit/logger/node';
import { projectsService } from '../projects/projects.service';

const execAsync = promisify(exec);
const logger = createLogger({ scope: 'git-init-controller' });

export async function handleInitializeGitRepo(req: Request, res: Response) {
  try {
    const projectName = decodeURIComponent(req.params.projectName);
    logger.info('🔧 Git initialization requested', { projectName });
    
    // Get the project to find its path
    const project = await projectsService.getProjectByName(projectName);
    
    if (!project) {
      logger.error('❌ Project not found for git init', { projectName });
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!project.canInitializeGit) {
      logger.error('❌ Project cannot initialize git', {
        projectName,
        reason: 'Project already has git or is part of existing repo'
      });
      return res.status(400).json({ 
        error: 'Cannot initialize git repository',
        reason: 'Project already has git or is part of an existing repository'
      });
    }
    
    const projectPath = project.fullPath;
    logger.info('🔧 Initializing git repository', { projectPath });
    
    try {
      // Initialize git repository
      const { stdout: initOutput, stderr: initError } = await execAsync('git init', {
        cwd: projectPath
      });
      
      if (initError) {
        logger.warn('Git init produced stderr output', { initError });
      }
      
      logger.info('✅ Git repository initialized', {
        projectPath,
        output: initOutput.trim()
      });
      
      // Optionally create an initial commit with common files
      try {
        // Create a basic .gitignore if it doesn't exist
        const { stdout: gitignoreCheck } = await execAsync('ls -la .gitignore', {
          cwd: projectPath
        }).catch(() => ({ stdout: '', stderr: '' }));
        
        if (!gitignoreCheck) {
          // Create a basic .gitignore
          const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Editor directories and files
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Temporary files
*.tmp
*.temp
`;
          
          await execAsync(`echo '${gitignoreContent}' > .gitignore`, {
            cwd: projectPath
          });
          
          logger.info('📝 Created basic .gitignore file', { projectPath });
        }
        
        // Add all files to staging
        await execAsync('git add .', {
          cwd: projectPath
        });
        
        // Create initial commit
        await execAsync('git commit -m "Initial commit"', {
          cwd: projectPath
        });
        
        logger.info('📝 Created initial commit', { projectPath });
        
        res.json({
          success: true,
          message: 'Git repository initialized successfully',
          details: {
            initialized: true,
            initialCommit: true,
            gitignoreCreated: !gitignoreCheck
          }
        });
        
      } catch (commitError: any) {
        // If commit fails, still return success for git init
        logger.warn('Failed to create initial commit', {
          projectPath,
          error: commitError.message
        });
        
        res.json({
          success: true,
          message: 'Git repository initialized successfully',
          details: {
            initialized: true,
            initialCommit: false,
            warning: 'Could not create initial commit'
          }
        });
      }
      
    } catch (gitError: any) {
      logger.error('❌ Failed to initialize git repository', {
        projectPath,
        error: gitError.message,
        stderr: gitError.stderr,
        stdout: gitError.stdout
      });
      
      return res.status(500).json({
        error: 'Failed to initialize git repository',
        details: gitError.message
      });
    }
    
  } catch (error: any) {
    logger.error('❌ Git initialization error', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
}

export async function handleCheckGitStatus(req: Request, res: Response) {
  try {
    const projectName = decodeURIComponent(req.params.projectName);
    
    const project = await projectsService.getProjectByName(projectName);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({
      canInitializeGit: project.canInitializeGit || false,
      hasGit: !!project.gitBranch,
      isMonorepo: project.isMonorepo,
      gitBranch: project.gitBranch
    });
    
  } catch (error: any) {
    logger.error('❌ Error checking git status', { error: error.message });
    res.status(500).json({ error: error.message });
  }
}