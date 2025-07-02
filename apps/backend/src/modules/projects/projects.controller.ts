import {Request, Response} from 'express';
import * as path from 'path';
import * as service from './projects.service.js';
import * as repository from './projects.repository.js';
import type {Project, ProjectConfig} from './projects.types.js';

const getHomePath = (): string => process.env['HOME'] || '';

export const getProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const homePath = getHomePath();
    const claudeDir = path.join(homePath, '.claude', 'projects');
    const config = await repository.readProjectConfig(homePath);
    const projects: Project[] = [];
    const existingProjects = new Set<string>();

    const directories = await repository.readProjectDirectories(claudeDir);

    for (const projectName of directories) {
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

    for (const [projectName, projectConfig] of Object.entries(config)) {
      if (!existingProjects.has(projectName) && projectConfig.manuallyAdded) {
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

    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({error: 'Failed to load projects'});
  }
};

export const getSessions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {projectName} = req.params;
    if (!projectName) {
      res.status(400).json({error: 'Project name is required'});
      return;
    }
    const limit = parseInt(req.query.limit as string) || 5;
    const offset = parseInt(req.query.offset as string) || 0;

    const homePath = getHomePath();
    const sessions = await service.getSessions(
      homePath,
      projectName,
      limit,
      offset,
    );
    res.json(sessions);
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({error: 'Failed to load sessions'});
  }
};

export const getSessionMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {projectName, sessionId} = req.params;
    if (!projectName || !sessionId) {
      res.status(400).json({error: 'Project name and session ID are required'});
      return;
    }
    const homePath = getHomePath();
    const messages = await service.getSessionMessages(
      homePath,
      projectName,
      sessionId,
    );
    res.json({messages});
  } catch (error) {
    console.error('Error getting session messages:', error);
    res.status(500).json({error: 'Failed to load session messages'});
  }
};

export const renameProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {projectName} = req.params;
    if (!projectName) {
      res.status(400).json({error: 'Project name is required'});
      return;
    }
    const {displayName} = req.body;

    const homePath = getHomePath();
    const config = await repository.readProjectConfig(homePath);

    if (!displayName || displayName.trim() === '') {
      delete config[projectName];
    } else {
      config[projectName] = {
        displayName: displayName.trim(),
      };
    }

    await repository.writeProjectConfig(homePath, config);
    res.json({success: true});
  } catch (error) {
    console.error('Error renaming project:', error);
    res.status(500).json({error: 'Failed to rename project'});
  }
};

export const deleteSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {projectName, sessionId} = req.params;
    if (!projectName || !sessionId) {
      res.status(400).json({error: 'Project name and session ID are required'});
      return;
    }
    const homePath = getHomePath();

    const jsonlFile = await service.findSessionFile(
      homePath,
      projectName,
      sessionId,
    );

    if (!jsonlFile) {
      res.status(404).json({error: `Session ${sessionId} not found`});
      return;
    }

    const content = await repository.readJsonlFile(jsonlFile);
    const lines = content.split('\n').filter((line) => line.trim());
    const filteredLines = service.filterSessionEntriesById(lines, sessionId);

    await repository.writeJsonlFile(
      jsonlFile,
      filteredLines.join('\n') + (filteredLines.length > 0 ? '\n' : ''),
    );

    res.json({success: true});
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({error: 'Failed to delete session'});
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {projectName} = req.params;
    if (!projectName) {
      res.status(400).json({error: 'Project name is required'});
      return;
    }
    const homePath = getHomePath();

    const isEmpty = await service.isProjectEmpty(homePath, projectName);
    if (!isEmpty) {
      res
        .status(400)
        .json({error: 'Cannot delete project with existing sessions'});
      return;
    }

    const projectDir = path.join(homePath, '.claude', 'projects', projectName);
    await repository.removeDirectory(projectDir);

    const config = await repository.readProjectConfig(homePath);
    delete config[projectName];
    await repository.writeProjectConfig(homePath, config);

    res.json({success: true});
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({error: 'Failed to delete project'});
  }
};

export const addProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {projectPath: inputPath, displayName} = req.body;

    if (!inputPath) {
      res.status(400).json({error: 'Project path is required'});
      return;
    }

    const absolutePath = path.resolve(inputPath);
    const pathExists = await repository.checkPathExists(absolutePath);

    if (!pathExists) {
      res.status(400).json({error: `Path does not exist: ${absolutePath}`});
      return;
    }

    const projectName = absolutePath.replace(/\//g, '-');
    const homePath = getHomePath();
    const config = await repository.readProjectConfig(homePath);
    const projectDir = path.join(homePath, '.claude', 'projects', projectName);

    const dirExists = await repository.checkDirectoryExists(projectDir);
    if (dirExists || config[projectName]) {
      res
        .status(400)
        .json({error: `Project already exists for path: ${absolutePath}`});
      return;
    }

    config[projectName] = {
      manuallyAdded: true,
      originalPath: absolutePath,
    };

    if (displayName) {
      config[projectName].displayName = displayName;
    }

    await repository.writeProjectConfig(homePath, config);

    const project: Project = {
      name: projectName,
      path: null,
      fullPath: absolutePath,
      displayName:
        displayName || (await service.generateDisplayName(projectName)),
      isCustomName: !!displayName,
      isManuallyAdded: true,
      sessions: [],
    };

    res.json(project);
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({error: 'Failed to add project'});
  }
};

export const updateSessionSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {projectName, sessionId} = req.params;
    if (!projectName || !sessionId) {
      res.status(400).json({error: 'Project name and session ID are required'});
      return;
    }
    const {summary} = req.body;

    if (!summary) {
      res.status(400).json({error: 'Summary is required'});
      return;
    }

    const homePath = getHomePath();
    const jsonlFile = await service.findSessionFile(
      homePath,
      projectName,
      sessionId,
    );

    if (!jsonlFile) {
      res.status(404).json({error: `Session ${sessionId} not found`});
      return;
    }

    const summaryEntry = {
      sessionId,
      type: 'summary',
      summary,
      timestamp: new Date().toISOString(),
    };

    await repository.appendToJsonlFile(jsonlFile, summaryEntry);
    res.json({success: true});
  } catch (error) {
    console.error('Error updating session summary:', error);
    res.status(500).json({error: 'Failed to update session summary'});
  }
};
