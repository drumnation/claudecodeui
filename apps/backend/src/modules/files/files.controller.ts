import { Request, Response } from 'express';
import { createLogger } from '@kit/logger/node';
import { filesService } from './files.service';
import { projectsService } from '../projects/projects.service';

const logger = createLogger({ scope: 'files-controller' });

export async function handleGetProjectFiles(req: Request, res: Response) {
  try {
    const projectName = decodeURIComponent(req.params.projectName);
    logger.info('📁 Files requested for project:', projectName);
    
    // Get all projects to find the actual path
    const projects = await projectsService.getProjects();
    const project = projects.find(p => p.name === projectName);
    
    if (!project) {
      logger.error('❌ Project not found:', projectName);
      logger.info('Available projects:', projects.map(p => p.name));
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Use the actual path from the project resolution logic
    const actualPath = project.fullPath;
    logger.info('📂 Project path:', actualPath);
    logger.info('📍 Original path vs resolved path:', project.name.replace(/-/g, '/'), '->', actualPath);
    
    // Check if path exists and is a directory
    try {
      const fs = await import('fs');
      await fs.promises.access(actualPath);
      const stats = await fs.promises.lstat(actualPath);
      
      if (!stats.isDirectory()) {
        logger.error('❌ Project path is not a directory:', actualPath);
        return res.status(400).json({ 
          error: 'Project path is not a directory',
          path: actualPath,
          type: stats.isFile() ? 'file' : 'other' 
        });
      }
    } catch (e: any) {
      logger.error('❌ Project path not accessible:', actualPath);
      logger.error('Error details:', e.code, e.message);
      
      if (e.code === 'ENOENT') {
        return res.status(404).json({ 
          error: `Project directory not found: ${actualPath}`,
          suggestion: 'The project may have been moved or deleted'
        });
      } else if (e.code === 'EACCES' || e.code === 'EPERM') {
        return res.status(403).json({ 
          error: `Permission denied accessing project directory: ${actualPath}`,
          suggestion: 'Check directory permissions'
        });
      } else {
        return res.status(500).json({ 
          error: `Failed to access project directory: ${actualPath}`,
          details: e.message
        });
      }
    }
    
    // Parse optional query parameters
    const maxDepth = parseInt(req.query.depth as string) || 3;
    const showHidden = req.query.hidden !== 'false'; // Default to true
    
    logger.info('🔍 Getting file tree with maxDepth:', maxDepth, 'showHidden:', showHidden);
    
    const files = await filesService.getFileTree(actualPath, maxDepth, 0, showHidden);
    const hiddenFiles = files.filter(f => f.name.startsWith('.'));
    logger.info('📄 Found', files.length, 'files/folders, including', hiddenFiles.length, 'hidden files');
    
    if (files.length === 0) {
      logger.info('⚠️ Empty directory or access issues:', actualPath);
      // Check if it's truly empty or if we have permission issues
      try {
        const fs = await import('fs');
        const dirContents = await fs.promises.readdir(actualPath);
        if (dirContents.length === 0) {
          logger.info('📂 Directory is truly empty');
        } else {
          logger.info('⚠️ Directory has', dirContents.length, 'items but getFileTree returned empty');
        }
      } catch (e: any) {
        logger.info('⚠️ Cannot read directory contents:', e.message);
      }
    } else {
      logger.info('🔍 Sample files:', files.slice(0, 5).map(f => ({ name: f.name, type: f.type })));
    }
    
    res.json(files);
  } catch (error: any) {
    logger.error('❌ File tree error:', error.message);
    logger.error('Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
}