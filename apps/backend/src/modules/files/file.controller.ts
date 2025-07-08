import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { createLogger } from '@kit/logger/node';
import { projectsService } from '../projects/projects.service';

const logger = createLogger({ scope: 'file-controller' });

export async function handleGetFile(req: Request, res: Response) {
  try {
    const projectName = decodeURIComponent(req.params.projectName);
    const filePath = req.query.filePath as string;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    logger.info('📄 File content requested', {
      projectName,
      filePath
    });
    
    // Get all projects to find the actual path
    const projects = await projectsService.getProjects();
    const project = projects.find(p => p.name === projectName);
    
    if (!project) {
      logger.error('❌ Project not found:', projectName);
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Construct the full file path
    const fullPath = path.join(project.fullPath, filePath);
    
    // Security check: ensure the file path is within the project directory
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(project.fullPath)) {
      logger.error('❌ Security violation: Path traversal attempt', {
        requestedPath: fullPath,
        normalizedPath,
        projectPath: project.fullPath
      });
      return res.status(403).json({ error: 'Access denied: Path traversal detected' });
    }
    
    try {
      // Check if file exists and is readable
      await fs.access(fullPath, fs.constants.R_OK);
      
      // Read file content
      const content = await fs.readFile(fullPath, 'utf8');
      
      logger.info('✅ File content loaded successfully', {
        path: fullPath,
        size: content.length
      });
      
      res.json({ content });
    } catch (error: any) {
      logger.error('❌ Failed to read file', {
        path: fullPath,
        error: error.message,
        code: error.code
      });
      
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'File not found' });
      } else if (error.code === 'EACCES') {
        return res.status(403).json({ error: 'Permission denied' });
      } else if (error.code === 'EISDIR') {
        return res.status(400).json({ error: 'Path is a directory, not a file' });
      }
      
      return res.status(500).json({ error: 'Failed to read file' });
    }
  } catch (error: any) {
    logger.error('❌ File read error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function handleSaveFile(req: Request, res: Response) {
  try {
    const projectName = decodeURIComponent(req.params.projectName);
    const { filePath, content } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    logger.info('💾 File save requested', {
      projectName,
      filePath,
      contentLength: content.length
    });
    
    // Get all projects to find the actual path
    const projects = await projectsService.getProjects();
    const project = projects.find(p => p.name === projectName);
    
    if (!project) {
      logger.error('❌ Project not found:', projectName);
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Construct the full file path
    const fullPath = path.join(project.fullPath, filePath);
    
    // Security check: ensure the file path is within the project directory
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(project.fullPath)) {
      logger.error('❌ Security violation: Path traversal attempt', {
        requestedPath: fullPath,
        normalizedPath,
        projectPath: project.fullPath
      });
      return res.status(403).json({ error: 'Access denied: Path traversal detected' });
    }
    
    try {
      // Ensure the directory exists
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Write file content
      await fs.writeFile(fullPath, content, 'utf8');
      
      logger.info('✅ File saved successfully', {
        path: fullPath,
        size: content.length
      });
      
      res.json({ success: true, message: 'File saved successfully' });
    } catch (error: any) {
      logger.error('❌ Failed to save file', {
        path: fullPath,
        error: error.message,
        code: error.code
      });
      
      if (error.code === 'EACCES') {
        return res.status(403).json({ error: 'Permission denied' });
      } else if (error.code === 'ENOSPC') {
        return res.status(507).json({ error: 'No space left on device' });
      }
      
      return res.status(500).json({ error: 'Failed to save file' });
    }
  } catch (error: any) {
    logger.error('❌ File save error:', error.message);
    res.status(500).json({ error: error.message });
  }
}