import path from 'node:path';
import * as repository from './projects.repository.js';
import * as service from './projects.service.js';
import type {Project} from './projects.types.js';
import { createLogger } from '@kit/logger/node';

// Helper function to group projects by merging subfolders into main projects
const groupProjectsHierarchically = (projects: Project[]): Project[] => {
  const logger = createLogger({ scope: 'project-grouping' });
  
  logger.debug('Starting project grouping', {
    totalProjects: projects.length,
    projectNames: projects.map(p => p.name),
    projectPaths: projects.map(p => p.fullPath)
  });
  
  const projectGroups = new Map<string, Project[]>();
  const processedProjects = new Set<string>();
  
  // First pass: identify which projects are subfolders of other projects
  for (const project of projects) {
    if (processedProjects.has(project.name)) continue;
    
    let rootProject = project;
    let isSubfolder = false;
    
    // Find if this project is a subfolder of another project
    for (const otherProject of projects) {
      if (otherProject.name !== project.name && 
          project.fullPath.startsWith(otherProject.fullPath + '/')) {
        // This project is a subfolder of otherProject
        rootProject = otherProject;
        isSubfolder = true;
        break;
      }
    }
    
    // Only group projects that are actual subfolders, not separate root projects
    if (isSubfolder || projects.some(p => 
      p.name !== project.name && 
      p.fullPath.startsWith(project.fullPath + '/')
    )) {
      // This project has subfolders or is a subfolder itself
      const rootName = rootProject.name;
      
      if (!projectGroups.has(rootName)) {
        projectGroups.set(rootName, []);
      }
      projectGroups.get(rootName)!.push(project);
      processedProjects.add(project.name);
    } else {
      // This is a standalone project - keep it separate
      projectGroups.set(project.name, [project]);
      processedProjects.add(project.name);
    }
  }
  // Second pass: Add any remaining unprocessed projects (subprojects)
  for (const project of projects) {
    if (!processedProjects.has(project.name)) {
      // Find which group this should belong to
      for (const otherProject of projects) {
        if (otherProject.name !== project.name && 
            project.fullPath.startsWith(otherProject.fullPath + '/') &&
            projectGroups.has(otherProject.name)) {
          projectGroups.get(otherProject.name)!.push(project);
          processedProjects.add(project.name);
          break;
        }
      }
      
      // If still not processed, add as standalone
      if (!processedProjects.has(project.name)) {
        projectGroups.set(project.name, [project]);
        processedProjects.add(project.name);
      }
    }
  }
  
  // Create consolidated projects
  const consolidatedProjects: Project[] = [];
  
  for (const [rootName, projectGroup] of projectGroups) {
    if (projectGroup.length === 1) {
      // Single project - no consolidation needed
      consolidatedProjects.push(projectGroup[0]);
    } else {
      // Multiple projects - consolidate subfolders
      // Find the main project (shortest path or exact name match)
      const mainProject = projectGroup.find(p => p.name === rootName) || 
                         projectGroup.reduce((main, current) => 
                           current.fullPath.length < main.fullPath.length ? current : main
                         );
      
      // Merge all sessions from subprojects into the main project
      const allSessions: any[] = [];
      let totalSessionCount = 0;
      const seenSessionIds = new Set<string>();
      
      for (const project of projectGroup) {
        if (project.sessions) {
          // Add sessions, keeping original session IDs
          for (const session of project.sessions) {
            // Use original session ID - no need to make it "unique" with project name
            const sessionId = session.id;
            
            // Only add if we haven't seen this exact session before
            if (!seenSessionIds.has(sessionId)) {
              const sessionWithMetadata = {
                ...session,
                id: sessionId, // Keep original session ID
                projectName: project.name,
                projectPath: project.fullPath
              };
              
              allSessions.push(sessionWithMetadata);
              seenSessionIds.add(sessionId);
              totalSessionCount++;
            }
          }
        }
      }
      
      // Sort sessions by last activity (most recent first)
      allSessions.sort((a, b) => {
        const dateA = new Date(a.lastActivity || a.updatedAt || a.updated_at || 0);
        const dateB = new Date(b.lastActivity || b.updatedAt || b.updated_at || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Create consolidated project
      const consolidatedProject: Project = {
        ...mainProject,
        sessions: allSessions,
        sessionMeta: {
          ...mainProject.sessionMeta,
          total: totalSessionCount,
          totalSessions: totalSessionCount,
          hasMore: mainProject.sessionMeta?.hasMore || false
        }
      };
      
      consolidatedProjects.push(consolidatedProject);
    }
  }
  
  logger.debug('Project grouping completed', {
    inputProjects: projects.length,
    outputProjects: consolidatedProjects.length,
    groups: Array.from(projectGroups.entries()).map(([name, projects]) => ({
      groupName: name,
      projectCount: projects.length,
      projectNames: projects.map(p => p.name)
    })),
    finalProjects: consolidatedProjects.map(p => ({
      name: p.name,
      sessionCount: p.sessions?.length || 0,
      displayName: p.displayName
    }))
  });
  
  return consolidatedProjects;
};

// Simple function to get projects without Express dependencies
export const getProjectsList = async (homePath: string): Promise<Project[]> => {
  const logger = createLogger({ scope: 'projects-facade' });
  const claudeDir = path.join(homePath, '.claude', 'projects');
  const projectDirs = await repository.readProjectDirectories(claudeDir, logger);
  const config = await repository.readProjectConfig(homePath);
  const allProjects: Project[] = [];
  const existingProjects = new Set<string>();

  // Process existing project directories
  for (const projectName of projectDirs) {
    existingProjects.add(projectName);
    const projectPath = path.join(claudeDir, projectName);
    const project = await service.buildProject(
      projectName,
      projectPath,
      config,
      homePath,
      logger,
    );
    allProjects.push(project);
  }

  // Process manually added projects from config
  for (const [projectName, projectConfig] of Object.entries(config)) {
    if (
      !existingProjects.has(projectName) &&
      typeof projectConfig === 'object' &&
      projectConfig.manuallyAdded
    ) {
      const fullPath = projectName.replace(/-/g, '/');

      const project: Project = {
        name: projectName,
        path: null,
        displayName:
          projectConfig.displayName ||
          (await service.generateDisplayName(projectName, logger)),
        fullPath: fullPath,
        isCustomName: !!projectConfig.displayName,
        isManuallyAdded: true,
        sessions: [],
      };

      allProjects.push(project);
    }
  }

  // Group projects by consolidating subfolders
  const consolidatedProjects = groupProjectsHierarchically(allProjects);
  
  logger.debug('Consolidated projects by merging subfolders', {
    originalProjects: allProjects.length,
    consolidatedProjects: consolidatedProjects.length,
    consolidatedStructure: consolidatedProjects.map(p => ({
      name: p.name,
      fullPath: p.fullPath,
      sessionCount: p.sessions?.length || 0,
      totalSessions: p.sessionMeta?.totalSessions || 0
    }))
  });

  return consolidatedProjects;
};
