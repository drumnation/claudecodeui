#!/usr/bin/env tsx
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { init } from './init/init.js';
import { runValidation } from './tasks/validate.js';
import { runWatch } from './tasks/watch.js';
import { monitorLogs } from './log/monitor.js';
import { runDev } from './tasks/dev.js';
import { generateCIWorkflows, testCILocally, updateCIWorkflows } from './ci/index.js';

const argv = yargs(hideBin(process.argv))
  .command('init', 'Initialize brain-monitor in your project', {}, async () => {
    await init();
  })
  .command('validate', 'Run all validations', {}, async () => {
    await runValidation();
  })
  .command('watch', 'Watch mode for continuous validation', {
    all: {
      type: 'boolean',
      describe: 'Include all validations including tests',
      default: false
    },
    interval: {
      type: 'number',
      describe: 'Update interval in seconds',
      default: 5
    }
  }, async (args) => {
    await runWatch({ includeTests: args.all, interval: args.interval });
  })
  .command('typecheck', 'Run TypeScript validation only', {}, async () => {
    await runValidation(['typecheck']);
  })
  .command('lint', 'Run ESLint validation only', {}, async () => {
    await runValidation(['lint']);
  })
  .command('format', 'Run Prettier validation only', {}, async () => {
    await runValidation(['format']);
  })
  .command('test [type]', 'Run specific test suite', {
    type: {
      type: 'string',
      describe: 'Test type (unit, integration, e2e, etc.)'
    }
  }, async (args) => {
    const testType = args.type ? `test-${args.type}` : 'test';
    await runValidation([testType]);
  })
  .command('test-storybook', 'Run Storybook E2E tests only', {
    comprehensive: {
      type: 'boolean',
      describe: 'Run comprehensive Storybook tests',
      default: false
    }
  }, async (args) => {
    const testType = args.comprehensive ? 'test-storybook-comprehensive' : 'test-storybook';
    await runValidation([testType]);
  })
  .command('validate-critical', 'Run only critical validations', {}, async () => {
    await runValidation(['typecheck', 'typecheck-backend', 'test', 'test-backend', 'test-e2e-smoke', 'test-e2e-critical']);
  })
  .command('test-e2e', 'Run E2E tests', {
    type: {
      type: 'string',
      describe: 'Test type (smoke, api, critical, visual, performance)',
      default: 'smoke'
    }
  }, async (args) => {
    const testType = `test-e2e-${args.type}`;
    await runValidation([testType]);
  })
  .command('validate-extended', 'Run extended validations including visual and performance', {}, async () => {
    await runValidation(['typecheck', 'typecheck-backend', 'lint', 'format', 'test', 'test-backend', 'test-e2e-smoke', 'test-e2e-critical', 'test-e2e-visual', 'test-e2e-performance', 'test-storybook']);
  })
  .command('validate-quick', 'Run quick validations (no tests)', {}, async () => {
    await runValidation(['typecheck', 'typecheck-backend', 'lint', 'format']);
  })
  .command('logs', 'Monitor dev server logs', {}, async () => {
    await monitorLogs();
  })
  .command('dev', 'Start dev servers with integrated logging', {}, async () => {
    await runDev();
  })
  .command('ci:init', 'Generate GitHub Actions workflows', {}, async () => {
    await generateCIWorkflows();
  })
  .command('ci:test', 'Test workflows locally with act', {}, async () => {
    await testCILocally();
  })
  .command('ci:update', 'Update existing workflows', {}, async () => {
    await updateCIWorkflows();
  })
  .demandCommand()
  .help()
  .argv;