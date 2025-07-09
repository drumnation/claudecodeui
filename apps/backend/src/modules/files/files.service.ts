import { promises as fs } from 'fs';
import path from 'path';
import { createLogger } from '@kit/logger/node';

const logger = createLogger({ scope: 'files-service' });

export interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeItem[];
}

export class FilesService {
  /**
   * Get file tree for a directory
   */
  async getFileTree(
    dirPath: string,
    maxDepth = 3,
    currentDepth = 0,
    showHidden = true
  ): Promise<FileTreeItem[]> {
    const items: FileTreeItem[] = [];

    // Validate directory path at the start
    try {
      const stats = await fs.lstat(dirPath);
      if (!stats.isDirectory()) {
        logger.error('getFileTree called on non-directory', { dirPath });
        if (stats.isFile()) {
          // If it's a file, return it as a single item
          return [{
            name: path.basename(dirPath),
            path: dirPath,
            type: 'file'
          }];
        }
        // For other types (symlink, etc.), return empty
        return [];
      }
    } catch (error: any) {
      logger.error('getFileTree: Cannot access path', { 
        path: dirPath, 
        code: error.code, 
        message: error.message 
      });
      
      // Return empty array for most errors, but log specific ones
      if (error.code === 'ENOTDIR') {
        logger.error('Path is not a directory', { path: dirPath });
      } else if (error.code === 'ENOENT') {
        logger.error('Path does not exist', { path: dirPath });
      }
      
      return [];
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      // If directory is empty, log it
      if (entries.length === 0 && currentDepth === 0) {
        logger.info(`📂 Directory is empty: ${dirPath}`);
      }
      
      for (const entry of entries) {
        // Debug: log all entries including hidden files
        if (entry.name.startsWith('.') && currentDepth === 0) {
          logger.debug('📁 Found hidden file/folder', { name: entry.name });
        }
        
        // Skip only heavy build directories
        if (entry.name === 'node_modules' || 
            entry.name === 'dist' || 
            entry.name === 'build') continue;
        
        const item: FileTreeItem = {
          name: entry.name,
          path: path.join(dirPath, entry.name),
          type: entry.isDirectory() ? 'directory' : 'file'
        };
        
        if (entry.isDirectory() && currentDepth < maxDepth) {
          // Recursively get subdirectories but limit depth
          try {
            // Check if we can access the directory before trying to read it
            await fs.access(item.path, fs.constants.R_OK);
            item.children = await this.getFileTree(item.path, maxDepth, currentDepth + 1, showHidden);
          } catch (e: any) {
            // Log permission errors at root level for debugging
            if (currentDepth === 0 && (e.code === 'EACCES' || e.code === 'EPERM')) {
              logger.info(`⚠️ Cannot access subdirectory: ${item.name} (${e.code})`);
            }
            item.children = [];
          }
        }
        
        items.push(item);
      }
    } catch (error: any) {
      // Log all errors with more context
      logger.error('Error reading directory', { 
        path: dirPath, 
        code: error.code, 
        message: error.message 
      });
      
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        logger.error('Permission denied - check directory permissions');
      } else if (error.code === 'ENOTDIR') {
        logger.error('Path is not a directory - this should not happen after validation');
      } else if (error.code === 'ENOENT') {
        logger.error('Directory was removed during traversal');
      }
      
      // Return empty array instead of throwing
      return [];
    }
    
    return items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }
}

export const filesService = new FilesService();