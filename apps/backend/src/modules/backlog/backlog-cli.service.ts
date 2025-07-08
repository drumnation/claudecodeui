import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import { createLogger } from '@kit/logger/node';
import * as os from 'os';
import { resolveCli, getEnhancedEnv, clearCliCache, validateCli } from '../../lib/cliResolver.js';

const execFileAsync = promisify(execFile);
const logger = createLogger({ scope: 'backlog-cli-service' });

export interface BacklogCliStatus {
  installed: boolean;
  version?: string;
  path?: string;
  error?: string;
}

export interface InstallProgress {
  status: 'checking' | 'installing' | 'completed' | 'failed';
  message: string;
  progress?: number;
}

export class BacklogCliService {
  private backlogCommand = 'backlog';
  private isChecking = false;
  private cachedStatus: BacklogCliStatus | null = null;
  private lastCheckTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Get enhanced environment with proper PATH
   */
  private getEnhancedEnv(): NodeJS.ProcessEnv {
    return getEnhancedEnv();
  }
  
  /**
   * Clear CLI resolution cache for backlog
   */
  clearCliCache(): void {
    clearCliCache('backlog');
    this.cachedStatus = null;
    this.lastCheckTime = 0;
  }

  async checkInstallation(): Promise<BacklogCliStatus> {
    // Return cached status if recent
    if (this.cachedStatus && Date.now() - this.lastCheckTime < this.CACHE_DURATION) {
      return this.cachedStatus;
    }

    if (this.isChecking) {
      // Wait for ongoing check to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.cachedStatus || { installed: false, error: 'Check in progress' };
    }

    this.isChecking = true;

    try {
      // Use CLI resolver to find backlog with enhanced PATH
      const cliPath = await resolveCli('backlog', 'BACKLOG_CLI_PATH');
      
      if (!cliPath) {
        logger.warn('Backlog CLI not found in PATH', {
          PATH: process.env.PATH,
          hint: 'Try installing with: npm install -g backlog.md'
        });
        
        this.cachedStatus = {
          installed: false,
          error: 'Backlog CLI not found. Please install it with: npm install -g backlog.md\n' +
                 'If already installed, ensure npm global bin directory is in your PATH.\n' +
                 'Alternatively, set BACKLOG_CLI_PATH environment variable to the CLI location.'
        };
        this.lastCheckTime = Date.now();
        
        return this.cachedStatus;
      }

      // Validate the CLI by checking version
      const validation = await validateCli(cliPath, ['--version']);
      
      if (!validation.valid) {
        logger.error('Backlog CLI validation failed', { 
          cliPath, 
          error: validation.error 
        });
        
        this.cachedStatus = {
          installed: false,
          error: `Found backlog at ${cliPath} but it's not working properly: ${validation.error}`
        };
        this.lastCheckTime = Date.now();
        
        return this.cachedStatus;
      }

      this.cachedStatus = {
        installed: true,
        version: validation.version,
        path: cliPath
      };
      this.lastCheckTime = Date.now();
      
      logger.info('Backlog CLI found and validated', { 
        version: validation.version, 
        path: cliPath 
      });
      
      return this.cachedStatus;
    } catch (error: any) {
      logger.error('Error checking backlog installation', { error });
      
      this.cachedStatus = {
        installed: false,
        error: `Failed to check backlog installation: ${error.message}`
      };
      this.lastCheckTime = Date.now();
      
      return this.cachedStatus;
    } finally {
      this.isChecking = false;
    }
  }

  async installBacklog(onProgress?: (progress: InstallProgress) => void): Promise<BacklogCliStatus> {
    logger.info('Starting backlog installation');
    
    // Check if already installed
    const currentStatus = await this.checkInstallation();
    if (currentStatus.installed) {
      onProgress?.({
        status: 'completed',
        message: 'Backlog is already installed',
        progress: 100
      });
      return currentStatus;
    }

    try {
      onProgress?.({
        status: 'checking',
        message: 'Checking system requirements...',
        progress: 10
      });

      // Check if npm is available
      try {
        await execFileAsync('npm', ['--version']);
      } catch (error) {
        throw new Error('npm is not installed. Please install Node.js and npm first.');
      }

      onProgress?.({
        status: 'installing',
        message: 'Installing backlog.md globally via npm...',
        progress: 30
      });

      // Install backlog globally using npm with enhanced PATH
      const enhancedEnv = getEnhancedEnv();
      const installProcess = spawn('npm', ['install', '-g', 'backlog.md'], {
        shell: true,
        env: enhancedEnv
      });

      let output = '';
      let errorOutput = '';

      installProcess.stdout.on('data', (data) => {
        output += data.toString();
        logger.info('Install output', { data: data.toString() });
        
        // Update progress based on output
        if (output.includes('added')) {
          onProgress?.({
            status: 'installing',
            message: 'Installing dependencies...',
            progress: 70
          });
        }
      });

      installProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        logger.warn('Install stderr', { data: data.toString() });
      });

      // Wait for installation to complete
      await new Promise<void>((resolve, reject) => {
        installProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Installation failed with code ${code}: ${errorOutput}`));
          }
        });

        installProcess.on('error', (error) => {
          reject(error);
        });
      });

      onProgress?.({
        status: 'installing',
        message: 'Verifying installation...',
        progress: 90
      });

      // Clear cache and check installation again
      this.cachedStatus = null;
      clearCliCache('backlog');
      const newStatus = await this.checkInstallation();

      if (newStatus.installed) {
        onProgress?.({
          status: 'completed',
          message: `Backlog ${newStatus.version} installed successfully!`,
          progress: 100
        });
        
        logger.info('Backlog installation completed', { version: newStatus.version });
        return newStatus;
      } else {
        throw new Error('Installation completed but backlog command not found. You may need to restart your terminal or add npm global bin to PATH.');
      }
    } catch (error: any) {
      logger.error('Failed to install backlog', { error });
      
      onProgress?.({
        status: 'failed',
        message: `Installation failed: ${error.message}`,
        progress: 0
      });

      // Check if it's a permissions error
      if (error.message.includes('EACCES') || error.message.includes('permission')) {
        throw new Error('Permission denied. Try running with sudo: sudo npm install -g backlog.md');
      }

      throw error;
    }
  }

  async getInstallInstructions(): Promise<string> {
    const platform = os.platform();
    
    let instructions = `# Backlog.md Installation Instructions\n\n`;
    instructions += `Backlog.md is a command-line tool for managing project backlogs.\n\n`;
    
    instructions += `## Automatic Installation (Recommended)\n\n`;
    instructions += `Click the "Install Backlog" button in the UI to automatically install.\n\n`;
    
    instructions += `## Manual Installation\n\n`;
    instructions += `### Using npm (Node.js required)\n`;
    instructions += `\`\`\`bash\nnpm install -g backlog.md\n\`\`\`\n\n`;
    
    instructions += `### Using pnpm\n`;
    instructions += `\`\`\`bash\npnpm add -g backlog.md\n\`\`\`\n\n`;
    
    if (platform === 'darwin') {
      instructions += `### Using Homebrew (macOS)\n`;
      instructions += `\`\`\`bash\nbrew install backlog\n\`\`\`\n\n`;
    }
    
    instructions += `### Verify Installation\n`;
    instructions += `\`\`\`bash\nbacklog --version\n\`\`\`\n\n`;
    
    instructions += `## PATH Configuration\n\n`;
    instructions += `If backlog is installed but not found, add npm's global bin directory to your PATH:\n\n`;
    
    instructions += `### Find npm global bin directory\n`;
    instructions += `\`\`\`bash\nnpm config get prefix\n# The bin directory is <prefix>/bin on Unix or <prefix> on Windows\n\`\`\`\n\n`;
    
    if (platform === 'darwin' || platform === 'linux') {
      instructions += `### Add to PATH (bash/zsh)\n`;
      instructions += `\`\`\`bash\n# Add to ~/.bashrc or ~/.zshrc\nexport PATH="$PATH:$(npm config get prefix)/bin"\n\`\`\`\n\n`;
    } else if (platform === 'win32') {
      instructions += `### Add to PATH (Windows)\n`;
      instructions += `1. Open System Properties > Environment Variables\n`;
      instructions += `2. Add npm prefix to PATH (usually %APPDATA%\\npm)\n`;
      instructions += `3. Restart your terminal\n\n`;
    }
    
    instructions += `## Environment Variable Override\n\n`;
    instructions += `If backlog is installed in a custom location, set the BACKLOG_CLI_PATH environment variable:\n`;
    instructions += `\`\`\`bash\nexport BACKLOG_CLI_PATH="/custom/path/to/backlog"\n\`\`\`\n\n`;
    
    instructions += `## Troubleshooting\n\n`;
    instructions += `- If you get a "command not found" error, ensure npm's global bin directory is in your PATH\n`;
    instructions += `- On macOS/Linux, you may need to use sudo: \`sudo npm install -g backlog.md\`\n`;
    instructions += `- Make sure Node.js and npm are installed: \`node --version && npm --version\`\n`;
    instructions += `- Check current PATH: \`echo $PATH\` (Unix) or \`echo %PATH%\` (Windows)\n`;
    instructions += `- For pnpm users, ensure pnpm's global bin is in PATH: \`pnpm config get global-bin-dir\`\n`;
    
    return instructions;
  }

  /**
   * Get the command to use for backlog operations
   * This allows for future customization of the command path
   */
  getCommand(): string {
    return this.backlogCommand;
  }

  /**
   * Clear the cached status, forcing a fresh check on next call
   */
  clearCache(): void {
    this.cachedStatus = null;
    this.lastCheckTime = 0;
  }
}

export const backlogCliService = new BacklogCliService();