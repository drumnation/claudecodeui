import chalk from 'chalk';
import path from 'path';
import { promises as fs } from 'fs';

export async function monitorLogs() {
  console.log(chalk.cyan('🧠 Brain Monitor - Log monitoring'));
  
  const logsDir = path.join(process.cwd(), '_logs');
  
  try {
    const files = await fs.readdir(logsDir);
    const logFiles = files.filter(f => f.endsWith('.log'));
    
    if (logFiles.length === 0) {
      console.log(chalk.yellow('No log files found. Start dev servers with: pnpm brain:dev'));
      return;
    }
    
    console.log(chalk.green(`Found ${logFiles.length} log files:`));
    logFiles.forEach(file => {
      console.log(chalk.white(`  - ${file}`));
    });
    
    console.log(chalk.cyan('\nTo monitor logs in real-time:'));
    logFiles.forEach(file => {
      console.log(chalk.white(`  tail -f ${path.join(logsDir, file)}`));
    });
    
  } catch (error) {
    console.log(chalk.yellow('_logs directory not found. Run pnpm brain:init first.'));
  }
}