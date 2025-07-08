const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { detectLanguage, annotateMonorepo, detectWorktree, getMainRepoPath } = require('./monorepo');
const { getCanonicalProjectRoot, decodeProjectPath } = require('./core/projectUtils');

/**
 * @typedef {Object} Session
 * @property {string} id - Session ID
 * @property {string} summary - Session summary
 * @property {number} messageCount - Number of messages in session
 * @property {Date|string} lastActivity - Last activity timestamp
 * @property {string} cwd - Current working directory
 */

/**
 * @typedef {Object} SessionMeta
 * @property {boolean} hasMore - Whether there are more sessions
 * @property {number} total - Total number of sessions
 */

/**
 * @typedef {Object} Project
 * @property {string} name - Directory name (path segments joined with -)
 * @property {string|null} path - Full path to project folder, null for manually added
 * @property {string} displayName - Human-readable name
 * @property {string} fullPath - Original path with / instead of -
 * @property {boolean} isCustomName - Whether displayName is custom set
 * @property {boolean} [isManuallyAdded] - True for projects added via config but not yet created
 * @property {Session[]} sessions - First 5 sessions
 * @property {SessionMeta} [sessionMeta] - Metadata about sessions
 * @property {string} language - e.g. "JavaScript/TypeScript", "Python", "Go", etc.
 * @property {boolean} isMonorepo - true if this project is part of a monorepo
 * @property {string} [monorepoRoot] - filesystem path to the monorepo root, if different
 * @property {boolean} isWorktree - true if this is a Git worktree
 * @property {string} [mainRepoPath] - path to the main repository if this is a worktree
 */

// Load project configuration file
async function loadProjectConfig() {
  const configPath = path.join(process.env.HOME, '.claude', 'project-config.json');
  try {
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    // Return empty config if file doesn't exist
    return {};
  }
}

// Save project configuration file
async function saveProjectConfig(config) {
  const configPath = path.join(process.env.HOME, '.claude', 'project-config.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
}

/**
 * Generate better display name from manifest files or path
 * @param {string} projectName - The encoded project name from the directory
 * @param {string} [actualPath] - The actual filesystem path to the project
 * @returns {Promise<string>} - A human-readable display name
 */
async function generateDisplayName(projectName, actualPath = null) {
  // Convert "-home-user-projects-myapp" to a readable format
  let projectPath = projectName.startsWith('-') 
    ? projectName.substring(1).replace(/-/g, '/')
    : projectName.replace(/-/g, '/');
  
  // Use the actual path if provided, otherwise reconstruct from projectName
  const fsPath = actualPath || projectPath;
  
  // Try to read name from various manifest files
  try {
    // Try package.json first (JavaScript/TypeScript)
    try {
      const packageJsonPath = path.join(fsPath, 'package.json');
      const packageData = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageData);
      if (packageJson.name) {
        return packageJson.name;
      }
    } catch {}
    
    // Try pyproject.toml (Python)
    try {
      const pyprojectPath = path.join(fsPath, 'pyproject.toml');
      const pyprojectData = await fs.readFile(pyprojectPath, 'utf8');
      // Simple regex to extract project name from pyproject.toml
      const nameMatch = pyprojectData.match(/name\s*=\s*["']([^"']+)["']/);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1];
      }
    } catch {}
    
    // Try Cargo.toml (Rust)
    try {
      const cargoPath = path.join(fsPath, 'Cargo.toml');
      const cargoData = await fs.readFile(cargoPath, 'utf8');
      const nameMatch = cargoData.match(/name\s*=\s*["']([^"']+)["']/);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1];
      }
    } catch {}
    
    // Try go.mod (Go)
    try {
      const goModPath = path.join(fsPath, 'go.mod');
      const goModData = await fs.readFile(goModPath, 'utf8');
      const moduleMatch = goModData.match(/module\s+(\S+)/);
      if (moduleMatch && moduleMatch[1]) {
        // Extract just the last part of the module name
        const parts = moduleMatch[1].split('/');
        return parts[parts.length - 1];
      }
    } catch {}
    
    // Try pom.xml (Java/Maven)
    try {
      const pomPath = path.join(fsPath, 'pom.xml');
      const pomData = await fs.readFile(pomPath, 'utf8');
      // Simple regex to extract artifactId from pom.xml
      const artifactMatch = pomData.match(/<artifactId>([^<]+)<\/artifactId>/);
      if (artifactMatch && artifactMatch[1]) {
        return artifactMatch[1];
      }
    } catch {}
    
    // Try composer.json (PHP)
    try {
      const composerPath = path.join(fsPath, 'composer.json');
      const composerData = await fs.readFile(composerPath, 'utf8');
      const composer = JSON.parse(composerData);
      if (composer.name) {
        // composer names are usually "vendor/package", we want just the package
        const parts = composer.name.split('/');
        return parts[parts.length - 1];
      }
    } catch {}
    
    // Try pubspec.yaml (Dart/Flutter)
    try {
      const pubspecPath = path.join(fsPath, 'pubspec.yaml');
      const pubspecData = await fs.readFile(pubspecPath, 'utf8');
      const nameMatch = pubspecData.match(/^name:\s*(.+)$/m);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();
      }
    } catch {}
  } catch (error) {
    // If all manifest reads fail, fall back to path-based naming
  }
  
  // Fallback: Use the directory name as the project name
  const parts = projectPath.split('/').filter(Boolean);
  if (parts.length > 0) {
    // Just use the last directory name
    return parts[parts.length - 1];
  }
  
  return projectPath;
}

/**
 * Get all projects with their sessions
 * @returns {Promise<Project[]>} Array of projects with sessions
 */
async function getProjects() {
  const claudeDir = path.join(process.env.HOME, '.claude', 'projects');
  const config = await loadProjectConfig();
  const projects = [];
  const existingProjects = new Set();
  
  try {
    // First, get existing projects from the file system
    const entries = await fs.readdir(claudeDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        existingProjects.add(entry.name);
        const projectPath = path.join(claudeDir, entry.name);
        
        // Get display name from config or generate one
        // Use the proper decoding function to handle legacy and new formats
        const decodedPath = decodeProjectPath(entry.name);
        
        // Get the canonical project root
        const canonicalRoot = getCanonicalProjectRoot(decodedPath);
        console.log(`Resolved project to canonical root: ${decodedPath} -> ${canonicalRoot}`);
        
        const customName = config[entry.name]?.displayName;
        const autoDisplayName = await generateDisplayName(entry.name, canonicalRoot);
        
        // Detect language and monorepo info using the canonical root
        const language = await detectLanguage(canonicalRoot);
        const { isMonorepo, monorepoRoot } = await annotateMonorepo(canonicalRoot);
        
        // Detect if this is a Git worktree
        const isWorktree = await detectWorktree(canonicalRoot);
        const mainRepoPath = isWorktree ? await getMainRepoPath(canonicalRoot) : undefined;
        
        const project = {
          name: entry.name,
          path: projectPath,
          displayName: customName || autoDisplayName,
          fullPath: canonicalRoot, // Use the canonical root
          isCustomName: !!customName,
          language: language,
          isMonorepo: isMonorepo,
          monorepoRoot: monorepoRoot,
          isWorktree: isWorktree,
          mainRepoPath: mainRepoPath,
          sessions: []
        };
        
        // Try to get sessions for this project (just first 5 for performance)
        try {
          const sessionResult = await getSessions(entry.name, 5, 0);
          project.sessions = sessionResult.sessions || [];
          project.sessionMeta = {
            hasMore: sessionResult.hasMore,
            total: sessionResult.total
          };
          
          // Also get the actual most recent session timestamp for sorting
          if (sessionResult.sessions && sessionResult.sessions.length > 0) {
            // The first session is already the most recent due to getSessions sorting
            project.mostRecentActivity = new Date(sessionResult.sessions[0].lastActivity).getTime();
          } else {
            project.mostRecentActivity = 0;
          }
        } catch (e) {
          console.warn(`Could not load sessions for project ${entry.name}:`, e.message);
          project.mostRecentActivity = 0;
        }
        
        projects.push(project);
      }
    }
  } catch (error) {
    console.error('Error reading projects directory:', error);
  }
  
  // Add manually configured projects that don't exist as folders yet
  for (const [projectName, projectConfig] of Object.entries(config)) {
    if (!existingProjects.has(projectName) && projectConfig.manuallyAdded) {
      const fullPath = projectName.startsWith('-') 
        ? '/' + projectName.substring(1).replace(/-/g, '/')
        : projectName.replace(/-/g, '/');
      
      const project = {
        name: projectName,
        path: null, // No physical path yet
        displayName: projectConfig.displayName || await generateDisplayName(projectName),
        fullPath: fullPath,
        isCustomName: !!projectConfig.displayName,
        isManuallyAdded: true,
        language: 'Unknown', // Cannot detect language without physical path
        isMonorepo: false,
        monorepoRoot: undefined,
        isWorktree: false, // Cannot be a worktree without physical path
        mainRepoPath: undefined,
        sessions: [],
        mostRecentActivity: 0 // No sessions yet
      };
      
      projects.push(project);
    }
  }
  
  // Sort projects by most recent session activity (descending)
  projects.sort((a, b) => {
    // Use the pre-calculated most recent activity timestamp
    const aLatest = a.mostRecentActivity || 0;
    const bLatest = b.mostRecentActivity || 0;
    
    return bLatest - aLatest; // Descending order (most recent first)
  });
  
  return projects;
}

async function getSessions(projectName, limit = 5, offset = 0) {
  const projectDir = path.join(process.env.HOME, '.claude', 'projects', projectName);
  
  try {
    const files = await fs.readdir(projectDir);
    const jsonlFiles = files.filter(file => file.endsWith('.jsonl'));
    
    if (jsonlFiles.length === 0) {
      return { sessions: [], hasMore: false, total: 0 };
    }
    
    // For performance, get file stats to sort by modification time
    const filesWithStats = await Promise.all(
      jsonlFiles.map(async (file) => {
        const filePath = path.join(projectDir, file);
        const stats = await fs.stat(filePath);
        return { file, mtime: stats.mtime };
      })
    );
    
    // Sort files by modification time (newest first) for better performance
    filesWithStats.sort((a, b) => b.mtime - a.mtime);
    
    const allSessions = new Map();
    let processedCount = 0;
    
    // Process files in order of modification time
    for (const { file } of filesWithStats) {
      const jsonlFile = path.join(projectDir, file);
      const sessions = await parseJsonlSessions(jsonlFile);
      
      // Merge sessions, avoiding duplicates by session ID
      sessions.forEach(session => {
        if (!allSessions.has(session.id)) {
          allSessions.set(session.id, session);
        }
      });
      
      processedCount++;
      
      // Early exit optimization: if we have enough sessions and processed recent files
      if (allSessions.size >= (limit + offset) * 2 && processedCount >= Math.min(3, filesWithStats.length)) {
        break;
      }
    }
    
    // Convert to array and sort by last activity
    const sortedSessions = Array.from(allSessions.values()).sort((a, b) => 
      new Date(b.lastActivity) - new Date(a.lastActivity)
    );
    
    const total = sortedSessions.length;
    const paginatedSessions = sortedSessions.slice(offset, offset + limit);
    const hasMore = offset + limit < total;
    
    return {
      sessions: paginatedSessions,
      hasMore,
      total,
      offset,
      limit
    };
  } catch (error) {
    console.error(`Error reading sessions for project ${projectName}:`, error);
    return { sessions: [], hasMore: false, total: 0 };
  }
}

async function parseJsonlSessions(filePath) {
  const sessions = new Map();
  
  try {
    const fileStream = require('fs').createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    // console.log(`[JSONL Parser] Reading file: ${filePath}`);
    let lineCount = 0;
    
    for await (const line of rl) {
      if (line.trim()) {
        lineCount++;
        try {
          const entry = JSON.parse(line);
          
          if (entry.sessionId) {
            if (!sessions.has(entry.sessionId)) {
              sessions.set(entry.sessionId, {
                id: entry.sessionId,
                summary: 'New Session',
                messageCount: 0,
                lastActivity: new Date(),
                cwd: entry.cwd || ''
              });
            }
            
            const session = sessions.get(entry.sessionId);
            
            // Update summary if this is a summary entry
            if (entry.type === 'summary' && entry.summary) {
              session.summary = entry.summary;
            } else if (entry.message?.role === 'user' && entry.message?.content && session.summary === 'New Session') {
              // Use first user message as summary if no summary entry exists
              const content = entry.message.content;
              if (typeof content === 'string' && content.length > 0) {
                // Skip command messages that start with <command-name>
                if (!content.startsWith('<command-name>')) {
                  session.summary = content.length > 50 ? content.substring(0, 50) + '...' : content;
                }
              }
            }
            
            // Count messages instead of storing them all
            session.messageCount = (session.messageCount || 0) + 1;
            
            // Update last activity
            if (entry.timestamp) {
              session.lastActivity = new Date(entry.timestamp);
            }
          }
        } catch (parseError) {
          console.warn(`[JSONL Parser] Error parsing line ${lineCount}:`, parseError.message);
        }
      }
    }
    
    // console.log(`[JSONL Parser] Processed ${lineCount} lines, found ${sessions.size} sessions`);
  } catch (error) {
    console.error('Error reading JSONL file:', error);
  }
  
  // Convert Map to Array and sort by last activity
  return Array.from(sessions.values()).sort((a, b) => 
    new Date(b.lastActivity) - new Date(a.lastActivity)
  );
}

// Get messages for a specific session
async function getSessionMessages(projectName, sessionId) {
  const projectDir = path.join(process.env.HOME, '.claude', 'projects', projectName);
  
  try {
    const files = await fs.readdir(projectDir);
    const jsonlFiles = files.filter(file => file.endsWith('.jsonl'));
    
    if (jsonlFiles.length === 0) {
      return [];
    }
    
    const messages = [];
    
    // Process all JSONL files to find messages for this session
    for (const file of jsonlFiles) {
      const jsonlFile = path.join(projectDir, file);
      const fileStream = require('fs').createReadStream(jsonlFile);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
      
      for await (const line of rl) {
        if (line.trim()) {
          try {
            const entry = JSON.parse(line);
            if (entry.sessionId === sessionId) {
              messages.push(entry);
            }
          } catch (parseError) {
            console.warn('Error parsing line:', parseError.message);
          }
        }
      }
    }
    
    // Sort messages by timestamp
    return messages.sort((a, b) => 
      new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
    );
  } catch (error) {
    console.error(`Error reading messages for session ${sessionId}:`, error);
    return [];
  }
}

// Rename a project's display name
async function renameProject(projectName, newDisplayName) {
  const config = await loadProjectConfig();
  
  if (!newDisplayName || newDisplayName.trim() === '') {
    // Remove custom name if empty, will fall back to auto-generated
    delete config[projectName];
  } else {
    // Set custom display name
    config[projectName] = {
      displayName: newDisplayName.trim()
    };
  }
  
  await saveProjectConfig(config);
  return true;
}

// Delete a session from a project
async function deleteSession(projectName, sessionId) {
  const projectDir = path.join(process.env.HOME, '.claude', 'projects', projectName);
  
  try {
    const files = await fs.readdir(projectDir);
    const jsonlFiles = files.filter(file => file.endsWith('.jsonl'));
    
    if (jsonlFiles.length === 0) {
      throw new Error('No session files found for this project');
    }
    
    // Check all JSONL files to find which one contains the session
    for (const file of jsonlFiles) {
      const jsonlFile = path.join(projectDir, file);
      const content = await fs.readFile(jsonlFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      // Check if this file contains the session
      const hasSession = lines.some(line => {
        try {
          const data = JSON.parse(line);
          return data.sessionId === sessionId;
        } catch {
          return false;
        }
      });
      
      if (hasSession) {
        // Filter out all entries for this session
        const filteredLines = lines.filter(line => {
          try {
            const data = JSON.parse(line);
            return data.sessionId !== sessionId;
          } catch {
            return true; // Keep malformed lines
          }
        });
        
        // Write back the filtered content
        await fs.writeFile(jsonlFile, filteredLines.join('\n') + (filteredLines.length > 0 ? '\n' : ''));
        return true;
      }
    }
    
    throw new Error(`Session ${sessionId} not found in any files`);
  } catch (error) {
    console.error(`Error deleting session ${sessionId} from project ${projectName}:`, error);
    throw error;
  }
}

// Check if a project is empty (has no sessions)
async function isProjectEmpty(projectName) {
  try {
    const sessionsResult = await getSessions(projectName, 1, 0);
    return sessionsResult.total === 0;
  } catch (error) {
    console.error(`Error checking if project ${projectName} is empty:`, error);
    return false;
  }
}

// Delete an empty project
async function deleteProject(projectName) {
  const projectDir = path.join(process.env.HOME, '.claude', 'projects', projectName);
  
  try {
    // First check if the project is empty
    const isEmpty = await isProjectEmpty(projectName);
    if (!isEmpty) {
      throw new Error('Cannot delete project with existing sessions');
    }
    
    // Remove the project directory
    await fs.rm(projectDir, { recursive: true, force: true });
    
    // Remove from project config
    const config = await loadProjectConfig();
    delete config[projectName];
    await saveProjectConfig(config);
    
    return true;
  } catch (error) {
    console.error(`Error deleting project ${projectName}:`, error);
    throw error;
  }
}

// Add a project manually to the config (without creating folders)
async function addProjectManually(projectPath, displayName = null) {
  const absolutePath = path.resolve(projectPath);
  
  try {
    // Check if the path exists
    await fs.access(absolutePath);
  } catch (error) {
    throw new Error(`Path does not exist: ${absolutePath}`);
  }
  
  // Generate project name (encode path for use as directory name)
  const projectName = absolutePath.replace(/\//g, '-');
  
  // Check if project already exists in config or as a folder
  const config = await loadProjectConfig();
  const projectDir = path.join(process.env.HOME, '.claude', 'projects', projectName);
  
  try {
    await fs.access(projectDir);
    throw new Error(`Project already exists for path: ${absolutePath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  
  if (config[projectName]) {
    throw new Error(`Project already configured for path: ${absolutePath}`);
  }
  
  // Add to config as manually added project
  config[projectName] = {
    manuallyAdded: true,
    originalPath: absolutePath
  };
  
  if (displayName) {
    config[projectName].displayName = displayName;
  }
  
  await saveProjectConfig(config);
  
  
  return {
    name: projectName,
    path: null,
    fullPath: absolutePath,
    displayName: displayName || await generateDisplayName(projectName),
    isManuallyAdded: true,
    sessions: []
  };
}

// Update session summary
async function updateSessionSummary(projectName, sessionId, summary) {
  const projectDir = path.join(process.env.HOME, '.claude', 'projects', projectName);
  
  try {
    const files = await fs.readdir(projectDir);
    const jsonlFiles = files.filter(file => file.endsWith('.jsonl'));
    
    if (jsonlFiles.length === 0) {
      throw new Error('No session files found for this project');
    }
    
    // Find the file containing this session and append a summary entry
    for (const file of jsonlFiles) {
      const jsonlFile = path.join(projectDir, file);
      const content = await fs.readFile(jsonlFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      // Check if this file contains the session
      const hasSession = lines.some(line => {
        try {
          const data = JSON.parse(line);
          return data.sessionId === sessionId;
        } catch {
          return false;
        }
      });
      
      if (hasSession) {
        // Add summary entry
        const summaryEntry = {
          sessionId,
          type: 'summary',
          summary,
          timestamp: new Date().toISOString()
        };
        
        await fs.appendFile(jsonlFile, '\n' + JSON.stringify(summaryEntry) + '\n');
        return true;
      }
    }
    
    throw new Error(`Session ${sessionId} not found in any files`);
  } catch (error) {
    console.error(`Error updating session summary for ${sessionId}:`, error);
    throw error;
  }
}


module.exports = {
  getProjects,
  getSessions,
  getSessionMessages,
  parseJsonlSessions,
  renameProject,
  deleteSession,
  isProjectEmpty,
  deleteProject,
  addProjectManually,
  loadProjectConfig,
  saveProjectConfig,
  updateSessionSummary
};