import {promises as fs} from 'fs';
import {createReadStream} from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import type {
  ProjectConfig,
  JsonlEntry,
  FileWithStats,
  PackageJson,
} from './projects.types.js';
import type { Logger } from '@kit/logger';

export const readProjectConfig = async (
  homePath: string,
): Promise<ProjectConfig> => {
  const configPath = path.join(homePath, '.claude', 'project-config.json');
  try {
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    return {};
  }
};

export const writeProjectConfig = async (
  homePath: string,
  config: ProjectConfig,
): Promise<void> => {
  const configPath = path.join(homePath, '.claude', 'project-config.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
};

export const readProjectDirectories = async (
  claudeDir: string,
  logger: Logger,
): Promise<string[]> => {
  try {
    const entries = await fs.readdir(claudeDir, {withFileTypes: true});
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    logger.error('Error reading projects directory:', { error });
    return [];
  }
};

export const readPackageJson = async (
  projectPath: string,
): Promise<PackageJson | null> => {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageData = await fs.readFile(packageJsonPath, 'utf8');
    return JSON.parse(packageData);
  } catch (error) {
    return null;
  }
};

export const readJsonlFiles = async (projectDir: string, logger: Logger): Promise<string[]> => {
  try {
    const files = await fs.readdir(projectDir);
    return files.filter((file) => file.endsWith('.jsonl'));
  } catch (error) {
    logger.error('Error reading JSONL files:', { error });
    return [];
  }
};

export const getFileStats = async (
  projectDir: string,
  files: string[],
): Promise<FileWithStats[]> => {
  return Promise.all(
    files.map(async (file) => {
      const filePath = path.join(projectDir, file);
      const stats = await fs.stat(filePath);
      return {file, mtime: stats.mtime};
    }),
  );
};

export const readJsonlFileStream = async (
  filePath: string,
  onLine: (entry: JsonlEntry) => void,
  logger: Logger,
): Promise<void> => {
  const fileStream = createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;

  for await (const line of rl) {
    if (line.trim()) {
      lineCount++;
      try {
        const entry: JsonlEntry = JSON.parse(line);
        onLine(entry);
      } catch (parseError) {
        logger.warn(
          `[JSONL Parser] Error parsing line ${lineCount}:`,
          { error: (parseError as Error).message },
        );
      }
    }
  }
};

export const readJsonlFile = async (filePath: string): Promise<string> => {
  return fs.readFile(filePath, 'utf8');
};

export const writeJsonlFile = async (
  filePath: string,
  content: string,
): Promise<void> => {
  await fs.writeFile(filePath, content);
};

export const appendToJsonlFile = async (
  filePath: string,
  entry: JsonlEntry,
): Promise<void> => {
  await fs.appendFile(filePath, '\n' + JSON.stringify(entry) + '\n');
};

export const removeDirectory = async (dirPath: string): Promise<void> => {
  await fs.rm(dirPath, {recursive: true, force: true});
};

export const checkPathExists = async (
  absolutePath: string,
): Promise<boolean> => {
  try {
    await fs.access(absolutePath);
    return true;
  } catch (error) {
    return false;
  }
};

export const checkDirectoryExists = async (
  dirPath: string,
): Promise<boolean> => {
  try {
    await fs.access(dirPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
};
