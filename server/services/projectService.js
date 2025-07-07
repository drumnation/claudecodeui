/**
 * Project service that orchestrates project-related business logic
 * Combines core utilities with adapters for clean separation of concerns
 */

const path = require('path');
const os = require('os');
const fs = require('../adapters/fsAdapter');
const logger = require('../adapters/logger').create('ProjectService');
const {
  encodeProjectPath,
  decodeProjectPath,
  extractProjectName,
  generateDisplayNameFromPath,
  sortProjects,
  filterProjects,
  transformProjectForAPI,
  calculateProjectStats
} = require('../core/projectUtils');
const {
  annotateMonorepo,
  detectLanguage,
  detectWorktree,
  getMainRepoPath
} = require('../monorepo');

class ProjectService {
  constructor() {
    this.claudeDir = path.join(os.homedir(), '.claude');
    this.projectsJsonPath = path.join(this.claudeDir, 'projects.json');
  }

  /**
   * Get all projects with their metadata
   * @returns {Promise<Object>} Map of projects by path
   */
  async getProjects() {
    try {
      logger.time('getProjects');
      
      // Read projects configuration
      const projectsData = await this._readProjectsConfig();
      
      // Enhance each project with additional metadata
      const enhancedProjects = {};
      
      for (const [projectPath, projectData] of Object.entries(projectsData)) {
        try {
          const enhanced = await this._enhanceProjectData(projectPath, projectData);
          enhancedProjects[projectPath] = enhanced;
        } catch (error) {
          logger.error(`Failed to enhance project ${projectPath}`, { error: error.message });
          // Include the project anyway, but mark it as having issues
          enhancedProjects[projectPath] = {
            ...projectData,
            path: projectPath,
            error: error.message,
            missing: true
          };
        }
      }
      
      logger.timeEnd('getProjects');
      return enhancedProjects;
    } catch (error) {
      logger.logError(error, 'Failed to get projects');
      return {};
    }
  }

  /**
   * Get a single project by path
   * @param {string} projectPath - The project path
   * @returns {Promise<Object|null>} Project data or null
   */
  async getProject(projectPath) {
    const projects = await this.getProjects();
    return projects[projectPath] || null;
  }

  /**
   * Create a new project
   * @param {string} projectPath - The project path
   * @param {string} customName - Optional custom name
   * @returns {Promise<boolean>} Success status
   */
  async createProject(projectPath, customName) {
    try {
      logger.info('Creating project', { projectPath, customName });
      
      const projects = await this._readProjectsConfig();
      
      // Check if project already exists
      if (projects[projectPath]) {
        logger.warn('Project already exists', { projectPath });
        return false;
      }
      
      // Generate project metadata
      const projectName = path.basename(projectPath);
      const displayName = customName || await this.generateDisplayName(projectPath);
      const language = await detectLanguage(projectPath);
      
      // Create project entry
      projects[projectPath] = {
        name: projectName,
        path: projectPath,
        displayName,
        language,
        created: new Date().toISOString()
      };
      
      // Save updated projects
      await this._saveProjectsConfig(projects);
      
      // Create project directory structure
      await this._createProjectStructure(projectPath);
      
      logger.info('Project created successfully', { projectPath });
      return true;
    } catch (error) {
      logger.logError(error, 'Failed to create project');
      return false;
    }
  }

  /**
   * Rename/move a project
   * @param {string} oldPath - Current project path
   * @param {string} newPath - New project path
   * @returns {Promise<boolean>} Success status
   */
  async renameProject(oldPath, newPath) {
    try {
      logger.info('Renaming project', { oldPath, newPath });
      
      const projects = await this._readProjectsConfig();
      
      if (!projects[oldPath]) {
        logger.warn('Project not found', { oldPath });
        return false;
      }
      
      // Update project entry
      projects[newPath] = {
        ...projects[oldPath],
        path: newPath,
        name: path.basename(newPath)
      };
      
      delete projects[oldPath];
      
      // Save updated projects
      await this._saveProjectsConfig(projects);
      
      logger.info('Project renamed successfully', { oldPath, newPath });
      return true;
    } catch (error) {
      logger.logError(error, 'Failed to rename project');
      return false;
    }
  }

  /**
   * Delete a project
   * @param {string} projectPath - The project path
   * @returns {Promise<boolean>} Success status
   */
  async deleteProject(projectPath) {
    try {
      logger.info('Deleting project', { projectPath });
      
      const projects = await this._readProjectsConfig();
      
      if (!projects[projectPath]) {
        logger.warn('Project not found', { projectPath });
        return false;
      }
      
      // Remove project entry
      delete projects[projectPath];
      
      // Save updated projects
      await this._saveProjectsConfig(projects);
      
      // Delete project data directory
      await this._deleteProjectData(projectPath);
      
      logger.info('Project deleted successfully', { projectPath });
      return true;
    } catch (error) {
      logger.logError(error, 'Failed to delete project');
      return false;
    }
  }

  /**
   * Generate display name for a project
   * @param {string} projectPath - The project path
   * @returns {Promise<string>} Display name
   */
  async generateDisplayName(projectPath) {
    try {
      // Try to extract name from various manifest files
      const manifestFiles = [
        { file: 'package.json', type: 'package.json' },
        { file: 'pyproject.toml', type: 'pyproject.toml' },
        { file: 'Cargo.toml', type: 'Cargo.toml' },
        { file: 'go.mod', type: 'go.mod' },
        { file: 'pom.xml', type: 'pom.xml' },
        { file: 'composer.json', type: 'composer.json' },
        { file: 'pubspec.yaml', type: 'pubspec.yaml' }
      ];
      
      for (const { file, type } of manifestFiles) {
        const manifestPath = path.join(projectPath, file);
        if (await fs.exists(manifestPath)) {
          try {
            const content = await fs.readFile(manifestPath);
            const name = extractProjectName(content, type);
            if (name) return name;
          } catch (error) {
            logger.debug(`Failed to read ${file}`, { error: error.message });
          }
        }
      }
      
      // Fallback to directory name
      return generateDisplayNameFromPath(projectPath);
    } catch (error) {
      logger.error('Failed to generate display name', { error: error.message });
      return generateDisplayNameFromPath(projectPath);
    }
  }

  /**
   * Get project statistics
   * @returns {Promise<Object>} Project statistics
   */
  async getProjectStats() {
    const projects = await this.getProjects();
    return calculateProjectStats(projects);
  }

  /**
   * Search projects
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching projects
   */
  async searchProjects(searchTerm, options = {}) {
    const projects = await this.getProjects();
    const projectArray = Object.values(projects);
    
    const filtered = filterProjects(projectArray, {
      ...options,
      searchTerm
    });
    
    return sortProjects(filtered, options.sortBy || 'lastActivity');
  }

  // Private methods

  async _readProjectsConfig() {
    try {
      return await fs.readJSONOrDefault(this.projectsJsonPath, {});
    } catch (error) {
      logger.error('Failed to read projects config', { error: error.message });
      return {};
    }
  }

  async _saveProjectsConfig(projects) {
    await fs.ensureDir(this.claudeDir);
    await fs.writeJSON(this.projectsJsonPath, projects);
  }

  async _enhanceProjectData(projectPath, projectData) {
    const enhanced = { ...projectData, path: projectPath };
    
    // Check if project exists
    enhanced.missing = !(await fs.exists(projectPath));
    
    if (!enhanced.missing) {
      // Detect language if not already set
      if (!enhanced.language) {
        enhanced.language = await detectLanguage(projectPath);
      }
      
      // Detect monorepo
      const monorepoData = await annotateMonorepo(enhanced);
      Object.assign(enhanced, monorepoData);
      
      // Detect worktree
      enhanced.isWorktree = await detectWorktree(projectPath);
      if (enhanced.isWorktree) {
        enhanced.mainRepoPath = await getMainRepoPath(projectPath);
      }
      
      // Load sessions
      enhanced.sessions = await this._loadProjectSessions(projectPath);
      
      // Calculate last activity
      if (enhanced.sessions && enhanced.sessions.length > 0) {
        const lastSession = enhanced.sessions[0];
        enhanced.lastActivity = lastSession.lastActivity || lastSession.created;
      }
    }
    
    // Ensure display name
    if (!enhanced.displayName) {
      enhanced.displayName = enhanced.name || generateDisplayNameFromPath(projectPath);
    }
    
    return enhanced;
  }

  async _loadProjectSessions(projectPath) {
    try {
      const projectDir = path.join(this.claudeDir, 'projects', encodeProjectPath(projectPath));
      const sessionsFile = path.join(projectDir, 'sessions.jsonl');
      
      if (await fs.exists(sessionsFile)) {
        const sessions = await fs.readJSONL(sessionsFile);
        // Sort by last activity (most recent first)
        return sessions.sort((a, b) => {
          const aTime = new Date(a.lastActivity || a.created || 0).getTime();
          const bTime = new Date(b.lastActivity || b.created || 0).getTime();
          return bTime - aTime;
        });
      }
    } catch (error) {
      logger.debug('Failed to load project sessions', { projectPath, error: error.message });
    }
    
    return [];
  }

  async _createProjectStructure(projectPath) {
    const projectDir = path.join(this.claudeDir, 'projects', encodeProjectPath(projectPath));
    const sessionsDir = path.join(projectDir, 'sessions');
    
    await fs.ensureDir(projectDir);
    await fs.ensureDir(sessionsDir);
    
    // Create initial sessions.jsonl file
    const sessionsFile = path.join(projectDir, 'sessions.jsonl');
    if (!(await fs.exists(sessionsFile))) {
      await fs.writeFile(sessionsFile, '');
    }
  }

  async _deleteProjectData(projectPath) {
    try {
      const projectDir = path.join(this.claudeDir, 'projects', encodeProjectPath(projectPath));
      if (await fs.exists(projectDir)) {
        await fs.remove(projectDir);
      }
    } catch (error) {
      logger.error('Failed to delete project data', { projectPath, error: error.message });
    }
  }
}

// Export singleton instance
module.exports = new ProjectService();