/**
 * Validation utility functions for brain-monitor
 */

import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  const remainingMs = ms % 1000;
  return `${seconds}.${remainingMs.toString().padStart(3, '0')}s`;
}

export function getCategoryColor(category) {
  switch (category) {
    case 'critical': return chalk.red;
    case 'warning': return chalk.yellow;
    case 'optional': return chalk.blue;
    default: return chalk.white;
  }
}

export function getCategoryIcon(category) {
  switch (category) {
    case 'critical': return '🚨';
    case 'warning': return '⚠️';
    case 'optional': return 'ℹ️';
    default: return '📝';
  }
}

export async function ensureErrorDirectories() {
  const errorsDir = path.join(process.cwd(), '_errors');
  const reportsDir = path.join(errorsDir, 'reports');
  
  await fs.mkdir(errorsDir, { recursive: true });
  await fs.mkdir(reportsDir, { recursive: true });
  
  return { errorsDir, reportsDir };
}

export async function cleanupOldReports(reportsDir, maxAge = 24 * 60 * 60 * 1000) {
  try {
    const files = await fs.readdir(reportsDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(reportsDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

export function calculatePassRate(passed, total) {
  return total > 0 ? Math.round((passed / total) * 100) : 0;
}

export function createTaskFilter(categories = ['critical', 'warning', 'optional']) {
  return (taskKey, tasks) => {
    const task = tasks[taskKey];
    return task && categories.includes(task.category);
  };
}

export async function writeValidationReport(reportPath, task, result, timestamp) {
  const errorType = result.timedOut ? 'TIMEOUT' : 'FAILURE';
  const content = `# ${task.name} ${errorType}

Generated: ${timestamp}
Category: ${result.category.toUpperCase()}
Duration: ${formatDuration(result.duration)}
${result.timedOut ? `Timeout: ${task.timeout}ms\n` : ''}

## Error Details

${result.error ? result.error.message : 'Unknown error'}

## Output

\`\`\`
${result.output}
\`\`\`

## Troubleshooting

${getTaskTroubleshootingTips(task, result)}
`;
  
  await fs.writeFile(reportPath, content);
}

function getTaskTroubleshootingTips(task, result) {
  const tips = [];
  
  if (result.timedOut) {
    tips.push(`- Task timed out after ${formatDuration(task.timeout)}`);
    tips.push('- Consider increasing the timeout value in the task configuration');
    tips.push('- Check for performance issues in the codebase');
  }
  
  if (task.name.includes('TypeScript')) {
    tips.push('- Run `npm run typecheck` to see detailed TypeScript errors');
    tips.push('- Check for missing type definitions');
    tips.push('- Verify all imports are correctly typed');
  }
  
  if (task.name.includes('ESLint')) {
    tips.push('- Run `npm run lint` to see detailed linting errors');
    tips.push('- Many issues can be auto-fixed with `npm run lint -- --fix`');
  }
  
  if (task.name.includes('Prettier')) {
    tips.push('- Run `npm run format` to see formatting issues');
    tips.push('- Auto-fix with `npm run format -- --write`');
  }
  
  if (task.name.includes('Test')) {
    tips.push('- Run the specific test command to see detailed output');
    tips.push('- Check for missing test dependencies');
    tips.push('- Verify test environment configuration');
  }
  
  if (task.name.includes('Storybook')) {
    tips.push('- Ensure Storybook is properly configured');
    tips.push('- Check if Storybook server is running on the correct port');
    tips.push('- Verify story files are properly written');
  }
  
  return tips.length > 0 ? tips.join('\n') : 'No specific troubleshooting tips available.';
}

export function createValidationSummary(results, timestamp, totalDuration) {
  const categories = {
    critical: { passed: 0, failed: 0, timedOut: 0, results: [] },
    warning: { passed: 0, failed: 0, timedOut: 0, results: [] },
    optional: { passed: 0, failed: 0, timedOut: 0, results: [] }
  };
  
  // Categorize results
  results.forEach(result => {
    const category = categories[result.category];
    if (category) {
      category.results.push(result);
      
      if (result.success) {
        category.passed++;
      } else if (result.timedOut) {
        category.timedOut++;
      } else {
        category.failed++;
      }
    }
  });
  
  // Calculate statistics
  const totalTasks = results.length;
  const totalPassed = Object.values(categories).reduce((sum, cat) => sum + cat.passed, 0);
  const totalFailed = Object.values(categories).reduce((sum, cat) => sum + cat.failed, 0);
  const totalTimedOut = Object.values(categories).reduce((sum, cat) => sum + cat.timedOut, 0);
  const passRate = calculatePassRate(totalPassed, totalTasks);
  
  const hasErrors = totalFailed > 0 || totalTimedOut > 0;
  const hasCriticalErrors = categories.critical.failed > 0 || categories.critical.timedOut > 0;
  
  return {
    categories,
    statistics: {
      totalTasks,
      totalPassed,
      totalFailed,
      totalTimedOut,
      passRate
    },
    hasErrors,
    hasCriticalErrors,
    timestamp,
    totalDuration: formatDuration(totalDuration)
  };
}