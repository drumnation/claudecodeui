import {promises as fs} from 'fs';
import path from 'path';

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
): Promise<string[]> => {
  try {
    console.log('🔍 Looking for scripts in:', projectPath);
    const packageJson = await readPackageJson(projectPath);

    if (!packageJson) {
      console.log('📦 No package.json found at:', projectPath);
      return [];
    }

    if (packageJson.scripts) {
      const scripts = Object.keys(packageJson.scripts);
      console.log('📜 Found scripts:', scripts);
      return scripts;
    }

    console.log('📦 No scripts section in package.json');
    return [];
  } catch (error) {
    console.error('❌ Error reading package.json:', (error as Error).message);
    return [];
  }
};
