import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { createLogger } from '@kit/logger/node';
import { projectDetectionService } from './project-detection.service';
import { getCanonicalProjectRoot } from '../../lib/getCanonicalProjectRoot';

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
  private decodeProjectPath(encoded: string): string {
    // First check if this is a base64url encoded path
    try {
      // Try to decode as base64url
      const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
      // Verify it looks like a path
      if (decoded.startsWith('/') || decoded.match(/^[A-Z]:\\/)) {
        return decoded;
      }
    } catch (e) {
      // Not valid base64url, continue to legacy handling
    }
    
    // Legacy dash-based decoding
    // Remove leading dash if present
    const normalized = encoded.startsWith('-') ? encoded.substring(1) : encoded;
    
    // Known patterns where dashes should be preserved
    // This is a temporary workaround for paths with actual dashes
    const knownPatterns = [
      // Match patterns like singularity-core, claude-code-worktree
      /singularity-core/,
      /claude-code-worktree/,
      /mind-control/,
      // Common patterns with dashes
      /[a-z]+-[a-z]+/
    ];
    
    // Check if this path contains known patterns that should preserve dashes
    let decodedPath = normalized;
    let hasKnownPattern = false;
    
    for (const pattern of knownPatterns) {
      if (pattern.test(normalized)) {
        hasKnownPattern = true;
        break;
      }
    }
    
    if (hasKnownPattern) {
      // More careful replacement - only replace dashes between major path components
      // Split by common path separators in the encoded format
      const parts = normalized.split('-');
      const pathParts = [];
      let current = '';
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        // Check if this looks like a path component separator
        if (part === 'Users' || part === 'home' || part === 'var' || 
            part === 'opt' || part === 'Dev' || part === 'dev' ||
            part === 'Documents' || part === 'Desktop' || part === 'Downloads' ||
            /^[A-Z][a-z]*$/.test(part)) {
          // This looks like a path component
          if (current) {
            pathParts.push(current);
          }
          current = part;
        } else {
          // This might be part of a hyphenated name
          current = current ? current + '-' + part : part;
        }
      }
      
      if (current) {
        pathParts.push(current);
      }
      
      decodedPath = '/' + pathParts.join('/');
    } else {
      // Simple dash replacement for paths without known patterns
      decodedPath = '/' + normalized.replace(/-/g, '/');
    }
    
    return decodedPath;
  }

  private async getProjectDisplayName(projectPath: string): Promise<string> {
    try {
      // Read package.json from the canonical root
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = await fs.readFile(packageJsonPath, 'utf8');
      const parsed = JSON.parse(packageJson);
      
      if (parsed.name) {
        return parsed.name;
      }
    } catch {
      // Fall back to directory name if package.json doesn't exist or has no name
    }
    
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
          // Use proper decoding to handle both legacy dash-based and new base64url formats
          const decodedPath = this.decodeProjectPath(entry.name);
          
          // Try to use the session's cwd if available for better project resolution
          let actualProjectPath = decodedPath;
          if (sessions.length > 0) {
            // Look for a session with a cwd
            const sessionWithCwd = sessions.find(s => s.actualProjectPath);
            if (sessionWithCwd && sessionWithCwd.actualProjectPath) {
              actualProjectPath = sessionWithCwd.actualProjectPath;
              logger.info('Using session cwd for project resolution', {
                sessionCwd: actualProjectPath,
                originalPath: decodedPath
              });
            }
          }
          
          // Get the canonical project root
          const canonicalRoot = await getCanonicalProjectRoot(actualProjectPath);
          logger.info('Resolved project to canonical root', {
            encoded: entry.name,
            decoded: decodedPath,
            actualPath: actualProjectPath,
            canonical: canonicalRoot
          });
          
          // Detect additional project properties using the canonical root
          const [language, monorepoInfo, isWorktree, mainRepoPath, gitBranch, gitStatus, displayName] = await Promise.all([
            projectDetectionService.detectLanguage(canonicalRoot),
            projectDetectionService.detectMonorepo(canonicalRoot),
            projectDetectionService.detectWorktree(canonicalRoot),
            projectDetectionService.getMainRepoPath(canonicalRoot),
            projectDetectionService.getGitBranch(canonicalRoot),
            projectDetectionService.getGitStatus(canonicalRoot),
            this.getProjectDisplayName(canonicalRoot)
          ]);
          
          projects.push({
            name: entry.name,
            path: projectPath,
            displayName,
            fullPath: canonicalRoot, // Use the canonical root
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
            mainRepoPath: mainRepoPath || undefined,
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
      const aTimeStr = typeof aTime === 'string' ? aTime : aTime.toISOString();
      const bTimeStr = typeof bTime === 'string' ? bTime : bTime.toISOString();
      return bTimeStr.localeCompare(aTimeStr);
    });
    
    return projects;
  }
}

export const projectsService = new ProjectsService();