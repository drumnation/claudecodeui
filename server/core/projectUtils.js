/**
 * Pure utility functions for project operations
 * These functions have no side effects and are easily testable
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
 * @param {string} absPath - The absolute path to resolve
 * @returns {string} The canonical project root path
 */
function getCanonicalProjectRoot(absPath) {
  if (!absPath) return absPath;
  
  try {
    // Ensure the path is absolute
    const resolvedPath = path.resolve(absPath);
    
    // Check if the path exists
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`Path does not exist: ${resolvedPath}`);
      return resolvedPath;
    }
    
    // First, try to use Git to find the repository root
    try {
      const gitRoot = execSync('git rev-parse --show-toplevel', {
        cwd: resolvedPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
      }).trim();
      
      if (gitRoot && fs.existsSync(gitRoot)) {
        console.log(`Found Git root for ${resolvedPath}: ${gitRoot}`);
        return gitRoot;
      }
    } catch (gitError) {
      // Git command failed, continue with fallback
      console.log(`Git detection failed for ${resolvedPath}, using fallback`);
    }
    
    // Fallback: Walk up directory tree looking for project markers
    let current = resolvedPath;
    const home = os.homedir();
    const root = path.parse(current).root;
    
    while (current !== root && current !== home) {
      try {
        const entries = fs.readdirSync(current);
        
        // Check for monorepo sentinel files (highest priority)
        const hasMonorepoSentinel = MONOREPO_SENTINELS.some(sentinel => 
          entries.includes(sentinel)
        );
        if (hasMonorepoSentinel) {
          console.log(`Found monorepo root at ${current}`);
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
          console.log(`Found project root (VCS + manifest) at ${current}`);
          return current;
        }
        
        // Move up one directory
        const parent = path.dirname(current);
        if (parent === current) break; // Reached filesystem root
        current = parent;
      } catch (error) {
        console.error(`Error reading directory ${current}: ${error.message}`);
        break;
      }
    }
    
    // No root found, return the original path
    console.log(`No project root found for ${resolvedPath}, using original path`);
    return resolvedPath;
  } catch (error) {
    console.error(`Error in getCanonicalProjectRoot: ${error.message}`);
    return absPath;
  }
}

/**
 * Encode a project path to a safe directory name
 * Note: Input should be canonicalized before encoding
 * Uses base64url encoding to preserve all characters including dashes
 * @param {string} projectPath - The project path to encode
 * @returns {string} The encoded path
 */
function encodeProjectPath(projectPath) {
  // Use base64url encoding to safely encode paths with special characters
  // This preserves dashes and other characters in the original path
  return Buffer.from(projectPath).toString('base64url');
}

/**
 * Decode a directory name back to a project path
 * @param {string} encoded - The encoded path
 * @returns {string} The decoded project path
 */
function decodeProjectPath(encoded) {
  // First check if this is a legacy dash-encoded path
  // Legacy format: paths were encoded by replacing / with -
  if (!encoded.match(/^[A-Za-z0-9_-]+$/)) {
    // Contains characters not in base64url, must be legacy
    return '/' + encoded.replace(/-/g, '/');
  }
  
  try {
    // Try to decode as base64url
    const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
    // Verify it looks like a path
    if (decoded.startsWith('/') || decoded.match(/^[A-Z]:\\/)) {
      return decoded;
    }
  } catch (e) {
    // Not valid base64url, fall back to legacy format
  }
  
  // Fall back to legacy dash-based decoding
  if (encoded.startsWith('-')) {
    // Legacy format with leading dash
    return '/' + encoded.substring(1).replace(/-/g, '/');
  }
  return '/' + encoded.replace(/-/g, '/');
}

/**
 * Extract project name from various manifest files
 * @param {string} manifestContent - The content of the manifest file
 * @param {string} manifestType - The type of manifest (package.json, pyproject.toml, etc.)
 * @returns {string|null} The extracted project name or null
 */
function extractProjectName(manifestContent, manifestType) {
  try {
    switch (manifestType) {
      case 'package.json':
      case 'composer.json': {
        const parsed = JSON.parse(manifestContent);
        const name = parsed.name || null;
        // For composer.json, extract the package name without vendor
        if (manifestType === 'composer.json' && name && name.includes('/')) {
          return name.split('/')[1];
        }
        return name;
      }
      
      case 'pyproject.toml': {
        // Extract name from [tool.poetry] or [project] section
        const poetryMatch = manifestContent.match(/\[tool\.poetry\][\s\S]*?name\s*=\s*"([^"]+)"/);
        if (poetryMatch) return poetryMatch[1];
        
        const projectMatch = manifestContent.match(/\[project\][\s\S]*?name\s*=\s*"([^"]+)"/);
        if (projectMatch) return projectMatch[1];
        
        return null;
      }
      
      case 'Cargo.toml': {
        // Extract name from [package] section
        const match = manifestContent.match(/\[package\][\s\S]*?name\s*=\s*"([^"]+)"/);
        return match ? match[1] : null;
      }
      
      case 'go.mod': {
        // Extract module name and take the last part
        const match = manifestContent.match(/^module\s+(.+)$/m);
        if (match) {
          const parts = match[1].split('/');
          return parts[parts.length - 1];
        }
        return null;
      }
      
      case 'pom.xml': {
        // Extract artifactId from XML
        const match = manifestContent.match(/<artifactId>([^<]+)<\/artifactId>/);
        return match ? match[1] : null;
      }
      
      case 'pubspec.yaml': {
        // Extract name from YAML
        const match = manifestContent.match(/^name:\s*(.+)$/m);
        return match ? match[1].trim() : null;
      }
      
      default:
        return null;
    }
  } catch (error) {
    return null;
  }
}

/**
 * Generate a display name from a project path
 * @param {string} projectPath - The project path
 * @returns {string} The display name
 */
function generateDisplayNameFromPath(projectPath) {
  const parts = projectPath.split('/');
  return parts[parts.length - 1] || 'project';
}

/**
 * Sort projects by various criteria
 * @param {Array} projects - Array of project objects
 * @param {string} sortBy - Sort criteria (name, lastActivity, language)
 * @returns {Array} Sorted array of projects
 */
function sortProjects(projects, sortBy = 'lastActivity') {
  return [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.displayName || a.name).localeCompare(b.displayName || b.name);
      
      case 'lastActivity':
        const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return bTime - aTime;
      
      case 'language':
        return (a.language || 'unknown').localeCompare(b.language || 'unknown');
      
      default:
        return 0;
    }
  });
}

/**
 * Filter projects based on criteria
 * @param {Array} projects - Array of project objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered array of projects
 */
function filterProjects(projects, filters = {}) {
  return projects.filter(project => {
    if (filters.language && project.language !== filters.language) {
      return false;
    }
    
    if (filters.isMonorepo !== undefined && project.isMonorepo !== filters.isMonorepo) {
      return false;
    }
    
    if (filters.isWorktree !== undefined && project.isWorktree !== filters.isWorktree) {
      return false;
    }
    
    if (filters.hasSessions !== undefined) {
      const hasSessions = project.sessions && project.sessions.length > 0;
      if (hasSessions !== filters.hasSessions) {
        return false;
      }
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const nameMatch = (project.displayName || project.name || '').toLowerCase().includes(searchLower);
      const pathMatch = project.path.toLowerCase().includes(searchLower);
      return nameMatch || pathMatch;
    }
    
    return true;
  });
}

/**
 * Transform project data for API response
 * @param {Object} project - Raw project data
 * @returns {Object} Transformed project data
 */
function transformProjectForAPI(project) {
  return {
    name: project.name,
    path: project.path,
    displayName: project.displayName || project.name,
    language: project.language || 'unknown',
    isMonorepo: project.isMonorepo || false,
    monorepoType: project.monorepoType,
    subprojects: project.subprojects || [],
    isWorktree: project.isWorktree || false,
    mainRepoPath: project.mainRepoPath,
    lastActivity: project.lastActivity,
    sessionCount: project.sessions ? project.sessions.length : 0,
    missing: project.missing || false
  };
}

/**
 * Calculate project statistics
 * @param {Object} projects - Map of projects
 * @returns {Object} Statistics object
 */
function calculateProjectStats(projects) {
  const projectArray = Object.values(projects);
  const languageCounts = {};
  let monorepoCount = 0;
  let worktreeCount = 0;
  let totalSessions = 0;
  
  projectArray.forEach(project => {
    // Count languages
    const lang = project.language || 'unknown';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    
    // Count monorepos
    if (project.isMonorepo) monorepoCount++;
    
    // Count worktrees
    if (project.isWorktree) worktreeCount++;
    
    // Count sessions
    if (project.sessions) {
      totalSessions += project.sessions.length;
    }
  });
  
  return {
    totalProjects: projectArray.length,
    languageCounts,
    monorepoCount,
    worktreeCount,
    totalSessions,
    averageSessionsPerProject: projectArray.length > 0 
      ? (totalSessions / projectArray.length).toFixed(2) 
      : 0
  };
}

module.exports = {
  encodeProjectPath,
  decodeProjectPath,
  extractProjectName,
  generateDisplayNameFromPath,
  sortProjects,
  filterProjects,
  transformProjectForAPI,
  calculateProjectStats,
  getCanonicalProjectRoot
};