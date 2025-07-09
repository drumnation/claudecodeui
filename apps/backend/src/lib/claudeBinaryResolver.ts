import { spawn } from 'child_process';
import { access, constants } from 'fs/promises';
import { join } from 'path';
import { createLogger } from '@kit/logger/node';

const logger = createLogger({ scope: 'claude-binary-resolver' });

export class ClaudeNotFoundError extends Error {
  constructor(message?: string) {
    super(message || 'Claude CLI not found');
    this.name = 'ClaudeNotFoundError';
  }
}

let cachedClaudePath: string | null = null;

function getClaudeExecutableName(): string {
  return process.platform === 'win32' ? 'claude.exe' : 'claude';
}

async function findInPath(executable: string): Promise<string | null> {
  const PATH = process.env.PATH || '';
  const pathDirs = PATH.split(process.platform === 'win32' ? ';' : ':');
  
  for (const dir of pathDirs) {
    if (!dir) continue;
    
    const fullPath = join(dir, executable);
    try {
      await access(fullPath, constants.F_OK | constants.X_OK);
      return fullPath;
    } catch {
      continue;
    }
  }
  
  return null;
}

async function validateClaudePath(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK | constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export async function getClaudeBinary(): Promise<string> {
  if (cachedClaudePath) {
    return cachedClaudePath;
  }

  const customPath = process.env.CLAUDE_CLI_PATH;
  
  if (customPath) {
    logger.debug('Checking custom Claude CLI path from environment', { path: customPath });
    
    const isValid = await validateClaudePath(customPath);
    if (isValid) {
      cachedClaudePath = customPath;
      logger.info('Using custom Claude CLI path', { path: customPath });
      return customPath;
    } else {
      logger.warn('Custom Claude CLI path is invalid', { path: customPath });
      throw new ClaudeNotFoundError(
        `Custom Claude CLI path is invalid: ${customPath}. Please check the path and permissions.`
      );
    }
  }

  const executableName = getClaudeExecutableName();
  logger.debug('Searching for Claude CLI in system PATH', { executable: executableName });
  
  const pathResult = await findInPath(executableName);
  
  if (pathResult) {
    cachedClaudePath = pathResult;
    logger.info('Found Claude CLI in system PATH', { path: pathResult });
    return pathResult;
  }

  logger.error('Claude CLI not found in system PATH or custom path');
  throw new ClaudeNotFoundError(
    `Claude CLI not found. Please install Claude CLI or set CLAUDE_CLI_PATH environment variable.

Installation instructions:
- macOS: Download from https://claude.ai/download
- Linux: Download from https://claude.ai/download  
- Windows: Download from https://claude.ai/download
- Or set CLAUDE_CLI_PATH environment variable to point to your Claude CLI executable`
  );
}

export interface ClaudeAvailabilityResult {
  available: boolean;
  path?: string;
  error?: string;
}

export async function checkClaudeAvailability(): Promise<ClaudeAvailabilityResult> {
  try {
    const path = await getClaudeBinary();
    return {
      available: true,
      path,
    };
  } catch (error) {
    if (error instanceof ClaudeNotFoundError) {
      return {
        available: false,
        error: error.message,
      };
    }
    
    return {
      available: false,
      error: `Unexpected error checking Claude CLI: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function clearClaudeBinaryCache(): void {
  cachedClaudePath = null;
  logger.debug('Cleared Claude binary cache');
}