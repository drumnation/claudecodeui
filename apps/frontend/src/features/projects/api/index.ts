/**
 * Projects Feature API Layer - Centralized project management API
 * Following Bulletproof React pattern for API organization
 */

import { defaultLogger as log } from '@kit/logger/browser';
import type { Project, Session, ProjectsResponse, SessionsResponse, ProjectFormData } from '../types';

/**
 * Projects API service for managing project and session operations
 */
export class ProjectsAPI {
  private static instance: ProjectsAPI;
  private logger = log.child({ scope: 'ProjectsAPI' });

  static getInstance(): ProjectsAPI {
    if (!ProjectsAPI.instance) {
      ProjectsAPI.instance = new ProjectsAPI();
    }
    return ProjectsAPI.instance;
  }

  /**
   * Fetch all projects with their sessions
   */
  async fetchProjects(): Promise<Project[]> {
    const startTime = performance.now();
    
    try {
      this.logger.debug('Fetching projects from API');
      
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }

      const projects: Project[] = await response.json();
      const loadTime = performance.now() - startTime;

      this.logger.info('Projects fetched successfully', {
        projectCount: projects.length,
        loadTime: Math.round(loadTime),
        performanceCategory: loadTime > 2000 ? 'slow' : 'fast'
      });

      return projects;
    } catch (error) {
      const loadTime = performance.now() - startTime;
      this.logger.error('Failed to fetch projects', {
        error: error instanceof Error ? error.message : String(error),
        loadTime: Math.round(loadTime)
      });
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData: ProjectFormData): Promise<Project> {
    try {
      this.logger.info('Creating new project', {
        projectName: projectData.name,
        projectPath: projectData.path
      });

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create project: ${response.status}`);
      }

      const project: Project = await response.json();

      this.logger.info('Project created successfully', {
        projectId: project.id,
        projectName: project.name
      });

      return project;
    } catch (error) {
      this.logger.error('Failed to create project', {
        error: error instanceof Error ? error.message : String(error),
        projectData
      });
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectName: string): Promise<void> {
    try {
      this.logger.info('Deleting project', { projectName });

      const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete project: ${response.status}`);
      }

      this.logger.info('Project deleted successfully', { projectName });
    } catch (error) {
      this.logger.error('Failed to delete project', {
        error: error instanceof Error ? error.message : String(error),
        projectName
      });
      throw error;
    }
  }

  /**
   * Create a new session in a project
   */
  async createSession(projectName: string, title?: string): Promise<Session> {
    try {
      this.logger.info('Creating new session', { projectName, title });

      const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create session: ${response.status}`);
      }

      const session: Session = await response.json();

      this.logger.info('Session created successfully', {
        sessionId: session.id,
        projectName,
        title
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to create session', {
        error: error instanceof Error ? error.message : String(error),
        projectName,
        title
      });
      throw error;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(projectName: string, sessionId: string): Promise<void> {
    try {
      this.logger.info('Deleting session', { projectName, sessionId });

      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName)}/sessions/${encodeURIComponent(sessionId)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete session: ${response.status}`);
      }

      this.logger.info('Session deleted successfully', { projectName, sessionId });
    } catch (error) {
      this.logger.error('Failed to delete session', {
        error: error instanceof Error ? error.message : String(error),
        projectName,
        sessionId
      });
      throw error;
    }
  }

  /**
   * Update session summary
   */
  async updateSessionSummary(projectName: string, sessionId: string, summary: string): Promise<void> {
    try {
      this.logger.debug('Updating session summary', { 
        projectName, 
        sessionId, 
        summaryLength: summary.length 
      });

      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName)}/sessions/${encodeURIComponent(sessionId)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ summary }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update session: ${response.status}`);
      }

      this.logger.debug('Session summary updated successfully', { projectName, sessionId });
    } catch (error) {
      this.logger.error('Failed to update session summary', {
        error: error instanceof Error ? error.message : String(error),
        projectName,
        sessionId
      });
      throw error;
    }
  }

  /**
   * Load sessions for a project with pagination
   */
  async loadProjectSessions(
    projectName: string, 
    offset: number = 0, 
    limit: number = 10
  ): Promise<SessionsResponse> {
    try {
      this.logger.debug('Loading project sessions', { projectName, offset, limit });

      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectName)}/sessions?offset=${offset}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Failed to load sessions: ${response.status} ${response.statusText}`);
      }

      const data: SessionsResponse = await response.json();

      this.logger.debug('Project sessions loaded', {
        projectName,
        sessionCount: data.sessions.length,
        total: data.total,
        hasMore: data.hasMore
      });

      return data;
    } catch (error) {
      this.logger.error('Failed to load project sessions', {
        error: error instanceof Error ? error.message : String(error),
        projectName,
        offset,
        limit
      });
      throw error;
    }
  }

  /**
   * Search projects by name or path
   */
  async searchProjects(query: string): Promise<Project[]> {
    try {
      this.logger.debug('Searching projects', { query });

      const response = await fetch(
        `/api/projects/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const projects: Project[] = await response.json();

      this.logger.debug('Project search completed', {
        query,
        resultCount: projects.length
      });

      return projects;
    } catch (error) {
      this.logger.error('Failed to search projects', {
        error: error instanceof Error ? error.message : String(error),
        query
      });
      throw error;
    }
  }

  /**
   * Validate project data before creation
   */
  validateProjectData(projectData: ProjectFormData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!projectData.name || projectData.name.trim().length === 0) {
      errors.push('Project name is required');
    }

    if (!projectData.path || projectData.path.trim().length === 0) {
      errors.push('Project path is required');
    }

    if (projectData.name && !/^[a-zA-Z0-9_-]+$/.test(projectData.name)) {
      errors.push('Project name can only contain letters, numbers, underscores, and hyphens');
    }

    if (projectData.displayName && projectData.displayName.length > 100) {
      errors.push('Display name cannot exceed 100 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const projectsAPI = ProjectsAPI.getInstance();