/**
 * Reporter configuration presets
 * Standardized reporter settings for different environments
 */

import type {Reporter} from 'vitest';

// Vitest accepts both string names and Reporter objects
type ReporterConfig = string | Reporter;

const CI = !!process.env['CI'];

/**
 * Coverage multiplier reporter for tracking coverage metrics
 */
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

export class CoverageMultiplierReporter implements Reporter {
  onFinished(files: any[], errors?: unknown[]) {
    try {
      const coveragePath = join(
        process.cwd(),
        'coverage',
        'coverage-summary.json',
      );
      if (existsSync(coveragePath)) {
        const summary = JSON.parse(readFileSync(coveragePath, 'utf-8'));
        const metrics = summary.total;

        const avg =
          (metrics.statements.pct +
            metrics.branches.pct +
            metrics.functions.pct +
            metrics.lines.pct) /
          4;

        const multiplier = avg / 100;
        const threshold = Number(process.env['COVERAGE_THRESHOLD']) || 85;

        console.log(`\n📊 Coverage Multiplier: ${multiplier.toFixed(3)}`);
        console.log(`📈 Average Coverage: ${avg.toFixed(1)}%`);
        console.log(`🎯 Threshold: ${threshold}%`);

        if (avg < threshold) {
          console.error(
            `\n❌ Coverage below threshold! ${avg.toFixed(1)}% < ${threshold}%`,
          );
          process.exitCode = 1;
        } else {
          console.log(`\n✅ Coverage meets threshold!`);
        }
      }
    } catch (error) {
      console.warn('Could not calculate coverage multiplier:', error);
    }
  }
}

/**
 * Default reporters for CI
 */
export const ci: ReporterConfig[] = [
  'default',
  'json',
  new CoverageMultiplierReporter(),
];

/**
 * Default reporters for local development
 */
export const local: ReporterConfig[] = [
  'default',
  new CoverageMultiplierReporter(),
];

/**
 * Verbose reporters with detailed output
 */
export const verbose: ReporterConfig[] = [
  'verbose',
  new CoverageMultiplierReporter(),
];

/**
 * Minimal reporters for quiet output
 */
export const minimal: ReporterConfig[] = ['dot'];

/**
 * Test output file configuration
 */
export const outputFiles = {
  ci: {
    json: './test-results/vitest-results.json',
    html: './test-results/vitest-report.html',
    junit: './test-results/junit.xml',
  },
  local: undefined,
};

/**
 * Playwright reporter presets
 */
export const playwright = {
  ci: [
    ['json', {outputFile: 'test-results/playwright-results.json'}],
    ['html', {outputFolder: 'playwright-report', open: 'never'}],
    ['github'],
  ],
  local: [['list'], ['html', {open: 'never'}]],
  minimal: [['dot']],
  verbose: [
    ['list', {printSteps: true}],
    ['html', {open: 'on-failure'}],
  ],
};

/**
 * Get reporters based on environment
 */
export function getReporters(
  environment: 'ci' | 'local' | 'verbose' | 'minimal' = CI ? 'ci' : 'local',
): ReporterConfig[] {
  switch (environment) {
    case 'ci':
      return ci;
    case 'verbose':
      return verbose;
    case 'minimal':
      return minimal;
    case 'local':
    default:
      return local;
  }
}
