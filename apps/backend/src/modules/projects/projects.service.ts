import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { createLogger } from '@kit/logger/node';
import { projectDetectionService } from './project-detection.service';

const logger = createLogger({ scope: 'projects-service' });

export interface Session {
  id: string;
  summary: string;
  messageCount: number;
  lastActivity: Date | string;
  cwd: string;
  actualProjectPath?: string;
}

export interface Project {
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
  language: string;
  isMonorepo: boolean;
  monorepoRoot?: string;
  isWorktree: boolean;
  mainRepoPath?: string;
  gitBranch?: string | null;
  gitStatus?: {
    modified: number;
    untracked: number;
    staged: number;
  } | null;
}

export class ProjectsService {
  private getProjectDisplayName(projectPath: string): string {
    const parts = projectPath.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1] || projectPath;
    return lastPart.replace(/-/g, ' ');
  }

  private async getSessionsForProject(projectPath: string, limit = 5): Promise<Session[]> {
    const sessions: Session[] = [];
    
    try {
      const entries = await fs.readdir(projectPath, { withFileTypes: true });
      const sessionFiles = entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.jsonl'));
      
      const filesWithStats = await Promise.all(
        sessionFiles.map(async (file) => {
          const stats = await fs.stat(path.join(projectPath, file.name));
          return { file, mtime: stats.mtime };
        })
      );
      
      const sortedFiles = filesWithStats
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
        .slice(0, limit)
        .map(item => item.file);

      for (const sessionFile of sortedFiles) {
        const sessionPath = path.join(projectPath, sessionFile.name);
        
        try {
          const content = await fs.readFile(sessionPath, 'utf8');
          const lines = content.trim().split('\n').filter(line => line.trim());
          
          if (lines.length === 0) continue;
          
          const firstMessage = JSON.parse(lines[0]);
          const lastMessage = JSON.parse(lines[lines.length - 1]);
          const sessionId = sessionFile.name.replace('.jsonl', '');
          
          let summary = 'No summary available';
          let projectCwd = null;
          
          try {
            const firstLine = JSON.parse(lines[0]);
            if (firstLine.type === 'summary' && firstLine.summary) {
              summary = firstLine.summary;
            }
            
            for (const line of lines) {
              try {
                const msg = JSON.parse(line);
                if (msg.cwd) {
                  projectCwd = msg.cwd;
                  break;
                }
                if (!summary && msg.type === 'human' && msg.content) {
                  summary = msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '');
                }
              } catch {}
            }
          } catch {}
          
          const messageCount = lines.length;
          const lastActivity = new Date(lastMessage.timestamp || firstMessage.timestamp || Date.now());

          sessions.push({
            id: sessionId,
            summary,
            messageCount,
            lastActivity: lastActivity.toISOString(),
            cwd: projectCwd || projectPath.replace(os.homedir(), '~'),
            actualProjectPath: projectCwd
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

  async getProjects(): Promise<Project[]> {
    const claudeDir = path.join(os.homedir(), '.claude', 'projects');
    const projects: Project[] = [];
    
    try {
      const entries = await fs.readdir(claudeDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const projectPath = path.join(claudeDir, entry.name);
          const sessions = await this.getSessionsForProject(projectPath);
          
          // Get the original encoded path
          const fullPath = entry.name.startsWith('-') 
            ? '/' + entry.name.substring(1).replace(/-/g, '/')
            : entry.name.replace(/-/g, '/');
          
          // Try to find the actual project path
          let actualProjectPath = fullPath;
          let resolvedPath = null;
          
          // Check if the original path exists
          try {
            await fs.access(actualProjectPath);
            const stats = await fs.lstat(actualProjectPath);
            if (stats.isDirectory()) {
              resolvedPath = actualProjectPath;
            }
          } catch {
            // Path doesn't exist or isn't accessible
          }
          
          // If original path doesn't exist or isn't a directory, try fallback paths
          if (!resolvedPath) {
            const projectBaseName = path.basename(actualProjectPath);
            const possiblePaths = [
              actualProjectPath,
              // Check with different case variations
              actualProjectPath.replace('/Dev/', '/dev/'),
              actualProjectPath.replace('/dev/', '/Dev/'),
              // Check if it's in cc-ui subdirectory
              path.join('/Users/dmieloch/Dev/experiments/cc-ui', projectBaseName),
              path.join('/Users/dmieloch/dev/experiments/cc-ui', projectBaseName),
              // Check with -original suffix
              path.join(path.dirname(actualProjectPath), `${projectBaseName}-original`),
              // Check without -original suffix
              actualProjectPath.replace('-original', ''),
              // Check current working directory
              path.join(process.cwd(), projectBaseName),
              process.cwd(), // Check exact current working directory
              // For monorepo subdirectories like 'backend', 'frontend', etc.
              path.join('/Users/dmieloch/Dev/experiments/cc-ui/claudecodeui', projectBaseName),
              path.join('/Users/dmieloch/dev/experiments/cc-ui/claudecodeui', projectBaseName),
              // Check in singularityApps locations
              path.join('/Users/dmieloch/Dev/singularityApps', projectBaseName),
              path.join('/Users/dmieloch/dev/singularityApps', projectBaseName)
            ];
            
            for (const tryPath of possiblePaths) {
              try {
                await fs.access(tryPath);
                const stats = await fs.lstat(tryPath);
                if (stats.isDirectory()) {
                  resolvedPath = tryPath;
                  logger.info(`Project path resolved from '${fullPath}' to '${resolvedPath}'`);
                  break;
                }
              } catch {
                // Continue to next path
              }
            }
            
            // Final fallback: use the original path even if it doesn't exist
            if (!resolvedPath) {
              logger.warn(`Unable to find valid directory for project '${entry.name}' at path '${fullPath}'`);
              resolvedPath = fullPath;
            }
          }
          
          actualProjectPath = resolvedPath;
          
          // Detect additional project properties
          const [language, monorepoInfo, isWorktree, mainRepoPath, gitBranch, gitStatus] = await Promise.all([
            projectDetectionService.detectLanguage(actualProjectPath),
            projectDetectionService.detectMonorepo(actualProjectPath),
            projectDetectionService.detectWorktree(actualProjectPath),
            projectDetectionService.getMainRepoPath(actualProjectPath),
            projectDetectionService.getGitBranch(actualProjectPath),
            projectDetectionService.getGitStatus(actualProjectPath)
          ]);
          
          projects.push({
            name: entry.name,
            path: projectPath,
            displayName: this.getProjectDisplayName(actualProjectPath),
            fullPath: actualProjectPath, // Use the resolved path
            isCustomName: false,
            sessions,
            sessionMeta: {
              hasMore: sessions.length >= 5,
              total: sessions.length
            },
            language,
            isMonorepo: monorepoInfo.isMonorepo,
            monorepoRoot: monorepoInfo.monorepoRoot,
            isWorktree,
            mainRepoPath,
            gitBranch,
            gitStatus
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
    
    return projects;
  }
}

export const projectsService = new ProjectsService();