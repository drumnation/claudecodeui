import { execFile } from 'child_process';
import { promisify } from 'util';
import { access, constants } from 'fs';
import { promisify as fsPromisify } from 'util';
import * as path from 'path';
import * as os from 'os';
import { createLogger } from '@kit/logger/node';

const execFileAsync = promisify(execFile);
const accessAsync = fsPromisify(access);
const logger = createLogger({ scope: 'cli-resolver' });

// Cache for resolved CLI paths
const cliPathCache = new Map<string, string | null>();

/**
 * Platform-specific path separator and common directories
 */
const PATH_SEPARATOR = process.platform === 'win32' ? ';' : ':';
const IS_WINDOWS = process.platform === 'win32';

/**
 * Get common npm global bin directories based on platform
 */
async function getNpmGlobalBinPaths(): Promise<string[]> {
  const paths: string[] = [];
  const homeDir = os.homedir();

  if (IS_WINDOWS) {
    // Windows npm global paths
    paths.push(path.join(homeDir, 'AppData', 'Roaming', 'npm'));
    paths.push(path.join(process.env.APPDATA || '', 'npm'));
  } else {
    // Unix-like npm global paths
    paths.push(path.join(homeDir, '.npm-global', 'bin'));
    paths.push(path.join(homeDir, '.npm', 'bin'));
    paths.push('/usr/local/bin');
    paths.push('/opt/homebrew/bin'); // macOS with Homebrew on ARM
    paths.push('/usr/local/lib/node_modules/.bin');
    
    // Additional common locations
    paths.push(path.join(homeDir, '.local', 'bin'));
    paths.push(path.join(homeDir, 'bin'));
  }

  // Try to get npm prefix dynamically
  try {
    const { stdout } = await execFileAsync('npm', ['config', 'get', 'prefix'], {
      timeout: 5000
    });
    const prefix = stdout.trim();
    if (prefix) {
      const npmBinPath = IS_WINDOWS ? prefix : path.join(prefix, 'bin');
      if (!paths.includes(npmBinPath)) {
        paths.push(npmBinPath);
      }
    }
  } catch (error: any) {
    logger.debug('Failed to get npm prefix', { error: error.message });
  }

  // Try to get pnpm global bin directory
  try {
    const { stdout } = await execFileAsync('pnpm', ['config', 'get', 'global-bin-dir'], {
      timeout: 5000
    });
    const pnpmBin = stdout.trim();
    if (pnpmBin && !paths.includes(pnpmBin)) {
      paths.push(pnpmBin);
    }
  } catch {
    // Try alternative method for pnpm
    try {
      const { stdout } = await execFileAsync('pnpm', ['store', 'path'], {
        timeout: 5000
      });
      const storePath = stdout.trim();
      if (storePath) {
        const pnpmBin = storePath.replace(/\/store.*/, '/bin');
        if (!paths.includes(pnpmBin)) {
          paths.push(pnpmBin);
        }
      }
    } catch {
      // Common pnpm locations as fallback
      const pnpmPaths = [
        path.join(homeDir, '.local', 'share', 'pnpm'),
        path.join(homeDir, '.pnpm', 'bin'),
        path.join(homeDir, 'Library', 'pnpm') // macOS
      ];
      paths.push(...pnpmPaths);
    }
  }

  return paths;
}

/**
 * Enhance PATH environment variable with common CLI locations
 */
export async function enhancePath(currentPath?: string): Promise<string> {
  const existingPath = currentPath || process.env.PATH || '';
  const existingPaths = new Set(existingPath.split(PATH_SEPARATOR).filter(Boolean));
  const additionalPaths = await getNpmGlobalBinPaths();

  // Add additional paths that aren't already in PATH
  for (const additionalPath of additionalPaths) {
    if (!existingPaths.has(additionalPath)) {
      existingPaths.add(additionalPath);
    }
  }

  return Array.from(existingPaths).join(PATH_SEPARATOR);
}

/**
 * Get enhanced environment with updated PATH
 */
export async function getEnhancedEnv(): Promise<NodeJS.ProcessEnv> {
  return {
    ...process.env,
    PATH: await enhancePath(process.env.PATH)
  };
}

/**
 * Check if a file is executable
 */
async function isExecutable(filePath: string): Promise<boolean> {
  try {
    await accessAsync(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Search for CLI in PATH directories
 */
async function searchInPath(cliName: string, pathDirs: string[]): Promise<string | null> {
  const executableExtensions = IS_WINDOWS ? ['.exe', '.cmd', '.bat', ''] : [''];

  for (const dir of pathDirs) {
    for (const ext of executableExtensions) {
      const fullPath = path.join(dir, cliName + ext);
      if (await isExecutable(fullPath)) {
        return fullPath;
      }
    }
  }

  return null;
}

/**
 * Resolve CLI path with enhanced PATH and environment variable support
 * 
 * @param cliName - Name of the CLI executable (e.g., 'backlog', 'claude')
 * @param envVarName - Optional environment variable name for custom path (e.g., 'BACKLOG_CLI_PATH')
 * @param options - Additional options for resolution
 * @returns Resolved CLI path or null if not found
 */
export async function resolveCli(
  cliName: string,
  envVarName?: string,
  options: {
    useCache?: boolean;
    enhancePath?: boolean;
  } = {}
): Promise<string | null> {
  const { useCache = true, enhancePath: shouldEnhancePath = true } = options;
  const cacheKey = `${cliName}:${envVarName || ''}`;
  const startTime = Date.now();

  // Check cache first
  if (useCache && cliPathCache.has(cacheKey)) {
    const cachedPath = cliPathCache.get(cacheKey);
    logger.debug('Using cached CLI path', { cliName, path: cachedPath });
    return cachedPath || null;
  }

  logger.info('Resolving CLI path', { cliName, envVarName, options });

  // First, check environment variable if provided
  if (envVarName && process.env[envVarName]) {
    const customPath = process.env[envVarName];
    logger.debug('Checking custom CLI path from env var', { envVarName, customPath });
    
    if (await isExecutable(customPath)) {
      logger.info('Found CLI at custom path', { cliName, customPath });
      cliPathCache.set(cacheKey, customPath);
      return customPath;
    } else {
      logger.warn('Custom CLI path is not executable', { cliName, customPath });
    }
  }

  // Get PATH directories to search
  const pathEnv = shouldEnhancePath ? await enhancePath() : (process.env.PATH || '');
  const pathDirs = pathEnv.split(PATH_SEPARATOR).filter(Boolean);
  
  logger.debug('Searching for CLI in PATH', { 
    cliName, 
    pathDirsCount: pathDirs.length,
    enhancedPath: shouldEnhancePath
  });

  // Search in PATH
  const foundPath = await searchInPath(cliName, pathDirs);
  
  if (foundPath) {
    const duration = Date.now() - startTime;
    logger.info('Found CLI in PATH', { cliName, foundPath, duration });
    cliPathCache.set(cacheKey, foundPath);
    return foundPath;
  }

  // Try 'which' command as fallback (Unix-like systems)
  if (!IS_WINDOWS) {
    try {
      const enhancedEnv = await getEnhancedEnv();
      const { stdout } = await execFileAsync('which', [cliName], {
        env: enhancedEnv,
        timeout: 5000
      });
      const whichPath = stdout.trim();
      if (whichPath && await isExecutable(whichPath)) {
        logger.info('Found CLI using which', { cliName, whichPath });
        cliPathCache.set(cacheKey, whichPath);
        return whichPath;
      }
    } catch (error: any) {
      logger.debug('which command failed', { cliName, error: error.message });
    }
  }

  // Try 'where' command as fallback (Windows)
  if (IS_WINDOWS) {
    try {
      const enhancedEnv = await getEnhancedEnv();
      const { stdout } = await execFileAsync('where', [cliName], {
        env: enhancedEnv,
        timeout: 5000
      });
      const wherePaths = stdout.trim().split('\n').filter(Boolean);
      for (const wherePath of wherePaths) {
        if (await isExecutable(wherePath.trim())) {
          const resolvedPath = wherePath.trim();
          logger.info('Found CLI using where', { cliName, resolvedPath });
          cliPathCache.set(cacheKey, resolvedPath);
          return resolvedPath;
        }
      }
    } catch (error: any) {
      logger.debug('where command failed', { cliName, error: error.message });
    }
  }

  const duration = Date.now() - startTime;
  logger.warn('CLI not found', { 
    cliName, 
    duration,
    searchedPaths: pathDirs.slice(0, 10), // Log first 10 paths for debugging
    totalPathDirs: pathDirs.length,
    enhancedPath: shouldEnhancePath 
  });
  
  // Cache negative result
  cliPathCache.set(cacheKey, null);
  return null;
}

/**
 * Clear CLI resolution cache
 * @param cliName - Optional CLI name to clear specific cache entry
 */
export function clearCliCache(cliName?: string): void {
  if (cliName) {
    // Clear all cache entries for this CLI
    const keysToDelete = Array.from(cliPathCache.keys()).filter(key => key.startsWith(`${cliName}:`));
    keysToDelete.forEach(key => cliPathCache.delete(key));
    logger.debug('Cleared CLI cache for specific CLI', { cliName, entriesCleared: keysToDelete.length });
  } else {
    // Clear entire cache
    const size = cliPathCache.size;
    cliPathCache.clear();
    logger.debug('Cleared entire CLI cache', { entriesCleared: size });
  }
}

/**
 * Debug CLI resolution - provides detailed information about the resolution process
 */
export async function debugCliResolution(cliName: string, envVarName?: string): Promise<{
  found: boolean;
  path: string | null;
  searchPaths: string[];
  npmGlobalBin: string | null;
  pnpmGlobalBin: string | null;
  environmentVariable: string | null;
  whichResult: string | null;
  commonLocations: Record<string, boolean>;
}> {
  const result = {
    found: false,
    path: null as string | null,
    searchPaths: [] as string[],
    npmGlobalBin: null as string | null,
    pnpmGlobalBin: null as string | null,
    environmentVariable: envVarName ? process.env[envVarName] || null : null,
    whichResult: null as string | null,
    commonLocations: {} as Record<string, boolean>
  };

  // Get npm and pnpm global bins
  try {
    const { stdout: npmPrefix } = await execFileAsync('npm', ['config', 'get', 'prefix'], { timeout: 5000 });
    result.npmGlobalBin = IS_WINDOWS ? npmPrefix.trim() : `${npmPrefix.trim()}/bin`;
  } catch {}

  try {
    const { stdout: pnpmBin } = await execFileAsync('pnpm', ['config', 'get', 'global-bin-dir'], { timeout: 5000 });
    result.pnpmGlobalBin = pnpmBin.trim();
  } catch {}

  // Get enhanced PATH
  const enhancedPath = await enhancePath();
  result.searchPaths = enhancedPath.split(PATH_SEPARATOR).filter(Boolean);

  // Try to resolve
  const resolvedPath = await resolveCli(cliName, envVarName, { useCache: false });
  if (resolvedPath) {
    result.found = true;
    result.path = resolvedPath;
  }

  // Try which command
  if (!IS_WINDOWS) {
    try {
      const { stdout } = await execFileAsync('which', [cliName], { timeout: 5000 });
      result.whichResult = stdout.trim();
    } catch {}
  }

  // Check common locations
  const commonPaths = [
    `/usr/local/bin/${cliName}`,
    `/usr/bin/${cliName}`,
    `${process.env.HOME}/.npm-global/bin/${cliName}`,
    `${process.env.HOME}/.pnpm/bin/${cliName}`,
    `${process.env.HOME}/.local/share/pnpm/${cliName}`,
    result.npmGlobalBin ? `${result.npmGlobalBin}/${cliName}` : null,
    result.pnpmGlobalBin ? `${result.pnpmGlobalBin}/${cliName}` : null
  ].filter(Boolean) as string[];

  for (const path of commonPaths) {
    try {
      await accessAsync(path, constants.F_OK);
      result.commonLocations[path] = true;
    } catch {
      result.commonLocations[path] = false;
    }
  }

  return result;
}

/**
 * Detect package manager global bin directories
 */
export async function detectPackageManagerGlobalBins(): Promise<{
  npm: string | null;
  pnpm: string | null;
  yarn: string | null;
}> {
  const result = {
    npm: null as string | null,
    pnpm: null as string | null,
    yarn: null as string | null
  };

  // Detect npm
  try {
    const { stdout } = await execFileAsync('npm', ['config', 'get', 'prefix'], { timeout: 5000 });
    const prefix = stdout.trim();
    result.npm = IS_WINDOWS ? prefix : `${prefix}/bin`;
  } catch {}

  // Detect pnpm
  try {
    const { stdout } = await execFileAsync('pnpm', ['config', 'get', 'global-bin-dir'], { timeout: 5000 });
    result.pnpm = stdout.trim();
  } catch {
    try {
      const { stdout } = await execFileAsync('pnpm', ['store', 'path'], { timeout: 5000 });
      const storePath = stdout.trim();
      result.pnpm = storePath.replace(/\/store.*/, '/bin');
    } catch {}
  }

  // Detect yarn
  try {
    const { stdout } = await execFileAsync('yarn', ['global', 'bin'], { timeout: 5000 });
    result.yarn = stdout.trim();
  } catch {}

  return result;
}

/**
 * Validate environment for CLI resolution
 */
export async function validateEnvironment(): Promise<{
  pathContainsNpmBin: boolean;
  pathContainsPnpmBin: boolean;
  recommendations: string[];
}> {
  const currentPath = process.env.PATH || '';
  const globalBins = await detectPackageManagerGlobalBins();
  
  const result = {
    pathContainsNpmBin: false,
    pathContainsPnpmBin: false,
    recommendations: [] as string[]
  };

  if (globalBins.npm) {
    result.pathContainsNpmBin = currentPath.includes(globalBins.npm);
    if (!result.pathContainsNpmBin) {
      result.recommendations.push(`Add npm global bin to PATH: export PATH="${globalBins.npm}:$PATH"`);
    }
  }

  if (globalBins.pnpm) {
    result.pathContainsPnpmBin = currentPath.includes(globalBins.pnpm);
    if (!result.pathContainsPnpmBin) {
      result.recommendations.push(`Add pnpm global bin to PATH: export PATH="${globalBins.pnpm}:$PATH"`);
    }
  }

  return result;
}

/**
 * Validate CLI by checking version
 */
export async function validateCli(
  cliPath: string,
  versionArgs: string[] = ['--version']
): Promise<{ valid: boolean; version?: string; error?: string }> {
  try {
    const { stdout } = await execFileAsync(cliPath, versionArgs, {
      timeout: 5000,
      env: await getEnhancedEnv()
    });
    const version = stdout.trim();
    return { valid: true, version };
  } catch (error: any) {
    return { 
      valid: false, 
      error: error.message || 'Failed to validate CLI'
    };
  }
}