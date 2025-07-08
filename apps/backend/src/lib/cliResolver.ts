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
function getNpmGlobalBinPaths(): string[] {
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
  }

  // Try to get npm prefix dynamically
  try {
    const npmPrefix = execFileAsync('npm', ['config', 'get', 'prefix'], {
      timeout: 5000
    }).then(({ stdout }) => {
      const prefix = stdout.trim();
      if (prefix) {
        return IS_WINDOWS ? prefix : path.join(prefix, 'bin');
      }
      return null;
    }).catch(() => null);

    // Add npm prefix path if available (non-blocking)
    npmPrefix.then(prefixPath => {
      if (prefixPath && !paths.includes(prefixPath)) {
        paths.push(prefixPath);
      }
    });
  } catch (error) {
    // Ignore errors getting npm prefix
  }

  return paths;
}

/**
 * Enhance PATH environment variable with common CLI locations
 */
export function enhancePath(currentPath?: string): string {
  const existingPath = currentPath || process.env.PATH || '';
  const existingPaths = new Set(existingPath.split(PATH_SEPARATOR).filter(Boolean));
  const additionalPaths = getNpmGlobalBinPaths();

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
export function getEnhancedEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    PATH: enhancePath(process.env.PATH)
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
  const pathEnv = shouldEnhancePath ? enhancePath() : (process.env.PATH || '');
  const pathDirs = pathEnv.split(PATH_SEPARATOR).filter(Boolean);

  // Search in PATH
  const foundPath = await searchInPath(cliName, pathDirs);
  
  if (foundPath) {
    logger.info('Found CLI in PATH', { cliName, foundPath });
    cliPathCache.set(cacheKey, foundPath);
    return foundPath;
  }

  // Try 'which' command as fallback (Unix-like systems)
  if (!IS_WINDOWS) {
    try {
      const { stdout } = await execFileAsync('which', [cliName], {
        env: getEnhancedEnv(),
        timeout: 5000
      });
      const whichPath = stdout.trim();
      if (whichPath && await isExecutable(whichPath)) {
        logger.info('Found CLI using which', { cliName, whichPath });
        cliPathCache.set(cacheKey, whichPath);
        return whichPath;
      }
    } catch (error) {
      // which command failed, CLI not found
    }
  }

  // Try 'where' command as fallback (Windows)
  if (IS_WINDOWS) {
    try {
      const { stdout } = await execFileAsync('where', [cliName], {
        env: getEnhancedEnv(),
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
    } catch (error) {
      // where command failed, CLI not found
    }
  }

  logger.warn('CLI not found', { 
    cliName, 
    searchedPaths: pathDirs.slice(0, 10), // Log first 10 paths for debugging
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
 * Validate CLI by checking version
 */
export async function validateCli(
  cliPath: string,
  versionArgs: string[] = ['--version']
): Promise<{ valid: boolean; version?: string; error?: string }> {
  try {
    const { stdout } = await execFileAsync(cliPath, versionArgs, {
      timeout: 5000,
      env: getEnhancedEnv()
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