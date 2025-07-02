#!/usr/bin/env node
/**
 * CI test orchestration script
 * Runs all test suites, merges coverage, and generates reports
 */

import {spawn} from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from 'node:fs';
import {join} from 'node:path';

interface SuiteResult {
  name: string;
  passed: boolean;
  coverage?: {
    average: number;
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  duration: number;
  retries: number;
}

class CITestOrchestrator {
  private results: SuiteResult[] = [];
  private startTime = Date.now();

  async runAllSuites() {
    console.log('🚀 Starting CI Test Suite Orchestration\n');

    // Ensure coverage directories exist
    this.ensureDirectories();

    // Run test suites in optimal order
    const suites = [
      {name: 'unit', parallel: true},
      {name: 'storybook', parallel: true},
      {name: 'integration', parallel: false},
      {name: 'e2e', parallel: false},
      {name: 'playwright', parallel: false},
      {name: 'storybook-run', parallel: false},
      {name: 'playwright-storybook', parallel: false},
    ];

    // Run parallel suites first
    const parallelSuites = suites.filter((s) => s.parallel);
    const sequentialSuites = suites.filter((s) => !s.parallel);

    console.log('📦 Running parallel test suites...\n');
    await Promise.all(parallelSuites.map((suite) => this.runSuite(suite.name)));

    console.log('\n📦 Running sequential test suites...\n');
    for (const suite of sequentialSuites) {
      await this.runSuite(suite.name);
    }

    // Merge all coverage reports
    await this.mergeCoverage();

    // Generate final report
    this.generateFinalReport();
  }

  private ensureDirectories() {
    const dirs = [
      'coverage',
      'coverage/unit',
      'coverage/integration',
      'coverage/e2e',
      'coverage/storybook',
      'coverage/playwright',
      'coverage/merged',
      'test-results',
    ];

    dirs.forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, {recursive: true});
      }
    });
  }

  private async runSuite(name: string): Promise<void> {
    console.log(`\n🧪 Running ${name} tests...`);
    const startTime = Date.now();

    const result = await this.executeSuite(name);
    const duration = Date.now() - startTime;

    this.results.push({
      name,
      passed: result.passed,
      coverage: result.coverage,
      duration,
      retries: result.retries || 0,
    });

    if (result.passed) {
      console.log(
        `✅ ${name} tests passed in ${(duration / 1000).toFixed(2)}s`,
      );
    } else {
      console.log(`❌ ${name} tests failed after ${result.retries} retries`);
    }
  }

  private async executeSuite(
    name: string,
  ): Promise<{passed: boolean; coverage?: any; retries?: number}> {
    return new Promise((resolve) => {
      const env = {
        ...process.env,
        COVERAGE_THRESHOLD: '85',
        NODE_ENV: 'test',
        CI: 'true',
      };

      // Use recursive runner for Vitest suites
      const vitestSuites = ['unit', 'integration', 'e2e', 'storybook'];
      const useRecursive = vitestSuites.includes(name);

      const command = useRecursive ? 'node' : 'npm';
      const args = useRecursive
        ? ['./src/configs/recursive-runner.js', name, '85']
        : ['run', `test:${name}`];

      const proc = spawn(command, args, {
        env,
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd(),
      });

      proc.on('close', (code) => {
        const coverage = this.readSuiteCoverage(name);
        const retriesData = this.readRetriesData(name);

        resolve({
          passed: code === 0,
          coverage,
          retries: retriesData?.attempts || 0,
        });
      });

      proc.on('error', (error) => {
        console.error(`Error running ${name} tests:`, error);
        resolve({passed: false});
      });
    });
  }

  private readSuiteCoverage(
    suite: string,
  ): SuiteResult['coverage'] | undefined {
    const paths = [
      join('coverage', 'coverage-summary.json'),
      join('coverage', suite, 'coverage-summary.json'),
      join(`coverage-delta-${suite}.json`),
    ];

    for (const path of paths) {
      if (existsSync(path)) {
        try {
          const data = JSON.parse(readFileSync(path, 'utf-8'));

          if (data.coverage) {
            return data.coverage; // From delta file
          }

          if (data.total) {
            const metrics = data.total;
            const average =
              (metrics.statements.pct +
                metrics.branches.pct +
                metrics.functions.pct +
                metrics.lines.pct) /
              4;

            return {
              average,
              statements: metrics.statements.pct,
              branches: metrics.branches.pct,
              functions: metrics.functions.pct,
              lines: metrics.lines.pct,
            };
          }
        } catch (error) {
          console.warn(`Could not read coverage for ${suite}:`, error);
        }
      }
    }

    return undefined;
  }

  private readRetriesData(suite: string): {attempts: number} | undefined {
    const deltaPath = join(`coverage-delta-${suite}.json`);
    if (existsSync(deltaPath)) {
      try {
        const data = JSON.parse(readFileSync(deltaPath, 'utf-8'));
        return {attempts: data.attempts || 1};
      } catch {
        // Ignore
      }
    }
    return undefined;
  }

  private async mergeCoverage() {
    console.log('\n📊 Merging coverage reports...');

    // Use nyc to merge coverage data
    const coverageFiles = readdirSync('coverage')
      .filter((file) => file.endsWith('.json') && !file.includes('summary'))
      .map((file) => join('coverage', file));

    if (coverageFiles.length === 0) {
      console.log('No coverage files to merge');
      return;
    }

    // In a real implementation, use nyc or c8 to merge
    console.log(`Found ${coverageFiles.length} coverage files to merge`);

    // Calculate merged metrics (simplified)
    let totalCoverage = 0;
    let count = 0;

    this.results.forEach((result) => {
      if (result.coverage) {
        totalCoverage += result.coverage.average;
        count++;
      }
    });

    const mergedAverage = count > 0 ? totalCoverage / count : 0;

    writeFileSync(
      join('coverage', 'merged', 'coverage-summary.json'),
      JSON.stringify(
        {
          total: {
            statements: {pct: mergedAverage},
            branches: {pct: mergedAverage},
            functions: {pct: mergedAverage},
            lines: {pct: mergedAverage},
          },
        },
        null,
        2,
      ),
    );
  }

  private generateFinalReport() {
    const duration = Date.now() - this.startTime;
    const allPassed = this.results.every((r) => r.passed);

    console.log('\n' + '='.repeat(80));
    console.log('📋 FINAL TEST REPORT');
    console.log('='.repeat(80) + '\n');

    // Suite results table
    console.log('Test Suite Results:');
    console.log('-'.repeat(80));
    console.log(
      'Suite'.padEnd(20) +
        'Status'.padEnd(10) +
        'Coverage'.padEnd(15) +
        'Duration'.padEnd(15) +
        'Retries',
    );
    console.log('-'.repeat(80));

    this.results.forEach((result) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const coverage = result.coverage
        ? `${result.coverage.average.toFixed(1)}%`
        : 'N/A';
      const duration = `${(result.duration / 1000).toFixed(2)}s`;
      const retries = result.retries > 0 ? `${result.retries}` : '-';

      console.log(
        result.name.padEnd(20) +
          status.padEnd(10) +
          coverage.padEnd(15) +
          duration.padEnd(15) +
          retries,
      );
    });

    console.log('-'.repeat(80));

    // Coverage summary
    const suitesWithCoverage = this.results.filter((r) => r.coverage);
    if (suitesWithCoverage.length > 0) {
      const avgCoverage =
        suitesWithCoverage.reduce(
          (sum, r) => sum + (r.coverage?.average || 0),
          0,
        ) / suitesWithCoverage.length;

      console.log('\n📊 Coverage Summary:');
      console.log(`Average Coverage: ${avgCoverage.toFixed(1)}%`);
      console.log(`Target Coverage: 85%`);
      console.log(
        `Status: ${avgCoverage >= 85 ? '✅ MEETS THRESHOLD' : '❌ BELOW THRESHOLD'}`,
      );
    }

    // Timing summary
    console.log('\n⏱️  Timing Summary:');
    console.log(`Total Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(
      `Parallel Suites: ${this.results.filter((r) => ['unit', 'storybook'].includes(r.name)).length}`,
    );
    console.log(
      `Sequential Suites: ${this.results.filter((r) => !['unit', 'storybook'].includes(r.name)).length}`,
    );

    // Final status
    console.log('\n' + '='.repeat(80));
    console.log(
      `FINAL STATUS: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`,
    );
    console.log('='.repeat(80) + '\n');

    // Write JSON report
    const report = {
      status: allPassed ? 'PASS' : 'FAIL',
      duration,
      timestamp: new Date().toISOString(),
      results: this.results,
      coverage: {
        average:
          suitesWithCoverage.reduce(
            (sum, r) => sum + (r.coverage?.average || 0),
            0,
          ) / suitesWithCoverage.length,
        threshold: 85,
      },
    };

    writeFileSync(
      join('test-results', 'ci-test-report.json'),
      JSON.stringify(report, null, 2),
    );

    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);
  }
}

// Run the orchestrator
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new CITestOrchestrator();
  orchestrator.runAllSuites().catch(console.error);
}

export {CITestOrchestrator};
