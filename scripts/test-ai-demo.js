#!/usr/bin/env node

/**
 * Simplified AI Test Demo Script
 * 
 * This demonstrates the AI testing pipeline without requiring all dependencies
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Logging utilities
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  section: (title) => {
    console.log('\n' + chalk.bold.underline(title) + '\n');
  }
};

async function main() {
  console.log(chalk.bold.cyan('\n🤖 AI Test System Demo\n'));
  
  try {
    // Check environment
    log.section('Environment Check');
    
    const spinner = ora('Validating setup...').start();
    
    // Check for user stories
    const storiesPath = join(rootDir, 'docs/automation/USER_STORIES.yml');
    if (!existsSync(storiesPath)) {
      spinner.fail('USER_STORIES.yml not found');
      return;
    }
    
    // Load and parse stories
    const storiesContent = await readFile(storiesPath, 'utf-8');
    const stories = storiesContent
      .split('---')
      .filter(doc => doc.trim() && !doc.trim().startsWith('#'))
      .map(doc => parse(doc));
    
    spinner.succeed(`Found ${stories.length} user stories`);
    
    // Show story categories
    const categories = [...new Set(stories.flatMap(s => s.tags || []))];
    log.info(`Categories: ${categories.join(', ')}`);
    
    // Show priority breakdown
    const priorities = {};
    
    console.log('\nStory Priorities:');
    Object.entries(priorities).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count} stories`);
    });
    
    // Check test structure
    log.section('Test Structure');
    
    const testDirs = [
      'apps/frontend/src/__tests__/generated/critical',
      'apps/frontend/src/__tests__/generated/features',
      'apps/frontend/src/__tests__/generated/edge-cases'
    ];
    
    for (const dir of testDirs) {
      const fullPath = join(rootDir, dir);
      if (existsSync(fullPath)) {
        log.success(`${dir} ✓`);
      } else {
        log.warning(`${dir} - not found`);
      }
    }
    
    // Show what would happen
    log.section('AI Test Generation Plan');
    
    console.log('The AI test system would:');
    console.log('1. Analyze coverage gaps');
    console.log('2. Select high-priority stories without tests');
    console.log('3. Generate Playwright tests using OpenAI');
    console.log('4. Execute tests with retry logic');
    console.log('5. Refine failing tests automatically');
    
    // Show sample test
    log.section('Example Generated Test');
    
    const sampleStory = stories.find(s => s.id === 'US_PROJECT_CREATE');
    if (sampleStory) {
      console.log(chalk.gray('// Generated from story: ' + sampleStory.id));
      console.log(chalk.gray('// ' + sampleStory.action));
      console.log(`
test('${sampleStory.role} can ${sampleStory.action}', async ({ page }) => {
  await page.goto('/');
  
  // Click create project button
  await page.getByTestId('create-project-button').click();
  
  // Fill in project details
  await page.getByTestId('project-name-input').fill('My Test Project');
  
  // Submit form
  await page.getByTestId('create-project-submit').click();
  
  // Verify project appears in sidebar
  await expect(page.getByTestId('project-My Test Project')).toBeVisible();
});`);
    }
    
    // Show commands
    log.section('Available Commands');
    
    console.log('To run the full AI testing pipeline:');
    console.log(chalk.cyan('  pnpm test:ai'));
    console.log('\nTo generate missing tests:');
    console.log(chalk.cyan('  pnpm test:ai:generate'));
    console.log('\nTo run in watch mode:');
    console.log(chalk.cyan('  pnpm test:ai:watch'));
    
    // Environment requirements
    log.section('Requirements');
    
    if (!process.env.OPENAI_API_KEY) {
      log.warning('OpenAI API key not set - required for AI generation');
      console.log('  export OPENAI_API_KEY=your-api-key');
    } else {
      log.success('OpenAI API key configured');
    }
    
  } catch (error) {
    log.error('Demo failed: ' + error.message);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}