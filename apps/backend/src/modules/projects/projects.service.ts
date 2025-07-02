import * as path from 'path';
import type {
  Project,
  Session,
  SessionsResult,
  JsonlEntry,
  ProjectConfig,
  FileWithStats,
} from './projects.types.js';
import * as repository from './projects.repository.js';

export const generateDisplayName = async (
  projectName: string,
): Promise<string> => {
  let projectPath = projectName.replace(/-/g, '/');

  const packageJson = await repository.readPackageJson(projectPath);
  if (packageJson?.name) {
    return packageJson.name;
  }

  if (projectPath.startsWith('/')) {
    const parts = projectPath.split('/').filter(Boolean);
    if (parts.length > 3) {
      return `.../${parts.slice(-2).join('/')}`;
    } else {
      return projectPath;
    }
  }

  return projectPath;
};

export const parseJsonlSessions = async (
  filePath: string,
): Promise<Session[]> => {
  const sessions = new Map<string, Session>();

  await repository.readJsonlFileStream(filePath, (entry) => {
    if (entry.sessionId) {
      if (!sessions.has(entry.sessionId)) {
        sessions.set(entry.sessionId, {
          id: entry.sessionId,
          summary: 'New Session',
          messageCount: 0,
          lastActivity: new Date(),
          cwd: entry.cwd || '',
        });
      }

      const session = sessions.get(entry.sessionId)!;

      if (entry.type === 'summary' && entry.summary) {
        session.summary = entry.summary;
      } else if (
        entry.message?.role === 'user' &&
        entry.message?.content &&
        session.summary === 'New Session'
      ) {
        const content = entry.message.content;
        if (typeof content === 'string' && content.length > 0) {
          if (!content.startsWith('<command-name>')) {
            session.summary =
              content.length > 50 ? content.substring(0, 50) + '...' : content;
          }
        }
      }

      session.messageCount = (session.messageCount || 0) + 1;

      if (entry.timestamp) {
        session.lastActivity = new Date(entry.timestamp);
      }
    }
  });

  return Array.from(sessions.values()).sort(
    (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime(),
  );
};

export const getSessions = async (
  homePath: string,
  projectName: string,
  limit: number = 5,
  offset: number = 0,
): Promise<SessionsResult> => {
  const projectDir = path.join(homePath, '.claude', 'projects', projectName);

  try {
    const jsonlFiles = await repository.readJsonlFiles(projectDir);

    if (jsonlFiles.length === 0) {
      return {sessions: [], hasMore: false, total: 0};
    }

    const filesWithStats = await repository.getFileStats(
      projectDir,
      jsonlFiles,
    );
    filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    const allSessions = new Map<string, Session>();
    let processedCount = 0;

    for (const {file} of filesWithStats) {
      const jsonlFile = path.join(projectDir, file);
      const sessions = await parseJsonlSessions(jsonlFile);

      sessions.forEach((session) => {
        if (!allSessions.has(session.id)) {
          allSessions.set(session.id, session);
        }
      });

      processedCount++;

      if (
        allSessions.size >= (limit + offset) * 2 &&
        processedCount >= Math.min(3, filesWithStats.length)
      ) {
        break;
      }
    }

    const sortedSessions = Array.from(allSessions.values()).sort(
      (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime(),
    );

    const total = sortedSessions.length;
    const paginatedSessions = sortedSessions.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      sessions: paginatedSessions,
      hasMore,
      total,
      offset,
      limit,
    };
  } catch (error) {
    console.error(`Error reading sessions for project ${projectName}:`, error);
    return {sessions: [], hasMore: false, total: 0};
  }
};

export const getSessionMessages = async (
  homePath: string,
  projectName: string,
  sessionId: string,
): Promise<JsonlEntry[]> => {
  const projectDir = path.join(homePath, '.claude', 'projects', projectName);

  try {
    const jsonlFiles = await repository.readJsonlFiles(projectDir);

    if (jsonlFiles.length === 0) {
      return [];
    }

    const messages: JsonlEntry[] = [];

    for (const file of jsonlFiles) {
      const jsonlFile = path.join(projectDir, file);
      await repository.readJsonlFileStream(jsonlFile, (entry) => {
        if (entry.sessionId === sessionId) {
          messages.push(entry);
        }
      });
    }

    return messages.sort(
      (a, b) =>
        new Date(a.timestamp || 0).getTime() -
        new Date(b.timestamp || 0).getTime(),
    );
  } catch (error) {
    console.error(`Error reading messages for session ${sessionId}:`, error);
    return [];
  }
};

export const buildProject = async (
  projectName: string,
  projectPath: string | null,
  config: ProjectConfig,
  homePath: string,
): Promise<Project> => {
  const customName = config[projectName]?.displayName;
  const autoDisplayName = await generateDisplayName(projectName);
  
  // Try to get the actual project path from session cwd
  let fullPath = projectName.replace(/-/g, '/');
  
  try {
    const sessionResult = await getSessions(homePath, projectName, 5, 0);
    const sessions = sessionResult.sessions || [];
    
    // Find the first session with a cwd to use as the actual project path
    const sessionWithCwd = sessions.find(s => s.cwd && path.isAbsolute(s.cwd));
    if (sessionWithCwd) {
      fullPath = sessionWithCwd.cwd;
    } else if (config[projectName]?.originalPath) {
      // Fall back to config if available
      fullPath = config[projectName].originalPath;
    }

    const project: Project = {
      name: projectName,
      path: projectPath,
      displayName: customName || autoDisplayName,
      fullPath: fullPath,
      isCustomName: !!customName,
      sessions: sessions,
    };
    
    project.sessionMeta = {
      hasMore: sessionResult.hasMore,
      total: sessionResult.total,
    };
    
    return project;
  } catch (e) {
    console.warn(
      `Could not load sessions for project ${projectName}:`,
      (e as Error).message,
    );
    
    // Return project with fallback path
    return {
      name: projectName,
      path: projectPath,
      displayName: customName || autoDisplayName,
      fullPath: fullPath,
      isCustomName: !!customName,
      sessions: [],
    };
  }
};

export const filterSessionEntriesById = (
  lines: string[],
  sessionId: string,
): string[] => {
  return lines.filter((line) => {
    try {
      const data: JsonlEntry = JSON.parse(line);
      return data.sessionId !== sessionId;
    } catch {
      return true;
    }
  });
};

export const findSessionFile = async (
  homePath: string,
  projectName: string,
  sessionId: string,
): Promise<string | null> => {
  const projectDir = path.join(homePath, '.claude', 'projects', projectName);
  const jsonlFiles = await repository.readJsonlFiles(projectDir);

  for (const file of jsonlFiles) {
    const jsonlFile = path.join(projectDir, file);
    const content = await repository.readJsonlFile(jsonlFile);
    const lines = content.split('\n').filter((line) => line.trim());

    const hasSession = lines.some((line) => {
      try {
        const data: JsonlEntry = JSON.parse(line);
        return data.sessionId === sessionId;
      } catch {
        return false;
      }
    });

    if (hasSession) {
      return jsonlFile;
    }
  }

  return null;
};

export const isProjectEmpty = async (
  homePath: string,
  projectName: string,
): Promise<boolean> => {
  try {
    const sessionsResult = await getSessions(homePath, projectName, 1, 0);
    return sessionsResult.total === 0;
  } catch (error) {
    console.error(`Error checking if project ${projectName} is empty:`, error);
    return false;
  }
};

export const updateSessionSummary = async (
  homePath: string,
  projectName: string,
  sessionId: string,
  summary: string,
): Promise<void> => {
  const jsonlFile = await findSessionFile(homePath, projectName, sessionId);

  if (!jsonlFile) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const summaryEntry = {
    sessionId,
    type: 'summary',
    summary,
    timestamp: new Date().toISOString(),
  };

  await repository.appendToJsonlFile(jsonlFile, summaryEntry);
};
