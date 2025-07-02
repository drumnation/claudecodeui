import {Router} from 'express';
import type {Request, Response} from 'express';
import {promises as fs} from 'fs';
import path from 'path';

export const createFileRoutes = (): Router => {
  const router = Router({mergeParams: true});

  // Read file content
  router.get('/file', async (req: Request, res: Response) => {
    try {
      const {projectName} = req.params;
      const {filePath} = req.query;

      console.log('📄 File read request:', projectName, filePath);

      // Security check - ensure the path is safe and absolute
      if (
        !filePath ||
        typeof filePath !== 'string' ||
        !path.isAbsolute(filePath)
      ) {
        return res.status(400).json({error: 'Invalid file path'});
      }

      const content = await fs.readFile(filePath, 'utf8');
      res.json({content, path: filePath});
    } catch (error: any) {
      console.error('Error reading file:', error);
      if (error.code === 'ENOENT') {
        res.status(404).json({error: 'File not found'});
      } else if (error.code === 'EACCES') {
        res.status(403).json({error: 'Permission denied'});
      } else {
        res.status(500).json({error: error.message});
      }
    }
  });

  // Serve binary file content
  router.get('/files/content', async (req: Request, res: Response) => {
    try {
      const {projectName} = req.params;
      const {path: filePath} = req.query;

      console.log('🖼️ Binary file serve request:', projectName, filePath);

      // Security check
      if (
        !filePath ||
        typeof filePath !== 'string' ||
        !path.isAbsolute(filePath)
      ) {
        return res.status(400).json({error: 'Invalid file path'});
      }

      // Check if file exists
      try {
        await fs.access(filePath, fs.constants.R_OK);
      } catch {
        return res.status(404).json({error: 'File not found'});
      }

      // Send the file
      res.sendFile(filePath);
    } catch (error: any) {
      console.error('Error serving binary file:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Write file content
  router.post('/file', async (req: Request, res: Response) => {
    try {
      const {projectName} = req.params;
      const {filePath, content, backup = true} = req.body;

      console.log('💾 File write request:', projectName, filePath);

      // Security check
      if (!filePath || !path.isAbsolute(filePath)) {
        return res.status(400).json({error: 'Invalid file path'});
      }

      // Create backup if requested
      if (
        backup &&
        (await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false))
      ) {
        const backupPath = `${filePath}.backup-${Date.now()}`;
        await fs.copyFile(filePath, backupPath);
        console.log('📋 Created backup:', backupPath);
      }

      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, {recursive: true});

      // Write the file
      await fs.writeFile(filePath, content, 'utf8');

      res.json({success: true, path: filePath});
    } catch (error: any) {
      console.error('Error writing file:', error);
      if (error.code === 'EACCES') {
        res.status(403).json({error: 'Permission denied'});
      } else {
        res.status(500).json({error: error.message});
      }
    }
  });

  // List files in directory
  router.get('/files', async (req: Request, res: Response) => {
    try {
      const {projectName} = req.params;
      const {dirPath} = req.query;

      console.log('📁 Directory listing request:', projectName, dirPath);

      // Security check
      if (
        !dirPath ||
        typeof dirPath !== 'string' ||
        !path.isAbsolute(dirPath)
      ) {
        return res.status(400).json({error: 'Invalid directory path'});
      }

      const entries = await fs.readdir(dirPath, {withFileTypes: true});

      const files = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          try {
            const stats = await fs.stat(fullPath);
            return {
              name: entry.name,
              path: fullPath,
              isDirectory: entry.isDirectory(),
              size: stats.size,
              modified: stats.mtime,
            };
          } catch (error) {
            // Handle permission errors gracefully
            return {
              name: entry.name,
              path: fullPath,
              isDirectory: entry.isDirectory(),
              size: 0,
              modified: new Date(),
              error: 'Permission denied',
            };
          }
        }),
      );

      res.json({files, path: dirPath});
    } catch (error: any) {
      console.error('Error listing directory:', error);
      if (error.code === 'ENOENT') {
        res.status(404).json({error: 'Directory not found'});
      } else if (error.code === 'EACCES') {
        res.status(403).json({error: 'Permission denied'});
      } else if (error.code === 'ENOTDIR') {
        res.status(400).json({error: 'Path is not a directory'});
      } else {
        res.status(500).json({error: error.message});
      }
    }
  });

  return router;
};
