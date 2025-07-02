import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Cache the monorepo root to avoid repeated filesystem searches
let cachedMonorepoRoot: string | null = null;

export interface EnvLoaderOptions {
  appName?: string;
  debug?: boolean;
  required?: string[];
  rootDir?: string;
  envPrefix?: string;
}

export interface EnvLoadResult {
  loadedPaths: string[];
  missingRequired: string[];
  rootEnvFound: boolean;
  success: boolean;
}

export function loadEnvironment(options: EnvLoaderOptions = {}): EnvLoadResult {
  const {debug = false, required = [], appName = 'Unknown App'} = options;

  let rootDir = options.rootDir;
  if (!rootDir) {
    // Use cached root if available
    if (cachedMonorepoRoot) {
      rootDir = cachedMonorepoRoot;
    } else {
      // Find monorepo root by looking for pnpm-workspace.yaml
      let currentDir = process.cwd();
      while (currentDir !== path.parse(currentDir).root) {
        if (fs.existsSync(path.join(currentDir, 'pnpm-workspace.yaml'))) {
          rootDir = currentDir;
          cachedMonorepoRoot = currentDir; // Cache the result
          break;
        }
        currentDir = path.dirname(currentDir);
      }
    }
  }

  if (!rootDir) {
    if (debug) {
      console.warn(
        '⚠️ Could not detect monorepo root directory. Fallback to current directory.',
      );
    }
    rootDir = process.cwd();
  }

  const currentDir = process.cwd();
  const rootEnvPath = path.join(rootDir, '.env');
  const localEnvPath = path.join(currentDir, '.env');

  const loadedPaths: string[] = [];
  let rootEnvFound = false;

  if (debug) {
    console.log('==== ENV LOADER ====');
    console.log(`App: ${appName}`);
    console.log(`Monorepo Root: ${rootDir}`);
    console.log(`Current Directory: ${currentDir}`);
    console.log('====================');
  }

  // Load root .env file first
  if (fs.existsSync(rootEnvPath)) {
    try {
      const result = dotenv.config({path: rootEnvPath});
      if (result.error) {
        if (debug) {
          console.log(`❌ Error loading root .env: ${result.error.message}`);
        }
      } else {
        if (debug) console.log('✅ Loaded root .env file');
        loadedPaths.push(rootEnvPath);
        rootEnvFound = true;
      }
    } catch (error) {
      if (debug) {
        console.log(
          `❌ Exception loading root .env: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  } else if (debug) {
    console.log('❓ Root .env file not found');
  }

  // Load local .env file if different from root
  if (currentDir !== rootDir && fs.existsSync(localEnvPath)) {
    try {
      const result = dotenv.config({path: localEnvPath});
      if (result.error) {
        if (debug) {
          console.log(`❌ Error loading local .env: ${result.error.message}`);
        }
      } else {
        if (debug) console.log('✅ Loaded local .env file');
        loadedPaths.push(localEnvPath);
      }
    } catch (error) {
      if (debug) {
        console.log(
          `❌ Exception loading local .env: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  // Check required variables
  const missingRequired = required.filter((name) => !process.env[name]);
  if (missingRequired.length > 0 && debug) {
    console.log(`⚠️ Missing required variables: ${missingRequired.join(', ')}`);
  }

  return {
    loadedPaths,
    missingRequired,
    rootEnvFound,
    success: missingRequired.length === 0,
  };
}

export function getEnv(
  name: string,
  defaultValue?: string,
): string | undefined {
  return process.env[name] ?? defaultValue;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not defined`);
  }
  return value;
}

export function getIntEnv(
  name: string,
  defaultValue?: number,
): number | undefined {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function getBoolEnv(
  name: string,
  defaultValue?: boolean,
): boolean | undefined {
  const value = process.env[name]?.toLowerCase();
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true' || value === '1' || value === 'yes';
}

export function getFilteredEnv(
  prefix?: string,
): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!prefix || key.startsWith(prefix)) {
      env[key] = value;
    }
  }
  return env;
}

/**
 * Clear the cached monorepo root path.
 * Useful for testing or when working with multiple monorepos.
 */
export function clearRootCache(): void {
  cachedMonorepoRoot = null;
}
