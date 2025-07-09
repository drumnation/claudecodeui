import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

export async function runDev() {
  console.log(chalk.cyan('🧠 Brain Monitor - Starting dev servers with logging...'));
  
  const logsDir = path.join(process.cwd(), '_logs');
  await fs.mkdir(logsDir, { recursive: true });

  // Start the regular dev command but capture logs
  const devProcess = spawn('pnpm', ['dev'], {
    stdio: 'pipe',
    shell: true
  });

  // Create log files for different services
  const frontendLog = await fs.open(path.join(logsDir, 'frontend.log'), 'a');
  const backendLog = await fs.open(path.join(logsDir, 'backend.log'), 'a');

  devProcess.stdout.on('data', async (data) => {
    const output = data.toString();
    process.stdout.write(data);
    
    // Route logs to appropriate files based on prefix
    if (output.includes('[WEB]') || output.includes('frontend')) {
      await frontendLog.write(`${new Date().toISOString()} ${output}`);
    } else if (output.includes('[API]') || output.includes('backend')) {
      await backendLog.write(`${new Date().toISOString()} ${output}`);
    }
  });

  devProcess.stderr.on('data', async (data) => {
    const output = data.toString();
    process.stderr.write(data);
    
    // Log errors to both files
    await frontendLog.write(`${new Date().toISOString()} ERROR: ${output}`);
    await backendLog.write(`${new Date().toISOString()} ERROR: ${output}`);
  });

  devProcess.on('close', async (code) => {
    await frontendLog.close();
    await backendLog.close();
    console.log(chalk.yellow(`\nDev servers exited with code ${code}`));
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    devProcess.kill('SIGINT');
  });

  console.log(chalk.green('✅ Dev servers started with logging'));
  console.log(chalk.cyan(`📝 Logs are being written to:`));
  console.log(chalk.white(`   - ${path.join(logsDir, 'frontend.log')}`));
  console.log(chalk.white(`   - ${path.join(logsDir, 'backend.log')}`));
}