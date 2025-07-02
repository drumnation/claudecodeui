import path from 'node:path';
import * as repository from './projects.repository.js';
import * as service from './projects.service.js';
import type {Project} from './projects.types.js';

// Simple function to get projects without Express dependencies
export const getProjectsList = async (homePath: string): Promise<Project[]> => {
  const claudeDir = path.join(homePath, '.claude', 'projects');
  const projectDirs = await repository.readProjectDirectories(claudeDir);
  const config = await repository.readProjectConfig(homePath);
  const projects: Project[] = [];
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
    );
    projects.push(project);
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
          (await service.generateDisplayName(projectName)),
        fullPath: fullPath,
        isCustomName: !!projectConfig.displayName,
        isManuallyAdded: true,
        sessions: [],
      };

      projects.push(project);
    }
  }

  return projects;
};
