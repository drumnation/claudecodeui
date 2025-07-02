import {promises as fs} from 'fs';
import path from 'path';
import type {Logger} from '@kit/logger/types';

export const readPackageJson = async (projectPath: string): Promise<any> => {
  const packageJsonPath = path.join(projectPath, 'package.json');

  try {
    await fs.access(packageJsonPath);
    const content = await fs.readFile(packageJsonPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
};

export const getAvailableScripts = async (
  projectPath: string,
  logger: Logger,
): Promise<string[]> => {
  try {
    logger.debug('🔍 Looking for scripts', {projectPath});
    const packageJson = await readPackageJson(projectPath);

    if (!packageJson) {
      logger.debug('📦 No package.json found', {projectPath});
      return [];
    }

    if (packageJson.scripts) {
      const scripts = Object.keys(packageJson.scripts);
      logger.debug('📜 Found scripts', {scripts, projectPath});
      return scripts;
    }

    logger.debug('📦 No scripts section in package.json', {projectPath});
    return [];
  } catch (error) {
    logger.error('❌ Error reading package.json', {error: (error as Error).message, projectPath});
    return [];
  }
};
