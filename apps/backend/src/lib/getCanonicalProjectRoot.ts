import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createLogger } from '@kit/logger/node';

const logger = createLogger({ scope: 'canonical-project-root' });

// Monorepo sentinel files that indicate a project root
const MONOREPO_SENTINELS = [
  'pnpm-workspace.yaml',
  'lerna.json',
  'nx.json',
  'turbo.json',
  'rush.json',
  'workspace.json'
];

// VCS markers that indicate a repository root
const VCS_MARKERS = ['.git', '.hg', '.svn'];

// Common manifest files that might indicate a project root
const MANIFEST_FILES = [
  'package.json',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'composer.json'
];

/**
 * Get the canonical project root for a given path
 * @param absPath - The absolute path to resolve
 * @returns The canonical project root path
 */
export async function getCanonicalProjectRoot(absPath: string): Promise<string> {
  if (!absPath) return absPath;
  
  try {
    // Ensure the path is absolute
    const resolvedPath = path.resolve(absPath);
    
    // Check if the path exists
    try {
      await fs.access(resolvedPath);
    } catch {
      logger.warn('Path does not exist', { path: resolvedPath });
      return resolvedPath;
    }
    
    // First, try to use Git to find the repository root
    try {
      const gitRoot = execSync('git rev-parse --show-toplevel', {
        cwd: resolvedPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
      }).trim();
      
      if (gitRoot) {
        try {
          await fs.access(gitRoot);
          logger.info('Found Git root', { originalPath: resolvedPath, gitRoot });
          return gitRoot;
        } catch {
          // Git root doesn't exist, continue with fallback
        }
      }
    } catch (gitError) {
      // Git command failed, continue with fallback
      logger.debug('Git detection failed, using fallback', { path: resolvedPath });
    }
    
    // Fallback: Walk up directory tree looking for project markers
    let current = resolvedPath;
    const home = os.homedir();
    const root = path.parse(current).root;
    
    while (current !== root && current !== home) {
      try {
        const entries = await fs.readdir(current);
        
        // Check for monorepo sentinel files (highest priority)
        const hasMonorepoSentinel = MONOREPO_SENTINELS.some(sentinel => 
          entries.includes(sentinel)
        );
        if (hasMonorepoSentinel) {
          logger.info('Found monorepo root', { path: current });
          return current;
        }
        
        // Check for VCS markers
        const hasVCSMarker = VCS_MARKERS.some(marker => 
          entries.includes(marker)
        );
        
        // Check for manifest files
        const hasManifest = MANIFEST_FILES.some(manifest => 
          entries.includes(manifest)
        );
        
        // If we have a VCS marker and at least one manifest, this is likely the root
        if (hasVCSMarker && hasManifest) {
          logger.info('Found project root (VCS + manifest)', { path: current });
          return current;
        }
        
        // Move up one directory
        const parent = path.dirname(current);
        if (parent === current) break; // Reached filesystem root
        current = parent;
      } catch (error) {
        logger.error('Error reading directory', { 
          path: current, 
          error: error instanceof Error ? error.message : String(error) 
        });
        break;
      }
    }
    
    // No root found, return the original path
    logger.debug('No project root found, using original path', { path: resolvedPath });
    return resolvedPath;
  } catch (error) {
    logger.error('Error in getCanonicalProjectRoot', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return absPath;
  }
}

export default getCanonicalProjectRoot;