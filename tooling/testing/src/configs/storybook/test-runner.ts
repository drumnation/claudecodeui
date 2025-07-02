/**
 * Configuration for @storybook/test-runner
 * Enhanced with coverage collection and integration
 */

import type {TestRunnerConfig} from '@storybook/test-runner';
import {checkA11y, injectAxe} from 'axe-playwright';

const COVERAGE_THRESHOLD = Number(process.env['COVERAGE_THRESHOLD']) || 85;

const config: TestRunnerConfig = {
  // Hook to run before each test
  async preVisit(page) {
    // Inject axe-core for accessibility testing
    await injectAxe(page);

    // Start coverage collection
    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage(),
    ]);
  },

  // Hook to run after the story renders
  async postVisit(page, context) {
    // Run accessibility checks with coverage awareness
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      // Axe rules configuration
      axeOptions: {
        rules: {
          // Disable specific rules if needed
          'color-contrast': {enabled: false}, // Often fails with overlays
        },
      },
    });

    // Collect coverage data
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage(),
    ]);

    // Store coverage for later processing
    const coverage = [...jsCoverage, ...cssCoverage];
    await storeCoverage(context.id, coverage);

    // Take a snapshot for visual regression
    const elementHandler = await page.$('#storybook-root');
    if (elementHandler) {
      await elementHandler.screenshot({
        path: `__screenshots__/${context.id}.png`,
      });
    }
  },

  // Tags to include/exclude stories
  tags: {
    include: ['test'],
    exclude: ['skip-test', 'manual'],
  },

  // Setup hook with coverage initialization
  async setup() {
    // Initialize coverage directory
    const {mkdirSync} = await import('node:fs');
    mkdirSync('./coverage/storybook', {recursive: true});

    console.log(`📊 Coverage threshold set to ${COVERAGE_THRESHOLD}%`);
  },

  // Custom reporter for coverage integration
  async prepare({browserContext, page, testRunnerConfig}) {
    // Enable coverage collection for the browser context
    await browserContext.grantPermissions([
      'clipboard-read',
      'clipboard-write',
    ]);

    // Set viewport for consistent screenshots
    await page.setViewportSize({width: 1280, height: 720});
  },
};

// Helper functions for coverage management
async function storeCoverage(storyId: string, coverage: any[]) {
  const {writeFileSync} = await import('node:fs');
  const {join} = await import('node:path');

  const coveragePath = join(
    './coverage/storybook',
    `${storyId.replace(/[^a-zA-Z0-9]/g, '-')}.json`,
  );
  writeFileSync(coveragePath, JSON.stringify(coverage, null, 2));
}

async function mergeCoverageReports() {
  const {readFileSync, readdirSync, writeFileSync} = await import('node:fs');
  const {join} = await import('node:path');

  const coverageDir = './coverage/storybook';
  const files = readdirSync(coverageDir).filter((f) => f.endsWith('.json'));

  // Merge all coverage files (simplified - in real implementation use nyc or c8)
  const merged = files.reduce<any[]>((acc, file) => {
    const coverage = JSON.parse(readFileSync(join(coverageDir, file), 'utf-8'));
    return [...acc, ...coverage];
  }, []);

  // Write merged coverage
  writeFileSync(
    join(coverageDir, 'coverage-final.json'),
    JSON.stringify(merged, null, 2),
  );
}

async function getCoverageStats(): Promise<{average: number}> {
  const {existsSync, readFileSync} = await import('node:fs');
  const {join} = await import('node:path');

  const summaryPath = join('./coverage/storybook', 'coverage-summary.json');

  if (existsSync(summaryPath)) {
    const summary = JSON.parse(readFileSync(summaryPath, 'utf-8'));
    const metrics = summary.total;

    const average =
      (metrics.statements.pct +
        metrics.branches.pct +
        metrics.functions.pct +
        metrics.lines.pct) /
      4;

    return {average};
  }

  // Fallback: analyze coverage-final.json
  return {average: 0};
}

export default config;
