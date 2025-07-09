import { Request, Response } from 'express';
import { createLogger } from '@kit/logger/node';
import { filesService } from './files.service';
import { projectsService } from '../projects/projects.service';

const logger = createLogger({ scope: 'files-controller' });

export async function handleGetProjectFiles(req: Request, res: Response) {
  try {
    const rawProjectName = req.params.projectName;
    const projectName = decodeURIComponent(rawProjectName);
    logger.info('📁 Files requested for project:', {
      raw: rawProjectName,
      decoded: projectName,
      url: req.url
    });
    
    // Get all projects to find the actual path
    const projects = await projectsService.getProjects();
    logger.info('🔍 Available projects:', projects.map(p => ({
      name: p.name,
      displayName: p.displayName,
      fullPath: p.fullPath
    })));
    
    const project = projects.find(p => p.name === projectName);
    
    if (!project) {
      logger.error('❌ Project not found:', {
        searchedName: projectName,
        availableNames: projects.map(p => p.name)
      });
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Use the actual path from the project resolution logic
    const actualPath = project.fullPath;
    logger.info('📂 Project path', { path: actualPath });
    logger.info('📍 Original path vs resolved path', { 
      original: project.name.replace(/-/g, '/'), 
      resolved: actualPath 
    });
    
    // Check if path exists and is a directory
    try {
      const fs = await import('fs');
      await fs.promises.access(actualPath);
      const stats = await fs.promises.lstat(actualPath);
      
      if (!stats.isDirectory()) {
        logger.error('❌ Project path is not a directory', { actualPath });
        return res.status(400).json({ 
          error: 'Project path is not a directory',
          path: actualPath,
          type: stats.isFile() ? 'file' : 'other' 
        });
      }
    } catch (e: any) {
      logger.error('❌ Project path not accessible', { path: actualPath });
      logger.error('Error details', { code: e.code, message: e.message });
      
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
    
    logger.info('🔍 Getting file tree', { maxDepth, showHidden });
    
    const files = await filesService.getFileTree(actualPath, maxDepth, 0, showHidden);
    const hiddenFiles = files.filter(f => f.name.startsWith('.'));
    logger.info('📄 Found files/folders', { 
      total: files.length, 
      hidden: hiddenFiles.length 
    });
    
    if (files.length === 0) {
      logger.info('⚠️ Empty directory or access issues', { path: actualPath });
      // Check if it's truly empty or if we have permission issues
      try {
        const fs = await import('fs');
        const dirContents = await fs.promises.readdir(actualPath);
        if (dirContents.length === 0) {
          logger.info('📂 Directory is truly empty');
        } else {
          logger.info('⚠️ Directory has items but getFileTree returned empty', { 
            itemCount: dirContents.length 
          });
        }
      } catch (e: any) {
        logger.info('⚠️ Cannot read directory contents', { message: e.message });
      }
    } else {
      logger.info('🔍 Sample files', { 
        files: files.slice(0, 5).map(f => ({ name: f.name, type: f.type })) 
      });
    }
    
    res.json(files);
  } catch (error: any) {
    logger.error('❌ File tree error:', error.message);
    logger.error('Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
}