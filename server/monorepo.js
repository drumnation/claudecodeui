const path = require('path');
const fs = require('fs').promises;
const { execSync } = require('child_process');
const glob = require('fast-glob');

// Manifest files that indicate a project or monorepo
const MANIFESTS = [
  // JavaScript/TypeScript
  'package.json',
  'pnpm-workspace.yaml',
  'lerna.json',
  'turbo.json',
  'nx.json',
  'rush.json',
  'workspace.json',
  'yarn.lock',
  'package-lock.json',
  'pnpm-lock.yaml',
  
  // Python
  'pyproject.toml',
  'requirements.txt',
  'setup.py',
  'setup.cfg',
  'Pipfile',
  'poetry.lock',
  
  // Go
  'go.mod',
  'go.sum',
  
  // Rust
  'Cargo.toml',
  'Cargo.lock',
  
  // Java/Kotlin
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'settings.gradle',
  'settings.gradle.kts',
  
  // .NET
  '*.csproj',
  '*.sln',
  '*.fsproj',
  '*.vbproj',
  
  // C/C++
  'CMakeLists.txt',
  'Makefile',
  'makefile',
  'configure',
  'meson.build',
  
  // Dart/Flutter
  'pubspec.yaml',
  'pubspec.lock',
  
  // Elixir
  'mix.exs',
  
  // Scala
  'build.sbt',
  
  // Ruby
  'Gemfile',
  'Gemfile.lock',
  '*.gemspec',
  
  // PHP
  'composer.json',
  'composer.lock',
  
  // Bazel
  'WORKSPACE',
  'BUILD',
  'BUILD.bazel',
  
  // Other
  '.gitmodules',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml'
];

// VCS markers
const VCS_MARKERS = ['.git', '.hg', '.svn'];

// Monorepo-specific config files
const MONOREPO_CONFIGS = [
  'pnpm-workspace.yaml',
  'lerna.json',
  'nx.json',
  'turbo.json',
  'rush.json',
  'workspace.json'
];

/**
 * @typedef {Object} MonorepoInfo
 * @property {boolean} isMonorepo - Whether this is a monorepo
 * @property {string} [monorepoRoot] - Path to monorepo root if it's a monorepo
 */

/**
 * Find the repository root by walking up from the start path
 * @param {string} start - Starting directory path
 * @returns {Promise<string>} - Path to the repository root
 */
async function findRepoRoot(start) {
  let current = path.resolve(start);
  const root = path.parse(current).root;
  
  // First check if start path exists
  try {
    await fs.access(start);
  } catch {
    return start; // Path doesn't exist, return as-is
  }
  
  while (current !== root) {
    try {
      const entries = await fs.readdir(current);
      
      // Check for VCS markers
      const hasVCS = VCS_MARKERS.some(marker => entries.includes(marker));
      
      // Count manifest files
      const manifestCount = await countManifests(current, entries);
      
      // Check for monorepo configs
      const hasMonorepoConfig = MONOREPO_CONFIGS.some(config => entries.includes(config));
      
      // Found root if:
      // 1. Has monorepo config
      // 2. Has VCS marker and at least one manifest
      // 3. Has 2 or more manifests
      if (hasMonorepoConfig || (hasVCS && manifestCount >= 1) || manifestCount >= 2) {
        return current;
      }
      
      // Move up one directory
      const parent = path.dirname(current);
      if (parent === current) break; // Reached filesystem root
      current = parent;
    } catch (error) {
      // If we can't read the directory, stop here
      break;
    }
  }
  
  // Return original path if no root found
  return start;
}

/**
 * Count manifest files in a directory
 * @param {string} dirPath - Directory path
 * @param {string[]} entries - Directory entries (optional)
 * @returns {Promise<number>} - Number of manifest files found
 */
async function countManifests(dirPath, entries = null) {
  try {
    // Check if directory exists first
    await fs.access(dirPath);
  } catch {
    return 0; // Directory doesn't exist, no manifests
  }
  
  if (!entries) {
    try {
      entries = await fs.readdir(dirPath);
    } catch {
      return 0; // Can't read directory
    }
  }
  
  let count = 0;
  for (const manifest of MANIFESTS) {
    if (manifest.includes('*')) {
      // Handle glob patterns
      const pattern = manifest;
      const matches = entries.filter(entry => {
        if (pattern === '*.csproj') return entry.endsWith('.csproj');
        if (pattern === '*.sln') return entry.endsWith('.sln');
        if (pattern === '*.fsproj') return entry.endsWith('.fsproj');
        if (pattern === '*.vbproj') return entry.endsWith('.vbproj');
        if (pattern === '*.gemspec') return entry.endsWith('.gemspec');
        return false;
      });
      count += matches.length;
    } else {
      // Exact match
      if (entries.includes(manifest)) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * List all subprojects within a monorepo root
 * @param {string} root - Root directory path
 * @returns {Promise<string[]>} - Array of subproject paths
 */
async function listSubprojects(root) {
  const subprojects = new Set();
  
  // Always include the root itself if it has manifests
  const rootManifestCount = await countManifests(root);
  if (rootManifestCount > 0) {
    subprojects.add(root);
  }
  
  // Create glob patterns for all manifests
  const patterns = [];
  for (const manifest of MANIFESTS) {
    // One level down
    patterns.push(`*/${manifest}`);
    // Two levels down
    patterns.push(`*/*/${manifest}`);
  }
  
  try {
    // Use fast-glob to find all manifest files
    const files = await glob(patterns, {
      cwd: root,
      absolute: true,
      onlyFiles: true,
      ignore: [
        '**/node_modules/**', 
        '**/vendor/**', 
        '**/target/**', 
        '**/dist/**', 
        '**/build/**', 
        '**/.git/**',
        '**/Library/**',
        '**/*.photoslibrary/**',
        '**/.*'  // Ignore hidden directories
      ],
      suppressErrors: true,  // Don't throw on permission errors
      followSymbolicLinks: false  // Don't follow symlinks that might lead to protected areas
    });
    
    // Extract unique directories containing manifests
    for (const file of files) {
      const dir = path.dirname(file);
      subprojects.add(dir);
    }
  } catch (error) {
    // Silently ignore permission errors
    if (error.code !== 'EPERM' && error.code !== 'EACCES') {
      console.error('Error scanning for subprojects:', error.message);
    }
  }
  
  return Array.from(subprojects).sort();
}

/**
 * Detect the primary language of a project based on its manifest files
 * @param {string} projPath - Project directory path
 * @returns {Promise<string>} - Detected language label
 */
async function detectLanguage(projPath) {
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
    
    // JavaScript/TypeScript patterns - VERY aggressive matching
    const jsPatterns = [
      'frontend', 'backend', 'ui', 'web', 'api', 'server', 'client', 'app', 'apps',
      'src', 'lib', 'dist', 'build', 'public', 'static', 'assets', 'components',
      'pages', 'views', 'routes', 'controllers', 'models', 'services', 'utils',
      'helpers', 'middleware', 'config', 'scripts', 'tests', 'test', 'spec',
      'e2e', 'integration', 'unit', 'coverage', 'storybook', 'stories',
      'admin', 'dashboard', 'portal', 'platform', 'console', 'panel',
      'mobile', 'desktop', 'browser', 'extension', 'plugin', 'addon',
      'widget', 'component', 'module', 'package', 'bundle', 'sdk',
      'cli', 'tool', 'toolkit', 'framework', 'library', 'boilerplate',
      'template', 'starter', 'scaffold', 'generator', 'builder',
      'editor', 'ide', 'workspace', 'project', 'example', 'demo',
      'tutorial', 'guide', 'sample', 'playground', 'sandbox',
      'shop', 'store', 'ecommerce', 'commerce', 'marketplace',
      'blog', 'cms', 'content', 'media', 'social', 'chat', 'messaging',
      'auth', 'authentication', 'authorization', 'session', 'user',
      'payment', 'billing', 'subscription', 'invoice', 'checkout',
      'analytics', 'metrics', 'tracking', 'monitor', 'logging',
      'search', 'index', 'query', 'filter', 'sort', 'pagination',
      'upload', 'download', 'file', 'storage', 'cdn', 'cache',
      'queue', 'worker', 'job', 'task', 'cron', 'scheduler',
      'webhook', 'api-gateway', 'proxy', 'gateway', 'router',
      'database', 'db', 'data', 'schema', 'migration', 'seed',
      'graphql', 'rest', 'websocket', 'socket', 'realtime',
      'electron', 'native', 'hybrid', 'pwa', 'spa', 'ssr',
      'next', 'nuxt', 'gatsby', 'vite', 'webpack', 'parcel',
      'react', 'vue', 'angular', 'svelte', 'ember', 'backbone',
      'jquery', 'vanilla', 'typescript', 'javascript', 'node',
      'express', 'koa', 'fastify', 'nest', 'hapi', 'strapi',
      'brain', 'studio', 'farm', 'original', 'base', 'core',
      'common', 'shared', 'vendor', 'third-party', 'external',
      'internal', 'private', 'public', 'open', 'closed',
      'dev', 'development', 'staging', 'production', 'prod',
      'alpha', 'beta', 'release', 'stable', 'unstable',
      'v1', 'v2', 'v3', 'version', 'legacy', 'deprecated',
      'new', 'old', 'temp', 'tmp', 'backup', 'archive',
      'poc', 'mvp', 'prototype', 'experiment', 'research',
      'hackathon', 'challenge', 'competition', 'contest',
      'ai', 'ml', 'dl', 'nlp', 'cv', 'rl', 'gan', 'nn',
      'crypto', 'blockchain', 'nft', 'defi', 'dapp', 'contract',
      'game', 'gaming', 'engine', 'physics', 'graphics', 'render',
      '3d', '2d', 'vr', 'ar', 'xr', 'metaverse', 'virtual',
      'iot', 'embedded', 'hardware', 'firmware', 'device',
      'cloud', 'serverless', 'lambda', 'function', 'edge',
      'micro', 'mono', 'multi', 'poly', 'omni', 'meta',
      'smart', 'intelligent', 'adaptive', 'responsive', 'dynamic'
    ];
    
    // Check if directory name matches any JS pattern
    for (const pattern of jsPatterns) {
      if (dirName.includes(pattern)) {
        return 'JavaScript/TypeScript';
      }
    }
    
    // Check if path contains any JS-related terms
    const pathParts = fullPathLower.split('/');
    for (const part of pathParts) {
      for (const pattern of jsPatterns) {
        if (part.includes(pattern)) {
          return 'JavaScript/TypeScript';
        }
      }
    }
    
    // Check for specific project types by directory structure
    if (fullPathLower.includes('/experiments/') || fullPathLower.includes('/dev/') || 
        fullPathLower.includes('/projects/') || fullPathLower.includes('/code/')) {
      // Most experiments and dev projects are JS/TS
      return 'JavaScript/TypeScript';
    }
    
    // Documentation
    if (dirName === 'docs' || dirName === 'documentation' || dirName.includes('doc') ||
        dirName === 'wiki' || dirName === 'manual' || dirName === 'guide') {
      return 'Documentation';
    }
    
    // Logs and errors
    if (dirName === 'logs' || dirName === 'log' || dirName === 'errors' || dirName === 'error' ||
        dirName === 'debug' || dirName === 'trace' || dirName === 'audit') {
      return 'Logs';
    }
    
    // Other languages - only if explicitly mentioned
    if (dirName.includes('python') || dirName.includes('py') || dirName === 'django' || 
        dirName === 'flask' || dirName === 'fastapi') return 'Python';
    if (dirName.includes('rust') || dirName.includes('rs') || dirName === 'cargo') return 'Rust';
    if (dirName.includes('go') || dirName.includes('golang') || dirName === 'gin' || 
        dirName === 'echo' || dirName === 'fiber') return 'Go';
    if (dirName.includes('java') || dirName === 'spring' || dirName === 'maven' || 
        dirName === 'gradle') return 'Java/Kotlin';
    if (dirName.includes('csharp') || dirName.includes('dotnet') || dirName === 'aspnet' ||
        dirName.includes('.net')) return 'C#/.NET';
    if (dirName.includes('cpp') || dirName.includes('c++') || dirName === 'cmake') return 'C/C++';
    if (dirName.includes('ruby') || dirName === 'rails' || dirName === 'sinatra') return 'Ruby';
    if (dirName.includes('php') || dirName === 'laravel' || dirName === 'symfony') return 'PHP';
    if (dirName.includes('swift') || dirName === 'ios' || dirName === 'macos') return 'Swift';
    if (dirName.includes('kotlin') || dirName === 'android') return 'Java/Kotlin';
    if (dirName.includes('dart') || dirName === 'flutter') return 'Dart/Flutter';
    if (dirName.includes('scala') || dirName === 'play' || dirName === 'akka') return 'Scala';
    if (dirName.includes('elixir') || dirName === 'phoenix') return 'Elixir';
    if (dirName.includes('shell') || dirName.includes('bash') || dirName === 'scripts') return 'Shell';
    
    // Default to JavaScript/TypeScript for most projects
    // This is a reasonable default as most modern projects use JS/TS
    return 'JavaScript/TypeScript';
  } catch (error) {
    // Fallback: guess from directory name if all else fails
    const dirName = path.basename(projPath).toLowerCase();
    
    // Common JS project names  
    const commonJsNames = [
      'frontend', 'backend', 'ui', 'api', 'apps', 'brain', 'studio', 'farm', 
      'original', 'web', 'client', 'server', 'app', 'src', 'lib', 'build',
      'dist', 'public', 'static', 'assets', 'components', 'pages', 'admin',
      'dashboard', 'portal', 'platform', 'mobile', 'desktop', 'editor',
      'cli', 'tool', 'sdk', 'widget', 'plugin', 'extension', 'module',
      'package', 'bundle', 'project', 'workspace', 'template', 'example',
      'demo', 'test', 'tests', 'e2e', 'spec', 'playground', 'sandbox'
    ];
    
    for (const jsName of commonJsNames) {
      if (dirName.includes(jsName)) {
        return 'JavaScript/TypeScript';
      }
    }
    
    if (dirName === 'docs' || dirName.includes('doc')) return 'Documentation';
    if (dirName === 'logs' || dirName === 'errors' || dirName === 'log' || dirName === 'error') return 'Logs';
    
    // Default to JavaScript/TypeScript
    return 'JavaScript/TypeScript';
  }
}

/**
 * Annotate a project with monorepo information
 * @param {string} projPath - Project directory path
 * @returns {Promise<MonorepoInfo>} - Monorepo annotation
 */
async function annotateMonorepo(projPath) {
  if (!projPath) {
    return { isMonorepo: false };
  }
  
  try {
    // Check if the path exists before proceeding
    await fs.access(projPath);
  } catch {
    // Path doesn't exist, not a monorepo
    return { isMonorepo: false };
  }
  
  try {
    const root = await findRepoRoot(projPath);
    const workspaces = await listSubprojects(root);
    
    return {
      isMonorepo: workspaces.length > 1,
      monorepoRoot: workspaces.length > 1 ? root : undefined
    };
  } catch (error) {
    // Silently handle errors - don't log them to avoid spam
    return { isMonorepo: false };
  }
}

/**
 * Detect if a directory is a Git worktree
 * @param {string} projPath - Project directory path
 * @returns {Promise<boolean>} - True if this is a Git worktree
 */
async function detectWorktree(projPath) {
  if (!projPath) return false;
  
  try {
    // First check if the directory exists
    await fs.access(projPath);
  } catch {
    return false;
  }
  
  const gitPath = path.join(projPath, '.git');
  
  try {
    // Method 1: Check if .git is a file (not a directory)
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
    
    // Method 2: Use git command as fallback
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
 * @param {string} projPath - Worktree directory path
 * @returns {Promise<string|null>} - Path to the main repository, or null if not a worktree
 */
async function getMainRepoPath(projPath) {
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

module.exports = {
  MANIFESTS,
  VCS_MARKERS,
  MONOREPO_CONFIGS,
  findRepoRoot,
  listSubprojects,
  detectLanguage,
  annotateMonorepo,
  detectWorktree,
  getMainRepoPath
};