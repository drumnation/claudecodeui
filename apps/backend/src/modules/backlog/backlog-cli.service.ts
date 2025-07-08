import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import { createLogger } from '@kit/logger/node';
import * as os from 'os';

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
      // Try to run backlog --version
      const { stdout } = await execFileAsync(this.backlogCommand, ['--version']);
      const version = stdout.trim();
      
      // Get the path to backlog
      const { stdout: pathOutput } = await execFileAsync('which', [this.backlogCommand]);
      const path = pathOutput.trim();

      this.cachedStatus = {
        installed: true,
        version,
        path
      };
      this.lastCheckTime = Date.now();
      
      logger.info('Backlog CLI found', { version, path });
      return this.cachedStatus;
    } catch (error: any) {
      logger.warn('Backlog CLI not found', { error: error.message });
      
      this.cachedStatus = {
        installed: false,
        error: 'Backlog CLI not found. Please install it to use backlog features.'
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

      // Install backlog globally using npm
      const installProcess = spawn('npm', ['install', '-g', 'backlog.md'], {
        shell: true,
        env: { ...process.env }
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
    
    if (platform === 'darwin') {
      instructions += `### Using Homebrew (macOS)\n`;
      instructions += `\`\`\`bash\nbrew install backlog\n\`\`\`\n\n`;
    }
    
    instructions += `### Verify Installation\n`;
    instructions += `\`\`\`bash\nbacklog --version\n\`\`\`\n\n`;
    
    instructions += `## Troubleshooting\n\n`;
    instructions += `- If you get a "command not found" error, ensure npm's global bin directory is in your PATH\n`;
    instructions += `- On macOS/Linux, you may need to use sudo: \`sudo npm install -g backlog.md\`\n`;
    instructions += `- Make sure Node.js and npm are installed: \`node --version && npm --version\`\n`;
    
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