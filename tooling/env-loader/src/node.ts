import dotenv from 'dotenv';
import { resolve } from 'path';

export interface LoadEnvironmentOptions {
  appName?: string;
  debug?: boolean;
}

export interface LoadEnvironmentResult {
  loadedPaths: string[];
}

export function loadEnvironment(options: LoadEnvironmentOptions = {}): LoadEnvironmentResult {
  const loadedPaths: string[] = [];
  
  // Load .env file from project root
  const envPath = resolve(process.cwd(), '.env');
  const envResult = dotenv.config({ path: envPath });
  if (!envResult.error) {
    loadedPaths.push(envPath);
  }
  
  // Also load .env.local if it exists
  const localEnvPath = resolve(process.cwd(), '.env.local');
  const localResult = dotenv.config({ path: localEnvPath });
  if (!localResult.error) {
    loadedPaths.push(localEnvPath);
  }
  
  if (options.debug) {
    console.log(`[${options.appName || 'app'}] Loaded environment from:`, loadedPaths);
  }
  
  return { loadedPaths };
}