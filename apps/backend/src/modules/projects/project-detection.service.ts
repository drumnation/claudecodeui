import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createLogger } from '@kit/logger/node';

const logger = createLogger({ scope: 'project-detection' });

// Monorepo-specific config files
const MONOREPO_CONFIGS = [
  'pnpm-workspace.yaml',
  'lerna.json',
  'nx.json',
  'turbo.json',
  'rush.json',
  'workspace.json'
];

export class ProjectDetectionService {
  /**
   * Detect the primary language of a project based on its manifest files
   */
  async detectLanguage(projPath: string): Promise<string> {
    if (!projPath) return 'Unknown';
    
    try {
      // Check if path exists before trying to read it
      try {
        await fs.access(projPath);
      } catch {
        return 'Unknown';
      }
      
      const entries = await fs.readdir(projPath);
      
      // Check in priority order
      if (entries.includes('Cargo.toml')) return 'Rust';
      if (entries.includes('go.mod')) return 'Go';
      if (entries.includes('pyproject.toml') || entries.includes('setup.py') || entries.includes('requirements.txt')) return 'Python';
      if (entries.includes('package.json')) return 'JavaScript/TypeScript';
      if (entries.includes('pom.xml') || entries.includes('build.gradle') || entries.includes('build.gradle.kts')) return 'Java/Kotlin';
      if (entries.some(e => e.endsWith('.csproj') || e.endsWith('.sln'))) return 'C#/.NET';
      if (entries.includes('CMakeLists.txt') || entries.includes('Makefile') || entries.includes('makefile')) return 'C/C++';
      if (entries.includes('pubspec.yaml')) return 'Dart/Flutter';
      if (entries.includes('mix.exs')) return 'Elixir';
      if (entries.includes('build.sbt')) return 'Scala';
      if (entries.includes('Gemfile') || entries.some(e => e.endsWith('.gemspec'))) return 'Ruby';
      if (entries.includes('composer.json')) return 'PHP';
      if (entries.includes('WORKSPACE') || entries.includes('BUILD') || entries.includes('BUILD.bazel')) return 'Bazel';
      
      // Fallback: guess from directory name patterns
      const dirName = path.basename(projPath).toLowerCase();
      const fullPathLower = projPath.toLowerCase();
      
      // JavaScript/TypeScript patterns
      const jsPatterns = [
        'frontend', 'backend', 'ui', 'web', 'api', 'server', 'client', 'app', 'apps',
        'src', 'lib', 'dist', 'build', 'public', 'static', 'assets', 'components',
        'pages', 'views', 'routes', 'controllers', 'models', 'services', 'utils',
        'admin', 'dashboard', 'portal', 'platform', 'console', 'panel',
        'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'node',
        'typescript', 'javascript', 'express', 'nest', 'fastify'
      ];
      
      // Check if directory name matches any JS pattern
      for (const pattern of jsPatterns) {
        if (dirName.includes(pattern)) {
          return 'JavaScript/TypeScript';
        }
      }
      
      // Check for specific project types by directory structure
      if (fullPathLower.includes('/experiments/') || fullPathLower.includes('/dev/') || 
          fullPathLower.includes('/projects/') || fullPathLower.includes('/code/')) {
        // Most experiments and dev projects are JS/TS
        return 'JavaScript/TypeScript';
      }
      
      // Documentation
      if (dirName === 'docs' || dirName === 'documentation' || dirName.includes('doc')) {
        return 'Documentation';
      }
      
      // Default to JavaScript/TypeScript for most projects
      return 'JavaScript/TypeScript';
    } catch (error) {
      return 'JavaScript/TypeScript'; // Safe default
    }
  }

  /**
   * Detect if this is a monorepo and find the root
   */
  async detectMonorepo(projPath: string): Promise<{ isMonorepo: boolean; monorepoRoot?: string }> {
    if (!projPath) {
      return { isMonorepo: false };
    }
    
    try {
      // Check if the path exists
      await fs.access(projPath);
      
      // Check for monorepo config files
      const entries = await fs.readdir(projPath);
      const hasMonorepoConfig = MONOREPO_CONFIGS.some(config => entries.includes(config));
      
      if (hasMonorepoConfig) {
        return { isMonorepo: true, monorepoRoot: projPath };
      }
      
      // Check parent directories for monorepo configs
      let current = projPath;
      const root = path.parse(current).root;
      
      while (current !== root) {
        const parent = path.dirname(current);
        if (parent === current) break;
        
        try {
          const parentEntries = await fs.readdir(parent);
          const parentHasMonorepoConfig = MONOREPO_CONFIGS.some(config => parentEntries.includes(config));
          
          if (parentHasMonorepoConfig) {
            return { isMonorepo: true, monorepoRoot: parent };
          }
        } catch {
          // Can't read parent directory
        }
        
        current = parent;
      }
      
      return { isMonorepo: false };
    } catch {
      return { isMonorepo: false };
    }
  }

  /**
   * Detect if a directory is a Git worktree
   */
  async detectWorktree(projPath: string): Promise<boolean> {
    if (!projPath) return false;
    
    try {
      // First check if the directory exists
      await fs.access(projPath);
    } catch {
      return false;
    }
    
    const gitPath = path.join(projPath, '.git');
    
    try {
      // Check if .git is a file (not a directory)
      const stat = await fs.lstat(gitPath);
      if (stat.isFile()) {
        // In worktrees, .git is a file containing "gitdir: /path/to/repo/.git/worktrees/name"
        try {
          const content = await fs.readFile(gitPath, 'utf8');
          return content.includes('gitdir:') && content.includes('/.git/worktrees/');
        } catch {
          return true; // If .git is a file but can't read it, assume it's a worktree
        }
      }
      
      // Use git command as fallback
      try {
        const gitDir = execSync('git rev-parse --git-dir', { 
          cwd: projPath, 
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
        }).trim();
        
        // Check if the git directory is inside a worktrees folder
        return gitDir.includes('/.git/worktrees/');
      } catch {
        // Git command failed, not a worktree
        return false;
      }
    } catch {
      // No .git at all, definitely not a worktree
      return false;
    }
  }

  /**
   * Get the main repository path for a worktree
   */
  async getMainRepoPath(projPath: string): Promise<string | null> {
    if (!projPath) return null;
    
    const gitPath = path.join(projPath, '.git');
    
    try {
      const stat = await fs.lstat(gitPath);
      if (stat.isFile()) {
        const content = await fs.readFile(gitPath, 'utf8');
        const match = content.match(/gitdir:\s*(.+)/);
        if (match && match[1]) {
          // Extract the main repo path from the worktree git directory
          const worktreeGitPath = match[1].trim();
          // Remove the .git/worktrees/name part to get the main repo path
          const mainRepoPath = worktreeGitPath.replace(/\/\.git\/worktrees\/[^\/]+$/, '');
          return mainRepoPath;
        }
      }
    } catch {
      // Ignore errors
    }
    
    return null;
  }

  /**
   * Get the current git branch for a project
   */
  async getGitBranch(projPath: string): Promise<string | null> {
    if (!projPath) return null;
    
    try {
      // Check if directory exists and has .git
      await fs.access(projPath);
      const gitPath = path.join(projPath, '.git');
      await fs.access(gitPath);
      
      // Use git command to get current branch
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: projPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
      }).trim();
      
      return branch || null;
    } catch {
      // Not a git repo or git command failed
      return null;
    }
  }

  /**
   * Get git status summary for a project
   */
  async getGitStatus(projPath: string): Promise<{ modified: number; untracked: number; staged: number } | null> {
    if (!projPath) return null;
    
    try {
      // Check if directory exists and has .git
      await fs.access(projPath);
      const gitPath = path.join(projPath, '.git');
      await fs.access(gitPath);
      
      // Get git status
      const status = execSync('git status --porcelain', {
        cwd: projPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      
      const lines = status.split('\n').filter(line => line.trim());
      let modified = 0;
      let untracked = 0;
      let staged = 0;
      
      for (const line of lines) {
        const statusCode = line.substring(0, 2);
        if (statusCode.includes('?')) untracked++;
        else if (statusCode[0] !== ' ') staged++;
        else if (statusCode[1] !== ' ') modified++;
      }
      
      return { modified, untracked, staged };
    } catch {
      return null;
    }
  }
}

export const projectDetectionService = new ProjectDetectionService();