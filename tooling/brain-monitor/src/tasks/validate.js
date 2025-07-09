import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { 
  formatDuration, 
  getCategoryColor, 
  getCategoryIcon,
  ensureErrorDirectories, 
  cleanupOldReports, 
  calculatePassRate,
  writeValidationReport,
  createValidationSummary
} from '../utils/validation-utils.js';

const TASKS = {
  typecheck: {
    name: 'TypeScript',
    command: 'npm',
    args: ['run', 'frontend:typecheck'],
    emoji: '🔍',
    outputFile: 'errors.typecheck-failures.md',
    timeout: 120000, // 2 minutes
    category: 'critical'
  },
  'typecheck-backend': {
    name: 'TypeScript Backend',
    command: 'npm',
    args: ['run', 'typecheck:backend'],
    emoji: '🔍',
    outputFile: 'errors.typecheck-backend-failures.md',
    timeout: 120000, // 2 minutes
    category: 'critical'
  },
  lint: {
    name: 'ESLint',
    command: 'sh',
    args: ['-c', 'cd apps/frontend && npm run lint'],
    emoji: '📝',
    outputFile: 'errors.lint-failures.md',
    timeout: 90000, // 1.5 minutes
    category: 'warning'
  },
  format: {
    name: 'Prettier',
    command: 'sh',
    args: ['-c', 'cd apps/frontend && npm run format'],
    emoji: '💅',
    outputFile: 'errors.format-failures.md',
    timeout: 60000, // 1 minute
    category: 'warning'
  },
  test: {
    name: 'Tests',
    command: 'npm',
    args: ['run', 'frontend:test'],
    emoji: '🧪',
    outputFile: 'errors.test-failures.md',
    timeout: 300000, // 5 minutes
    category: 'critical'
  },
  'test-backend': {
    name: 'Backend Tests',
    command: 'npm',
    args: ['run', 'test:backend'],
    emoji: '🧪',
    outputFile: 'errors.test-backend-failures.md',
    timeout: 300000, // 5 minutes
    category: 'critical'
  },
  'test-storybook': {
    name: 'Storybook E2E Tests',
    command: 'sh',
    args: ['-c', 'cd apps/frontend && npm run test:storybook:ci'],
    emoji: '📚',
    outputFile: 'errors.test-storybook-failures.md',
    timeout: 600000, // 10 minutes
    category: 'optional'
  },
  'test-storybook-comprehensive': {
    name: 'Storybook Comprehensive Tests',
    command: 'sh',
    args: ['-c', 'cd apps/frontend && npm run test:storybook:integration'],
    emoji: '📖',
    outputFile: 'errors.test-storybook-comprehensive-failures.md',
    timeout: 900000, // 15 minutes
    category: 'optional'
  },
  'test-e2e-smoke': {
    name: 'E2E Smoke Tests',
    command: 'sh',
    args: ['-c', 'cd apps/frontend && npm run test:e2e:smoke'],
    emoji: '🚀',
    outputFile: 'errors.test-e2e-smoke-failures.md',
    timeout: 300000, // 5 minutes
    category: 'critical'
  },
  'test-e2e-api': {
    name: 'E2E API Integration Tests',
    command: 'sh',
    args: ['-c', 'cd apps/frontend && npm run test:e2e:api'],
    emoji: '🔌',
    outputFile: 'errors.test-e2e-api-failures.md',
    timeout: 180000, // 3 minutes
    category: 'warning'
  },
  'test-e2e-critical': {
    name: 'E2E Critical Journey Tests',
    command: 'sh',
    args: ['-c', 'cd apps/frontend && npm run test:e2e:critical'],
    emoji: '🎯',
    outputFile: 'errors.test-e2e-critical-failures.md',
    timeout: 600000, // 10 minutes
    category: 'critical'
  },
  'test-e2e-visual': {
    name: 'E2E Visual Regression Tests',
    command: 'sh',
    args: ['-c', 'cd apps/frontend && npm run test:e2e:visual'],
    emoji: '👁️',
    outputFile: 'errors.test-e2e-visual-failures.md',
    timeout: 300000, // 5 minutes
    category: 'optional'
  },
  'test-e2e-performance': {
    name: 'E2E Performance Tests',
    command: 'sh',
    args: ['-c', 'cd apps/frontend && npm run test:e2e:performance'],
    emoji: '⚡',
    outputFile: 'errors.test-e2e-performance-failures.md',
    timeout: 300000, // 5 minutes
    category: 'optional'
  }
};

async function runTask(taskKey) {
  const task = TASKS[taskKey];
  const startTime = Date.now();
  
  console.log(chalk.cyan(`${task.emoji} Running ${task.name}...`));

  return new Promise((resolve) => {
    const child = spawn(task.command, task.args, {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let errorOutput = '';
    let isTimedOut = false;

    // Setup timeout
    const timeoutHandle = setTimeout(() => {
      isTimedOut = true;
      child.kill('SIGTERM');
      
      // Force kill after 5 seconds if SIGTERM doesn't work
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
        }
      }, 5000);
    }, task.timeout);

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeoutHandle);
      const duration = Date.now() - startTime;
      
      let success = code === 0;
      let error = null;
      
      if (isTimedOut) {
        success = false;
        error = new Error(`${task.name} timed out after ${task.timeout}ms`);
      } else if (code !== 0) {
        error = new Error(`${task.name} failed with code ${code}`);
      }
      
      resolve({
        task: taskKey,
        success,
        duration,
        output: output + errorOutput,
        error,
        timedOut: isTimedOut,
        category: task.category
      });
    });

    child.on('error', (err) => {
      clearTimeout(timeoutHandle);
      const duration = Date.now() - startTime;
      
      resolve({
        task: taskKey,
        success: false,
        duration,
        output: output + errorOutput,
        error: new Error(`${task.name} failed to start: ${err.message}`),
        timedOut: false,
        category: task.category
      });
    });
  });
}

// Utility functions moved to validation-utils.js

async function runTasksInParallel(tasks, maxConcurrency = 3) {
  const results = [];
  const taskQueue = [...tasks];
  const running = new Map();

  while (taskQueue.length > 0 || running.size > 0) {
    // Start new tasks up to maxConcurrency
    while (running.size < maxConcurrency && taskQueue.length > 0) {
      const taskKey = taskQueue.shift();
      if (TASKS[taskKey]) {
        const promise = runTask(taskKey);
        running.set(taskKey, promise);
      }
    }

    // Wait for at least one task to complete
    if (running.size > 0) {
      const completed = await Promise.race(Array.from(running.values()));
      results.push(completed);
      running.delete(completed.task);
    }
  }

  return results;
}

export async function runValidation(selectedTasks = ['typecheck', 'typecheck-backend', 'lint', 'format', 'test', 'test-backend', 'test-e2e-smoke', 'test-e2e-critical', 'test-storybook']) {
  const { errorsDir, reportsDir } = await ensureErrorDirectories();
  
  // Cleanup old reports
  await cleanupOldReports(reportsDir);

  const validationStartTime = Date.now();
  console.log(chalk.blue('\n🧠 Brain Monitor - Running validations...\n'));

  // Filter valid tasks
  const validTasks = selectedTasks.filter(taskKey => TASKS[taskKey]);
  
  if (validTasks.length === 0) {
    console.log(chalk.yellow('No valid tasks selected for validation.'));
    return;
  }

  // Run tasks with controlled parallelization
  const results = await runTasksInParallel(validTasks, 3);

  // Sort results by original task order
  results.sort((a, b) => selectedTasks.indexOf(a.task) - selectedTasks.indexOf(b.task));

  const timestamp = new Date().toISOString();
  const totalDuration = Date.now() - validationStartTime;

  // Process results and write reports
  for (const result of results) {
    const task = TASKS[result.task];
    const reportPath = path.join(reportsDir, task.outputFile);
    
    if (result.success) {
      // Remove error file if validation passed
      try {
        await fs.unlink(reportPath);
      } catch {
        // File doesn't exist, that's fine
      }
      console.log(chalk.green(`${task.emoji} ${task.name}: ✅ Passed (${formatDuration(result.duration)})`));
    } else {
      // Write detailed error report
      await writeValidationReport(reportPath, task, result, timestamp);
      
      const statusIcon = result.timedOut ? '⏱️' : '❌';
      const statusText = result.timedOut ? 'Timed Out' : 'Failed';
      const categoryColor = getCategoryColor(result.category);
      const categoryIcon = getCategoryIcon(result.category);
      
      console.log(categoryColor(`${task.emoji} ${task.name}: ${statusIcon} ${statusText} (${formatDuration(result.duration)}) ${categoryIcon}`));
    }
  }

  // Create validation summary
  const summary = createValidationSummary(results, timestamp, totalDuration);
  
  // Write enhanced summary
  const summaryPath = path.join(errorsDir, 'validation-summary.md');
  const summaryContent = `# Validation Summary

Last run: ${timestamp}
Total duration: ${summary.totalDuration}

## Statistics
- **Total tasks**: ${summary.statistics.totalTasks}
- **Passed**: ${summary.statistics.totalPassed} (${summary.statistics.passRate}%)
- **Failed**: ${summary.statistics.totalFailed}
- **Timed out**: ${summary.statistics.totalTimedOut}
- **Pass rate**: ${summary.statistics.passRate}%

## Results by Category

### Critical (${summary.categories.critical.passed + summary.categories.critical.failed + summary.categories.critical.timedOut})
${summary.categories.critical.results.map(r => {
  const task = TASKS[r.task];
  const status = r.success ? '✅ Passed' : (r.timedOut ? '⏱️ Timed Out' : '❌ Failed');
  return `- **${task.name}**: ${status} (${formatDuration(r.duration)})`;
}).join('\n') || '- None'}

### Warning (${summary.categories.warning.passed + summary.categories.warning.failed + summary.categories.warning.timedOut})
${summary.categories.warning.results.map(r => {
  const task = TASKS[r.task];
  const status = r.success ? '✅ Passed' : (r.timedOut ? '⏱️ Timed Out' : '❌ Failed');
  return `- **${task.name}**: ${status} (${formatDuration(r.duration)})`;
}).join('\n') || '- None'}

### Optional (${summary.categories.optional.passed + summary.categories.optional.failed + summary.categories.optional.timedOut})
${summary.categories.optional.results.map(r => {
  const task = TASKS[r.task];
  const status = r.success ? '✅ Passed' : (r.timedOut ? '⏱️ Timed Out' : '❌ Failed');
  return `- **${task.name}**: ${status} (${formatDuration(r.duration)})`;
}).join('\n') || '- None'}

## Quick Actions
${summary.hasErrors ? '- Check `_errors/reports/` for detailed error reports' : '- All validations passed!'}
${summary.hasCriticalErrors ? '- **Critical errors detected** - these should be addressed immediately' : ''}
${summary.statistics.totalTimedOut > 0 ? '- Some tasks timed out - consider increasing timeout values or investigating performance issues' : ''}

## Available Commands
- \`npm run brain:validate\` - Run all validations
- \`npm run brain:validate-critical\` - Run only critical validations
- \`npm run brain:validate-quick\` - Run quick validations (no tests)
- \`npm run brain:test-storybook-failures\` - Run Storybook tests only
- \`npm run brain:watch\` - Watch mode for continuous validation
`;

  await fs.writeFile(summaryPath, summaryContent);

  // Final reporting
  console.log(chalk.blue('\n📊 Validation Statistics:'));
  console.log(chalk.white(`   Total: ${summary.statistics.totalTasks} tasks`));
  console.log(chalk.green(`   Passed: ${summary.statistics.totalPassed} (${summary.statistics.passRate}%)`));
  console.log(chalk.red(`   Failed: ${summary.statistics.totalFailed}`));
  if (summary.statistics.totalTimedOut > 0) {
    console.log(chalk.yellow(`   Timed out: ${summary.statistics.totalTimedOut}`));
  }
  console.log(chalk.blue(`   Duration: ${summary.totalDuration}`));

  console.log(chalk.blue('\n📋 Summary written to _errors/validation-summary.md'));

  if (summary.hasCriticalErrors) {
    console.log(chalk.red('\n❌ Critical validations failed. Fix these issues before proceeding.'));
    process.exit(1);
  } else if (summary.hasErrors) {
    console.log(chalk.yellow('\n⚠️  Some non-critical validations failed. Check _errors/reports/ for details.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All validations passed!'));
  }
}