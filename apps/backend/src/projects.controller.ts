import { Request, Response } from 'express';
import { createLogger } from '@kit/logger/node';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const logger = createLogger({ scope: 'projects-controller' });

interface Session {
  id: string;
  summary: string;
  messageCount: number;
  lastActivity: Date | string;
  cwd: string;
  actualProjectPath?: string;
}

interface Project {
  name: string;
  path: string | null;
  displayName: string;
  fullPath: string;
  isCustomName: boolean;
  isManuallyAdded?: boolean;
  sessions: Session[];
  sessionMeta?: {
    hasMore: boolean;
    total: number;
  };
}

function getProjectDisplayName(projectPath: string): string {
  const parts = projectPath.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1] || projectPath;
  
  // Just return the last directory name with dashes replaced by spaces
  // This is the simplest, most predictable approach
  return lastPart.replace(/-/g, ' ');
}

async function getSessionsForProject(projectPath: string, limit = 5): Promise<Session[]> {
  const sessions: Session[] = [];
  
  try {
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    // Claude Code stores sessions as .jsonl files
    const sessionFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.jsonl'));
    
    // Get file stats for sorting by modification time
    const filesWithStats = await Promise.all(
      sessionFiles.map(async (file) => {
        const stats = await fs.stat(path.join(projectPath, file.name));
        return { file, mtime: stats.mtime };
      })
    );
    
    // Sort by modification time (newest first) and take limit
    const sortedFiles = filesWithStats
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
      .slice(0, limit)
      .map(item => item.file);

    for (const sessionFile of sortedFiles) {
      const sessionPath = path.join(projectPath, sessionFile.name);
      
      try {
        // Read the JSONL file to get session info
        const content = await fs.readFile(sessionPath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        if (lines.length === 0) continue;
        
        // Parse first and last line to get session info
        const firstMessage = JSON.parse(lines[0]);
        const lastMessage = JSON.parse(lines[lines.length - 1]);
        
        // Extract session ID from filename
        const sessionId = sessionFile.name.replace('.jsonl', '');
        
        // Get summary from first line if it's a summary object
        let summary = 'No summary available';
        let projectCwd = null;
        
        try {
          const firstLine = JSON.parse(lines[0]);
          if (firstLine.type === 'summary' && firstLine.summary) {
            summary = firstLine.summary;
          }
          
          // Look for cwd in the session data
          for (const line of lines) {
            try {
              const msg = JSON.parse(line);
              if (msg.cwd) {
                projectCwd = msg.cwd;
                break;
              }
              // Fallback: look for first human message for summary
              if (!summary && msg.type === 'human' && msg.content) {
                summary = msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '');
              }
            } catch {}
          }
        } catch {}
        
        // Count messages
        const messageCount = lines.length;
        
        // Get last activity timestamp
        const lastActivity = new Date(lastMessage.timestamp || firstMessage.timestamp || Date.now());

        sessions.push({
          id: sessionId,
          summary,
          messageCount,
          lastActivity: lastActivity.toISOString(),
          cwd: projectCwd || projectPath.replace(os.homedir(), '~'),
          actualProjectPath: projectCwd // Store this for project name detection
        });
      } catch (error) {
        logger.warn('Failed to read session', { sessionPath, error });
      }
    }
  } catch (error) {
    logger.warn('Failed to read sessions', { projectPath, error });
  }

  return sessions;
}

export async function handleGetProjects(req: Request, res: Response) {
  try {
    const claudeDir = path.join(os.homedir(), '.claude', 'projects');
    const projects: Project[] = [];
    
    try {
      const entries = await fs.readdir(claudeDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const projectPath = path.join(claudeDir, entry.name);
          const sessions = await getSessionsForProject(projectPath);
          
          // Get the actual project path from sessions if available
          let fullPath = entry.name;
          let actualProjectPath = null;
          
          // Check if any session has the actual cwd
          if (sessions.length > 0) {
            for (const session of sessions) {
              if (session.actualProjectPath) {
                actualProjectPath = session.actualProjectPath;
                break;
              }
            }
          }
          
          // If we found the actual path from sessions, use it
          if (actualProjectPath) {
            fullPath = actualProjectPath;
          } else {
            // Fallback: convert dashes to slashes (less accurate)
            if (fullPath.startsWith('-')) {
              fullPath = '/' + fullPath.substring(1);
            }
            fullPath = fullPath.replace(/-/g, '/');
          }
          
          projects.push({
            name: entry.name,
            path: projectPath,
            displayName: getProjectDisplayName(fullPath),
            fullPath,
            isCustomName: false,
            sessions,
            sessionMeta: {
              hasMore: sessions.length >= 5,
              total: sessions.length
            }
          });
        }
      }
    } catch (error) {
      logger.warn('Failed to read Claude projects directory', { error });
    }
    
    // Sort projects by most recent activity
    projects.sort((a, b) => {
      const aTime = a.sessions[0]?.lastActivity || '0';
      const bTime = b.sessions[0]?.lastActivity || '0';
      return bTime.localeCompare(aTime);
    });
    
    logger.info('Returning projects', { count: projects.length });
    res.json(projects);
  } catch (error) {
    logger.error('Failed to get projects', { error });
    res.status(500).json({ error: 'Failed to get projects' });
  }
}