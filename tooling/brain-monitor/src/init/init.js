import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function init() {
  console.log(chalk.cyan('🧠 Initializing brain-monitor...'));

  try {
    // Add brain-monitor scripts to root package.json
    const rootPackagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(rootPackagePath, 'utf-8'));

    const brainScripts = {
      "brain:validate": "brain-monitor validate",
      "brain:watch": "brain-monitor watch",
      "brain:typecheck-failures": "brain-monitor typecheck",
      "brain:lint-failures": "brain-monitor lint",
      "brain:format-failures": "brain-monitor format",
      "brain:test-failures": "brain-monitor test",
      "brain:logs": "brain-monitor logs",
      "brain:dev": "brain-monitor dev"
    };

    // Add scripts if they don't exist
    packageJson.scripts = packageJson.scripts || {};
    let scriptsAdded = false;
    
    for (const [key, value] of Object.entries(brainScripts)) {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        scriptsAdded = true;
      }
    }

    if (scriptsAdded) {
      await fs.writeFile(rootPackagePath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(chalk.green('✅ Added brain-monitor scripts to package.json'));
    }

    // Create _errors and _logs directories
    const errorsDir = path.join(process.cwd(), '_errors');
    const logsDir = path.join(process.cwd(), '_logs');

    await fs.mkdir(errorsDir, { recursive: true });
    await fs.mkdir(path.join(errorsDir, 'reports'), { recursive: true });
    await fs.mkdir(path.join(errorsDir, '.counts'), { recursive: true });
    await fs.mkdir(logsDir, { recursive: true });

    console.log(chalk.green('✅ Created _errors and _logs directories'));

    // Add to .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    let gitignoreContent = '';
    
    try {
      gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
    } catch {
      // .gitignore doesn't exist
    }

    const gitignoreEntries = [
      '_errors/',
      '_logs/',
      '!_errors/.gitkeep',
      '!_logs/.gitkeep'
    ];

    let gitignoreUpdated = false;
    for (const entry of gitignoreEntries) {
      if (!gitignoreContent.includes(entry)) {
        gitignoreContent += `\n${entry}`;
        gitignoreUpdated = true;
      }
    }

    if (gitignoreUpdated) {
      await fs.writeFile(gitignorePath, gitignoreContent.trim() + '\n');
      console.log(chalk.green('✅ Updated .gitignore'));
    }

    // Create .gitkeep files
    await fs.writeFile(path.join(errorsDir, '.gitkeep'), '');
    await fs.writeFile(path.join(logsDir, '.gitkeep'), '');

    // Check for logger setup
    console.log(chalk.yellow('\n⚠️  Make sure @kit/logger is configured in your applications'));
    console.log(chalk.yellow('   See: tooling/logger/README.md for setup instructions'));

    console.log(chalk.green('\n✅ Brain-monitor initialization complete!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.white('  1. Run'), chalk.yellow('pnpm brain:validate'), chalk.white('to run all validations'));
    console.log(chalk.white('  2. Run'), chalk.yellow('pnpm brain:dev'), chalk.white('to start dev servers with logging'));
    console.log(chalk.white('  3. Run'), chalk.yellow('pnpm brain:watch'), chalk.white('for continuous validation'));

  } catch (error) {
    console.error(chalk.red('❌ Error during initialization:'), error);
    process.exit(1);
  }
}