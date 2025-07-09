#!/usr/bin/env node

/**
 * Storybook Test Integration Script
 *
 * This script integrates Storybook testing into the brain:validate workflow
 * It runs multiple test suites in parallel and reports results in a format
 * that can be consumed by the brain monitoring system.
 */

import {spawn} from 'child_process';
import fs from 'fs';
import path from 'path';
import {performance} from 'perf_hooks';
import fetch from 'node-fetch';

// Configuration
const config = {
  storybookPort: 6006,
  testTimeout: 300000, // 5 minutes
  parallel: true,
  retries: 2,
  outputDir: './test-results',
  coverageDir: './coverage',
};

// Ensure output directories exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, {recursive: true});
}
if (!fs.existsSync(config.coverageDir)) {
  fs.mkdirSync(config.coverageDir, {recursive: true});
}

// Test suite configurations
const testSuites = [
  {
    name: 'storybook-unit',
    description: 'Unit tests for Storybook stories',
    command: 'npm',
    args: ['run', 'test:storybook:unit'],
    env: {...process.env, NODE_ENV: 'test'},
  },
  {
    name: 'storybook-e2e',
    description: 'End-to-end tests for Storybook stories',
    command: 'npm',
    args: ['run', 'test:storybook'],
    env: {...process.env, NODE_ENV: 'test'},
  },
  {
    name: 'storybook-a11y',
    description: 'Accessibility tests for Storybook stories',
    command: 'npm',
    args: ['run', 'test:storybook:a11y'],
    env: {...process.env, NODE_ENV: 'test'},
  },
];

// Results tracking
const testResults = {
  startTime: Date.now(),
  endTime: null,
  duration: null,
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  },
  suites: [],
  errors: [],
  coverage: null,
};

// Utility functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    log(`Running: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'pipe',
      ...options,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      resolve({
        code,
        stdout,
        stderr,
        duration,
        success: code === 0,
      });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkStorybookReady() {
  log('Checking if Storybook is ready...');

  for (let i = 0; i < 30; i++) {
    try {
      const response = await fetch(`http://localhost:${config.storybookPort}`);
      if (response.ok) {
        log('Storybook is ready!');
        return true;
      }
    } catch (error) {
      // Continue trying
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('Storybook failed to start within timeout');
}

async function startStorybook() {
  log('Starting Storybook...');

  const storybookProcess = spawn('npm', ['run', 'storybook'], {
    stdio: 'pipe',
    env: {...process.env, NODE_ENV: 'development'},
  });

  // Give Storybook time to start
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Check if Storybook is ready
  await checkStorybookReady();

  return storybookProcess;
}

async function runTestSuite(suite) {
  log(`Running test suite: ${suite.name}`);

  const startTime = performance.now();
  let result;

  try {
    result = await runCommand(suite.command, suite.args, {
      env: suite.env,
      timeout: config.testTimeout,
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    const suiteResult = {
      name: suite.name,
      description: suite.description,
      success: result.success,
      duration,
      stdout: result.stdout,
      stderr: result.stderr,
      tests: parseTestResults(result.stdout),
    };

    testResults.suites.push(suiteResult);

    if (result.success) {
      log(`✅ Test suite ${suite.name} passed`, 'success');
    } else {
      log(`❌ Test suite ${suite.name} failed`, 'error');
      testResults.errors.push({
        suite: suite.name,
        error: result.stderr,
      });
    }

    return suiteResult;
  } catch (error) {
    log(
      `❌ Test suite ${suite.name} failed with error: ${error.message}`,
      'error',
    );

    const suiteResult = {
      name: suite.name,
      description: suite.description,
      success: false,
      duration: performance.now() - startTime,
      error: error.message,
      tests: {total: 0, passed: 0, failed: 1, skipped: 0},
    };

    testResults.suites.push(suiteResult);
    testResults.errors.push({
      suite: suite.name,
      error: error.message,
    });

    return suiteResult;
  }
}

function parseTestResults(output) {
  // Parse test results from output
  const tests = {total: 0, passed: 0, failed: 0, skipped: 0};

  // Look for Vitest output patterns
  const vitestMatch = output.match(
    /Test Files\s+(\d+)\s+passed|failed|skipped/,
  );
  if (vitestMatch) {
    tests.total = parseInt(vitestMatch[1]) || 0;
  }

  // Look for Playwright output patterns
  const playwrightMatch = output.match(/(\d+)\s+passed/);
  if (playwrightMatch) {
    tests.passed = parseInt(playwrightMatch[1]) || 0;
  }

  // Look for failure patterns
  const failureMatch = output.match(/(\d+)\s+failed/);
  if (failureMatch) {
    tests.failed = parseInt(failureMatch[1]) || 0;
  }

  // Look for skipped patterns
  const skippedMatch = output.match(/(\d+)\s+skipped/);
  if (skippedMatch) {
    tests.skipped = parseInt(skippedMatch[1]) || 0;
  }

  if (tests.total === 0) {
    tests.total = tests.passed + tests.failed + tests.skipped;
  }

  return tests;
}

async function generateCoverageReport() {
  log('Generating coverage report...');

  try {
    const result = await runCommand('npm', ['run', 'test:coverage'], {
      timeout: 60000,
    });

    if (result.success) {
      // Parse coverage from output
      const coverageMatch = result.stdout.match(
        /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/,
      );
      if (coverageMatch) {
        testResults.coverage = {
          statements: parseFloat(coverageMatch[1]),
          branches: parseFloat(coverageMatch[2]),
          functions: parseFloat(coverageMatch[3]),
          lines: parseFloat(coverageMatch[4]),
        };
      }
    }
  } catch (error) {
    log(
      `Warning: Could not generate coverage report: ${error.message}`,
      'warn',
    );
  }
}

async function saveResults() {
  testResults.endTime = Date.now();
  testResults.duration = testResults.endTime - testResults.startTime;

  // Calculate summary
  testResults.suites.forEach((suite) => {
    if (suite.tests) {
      testResults.summary.total += suite.tests.total;
      testResults.summary.passed += suite.tests.passed;
      testResults.summary.failed += suite.tests.failed;
      testResults.summary.skipped += suite.tests.skipped;
    }
  });

  // Save detailed results
  const resultsFile = path.join(
    config.outputDir,
    'storybook-test-results.json',
  );
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));

  // Save summary for brain monitor
  const summaryFile = path.join(
    config.outputDir,
    'storybook-test-summary.json',
  );
  fs.writeFileSync(
    summaryFile,
    JSON.stringify(
      {
        success: testResults.errors.length === 0,
        timestamp: new Date().toISOString(),
        duration: testResults.duration,
        summary: testResults.summary,
        coverage: testResults.coverage,
        errors: testResults.errors,
      },
      null,
      2,
    ),
  );

  log(`Results saved to ${resultsFile}`);
  log(`Summary saved to ${summaryFile}`);
}

function printSummary() {
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed}`);
  console.log(`Failed: ${testResults.summary.failed}`);
  console.log(`Skipped: ${testResults.summary.skipped}`);
  console.log(`Duration: ${(testResults.duration / 1000).toFixed(2)}s`);

  if (testResults.coverage) {
    console.log('\n📈 Coverage Report');
    console.log('==================');
    console.log(`Statements: ${testResults.coverage.statements}%`);
    console.log(`Branches: ${testResults.coverage.branches}%`);
    console.log(`Functions: ${testResults.coverage.functions}%`);
    console.log(`Lines: ${testResults.coverage.lines}%`);
  }

  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors');
    console.log('==========');
    testResults.errors.forEach((error) => {
      console.log(`${error.suite}: ${error.error}`);
    });
  }
}

// Main execution
async function main() {
  log('Starting Storybook test integration...');

  let storybookProcess;

  try {
    // Start Storybook
    storybookProcess = await startStorybook();

    // Run test suites
    if (config.parallel) {
      log('Running test suites in parallel...');
      const promises = testSuites.map((suite) => runTestSuite(suite));
      await Promise.all(promises);
    } else {
      log('Running test suites sequentially...');
      for (const suite of testSuites) {
        await runTestSuite(suite);
      }
    }

    // Generate coverage report
    await generateCoverageReport();

    // Save results
    await saveResults();

    // Print summary
    printSummary();

    // Exit with appropriate code
    const success = testResults.errors.length === 0;
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    // Clean up Storybook process
    if (storybookProcess) {
      storybookProcess.kill();
    }
  }
}

// Handle process signals
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down gracefully...', 'warn');
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down gracefully...', 'warn');
  process.exit(143);
});

// Run the main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
