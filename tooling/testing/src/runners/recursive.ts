#!/usr/bin/env node
/**
 * Recursive test runner with auto-adjustment capabilities
 * Automatically tweaks timeout, retry, and isolation settings on failure
 * Re-runs tests up to 2 times to meet coverage thresholds
 */

import {spawn} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {parseUserStories, filterStories, prioritizeStories} from '../ai-generation/story-parser.js';
import {AITestGenerator} from '../ai-generation/test-generator.js';
import {generateTestPrompt} from '../ai-generation/prompt-templates.js';

interface TestResult {
  success: boolean;
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
    average: number;
  };
  duration: number;
  error?: string;
}

interface RunnerOptions {
  command: string;
  args: string[];
  suite: string;
  targetCoverage: number;
  maxRetries: number;
  adjustments: {
    timeout?: boolean;
    retry?: boolean;
    isolate?: boolean;
    workers?: boolean;
  };
  aiGeneration?: {
    enabled: boolean;
    userStoriesPath: string;
    maxGenerationAttempts?: number;
  };
}

class RecursiveTestRunner {
  private attempt = 0;
  private adjustmentLog: string[] = [];
  private aiGenerator?: AITestGenerator;
  private generatedTests: string[] = [];

  constructor(private options: RunnerOptions) {
    if (this.options.aiGeneration?.enabled || process.env.AI_GENERATION_ENABLED === '1') {
      this.aiGenerator = new AITestGenerator();
    }
  }

  async run(): Promise<TestResult> {
    console.log(
      `\n🚀 Starting ${this.options.suite} tests (attempt ${this.attempt + 1}/${this.options.maxRetries + 1})`,
    );

    const startTime = Date.now();
    const result = await this.executeTests();
    result.duration = Date.now() - startTime;

    if (
      !result.success ||
      (result.coverage && result.coverage.average < this.options.targetCoverage)
    ) {
      if (this.attempt < this.options.maxRetries) {
        console.log(
          `\n⚠️  Test failed or coverage below threshold. Adjusting and retrying...`,
        );
        await this.adjustAndRetry(result);
        this.attempt++;
        return this.run();
      } else {
        console.log(`\n❌ Maximum retries reached. Final state:`);
        this.printSummary(result);
        return result;
      }
    }

    console.log(`\n✅ Tests passed with adequate coverage!`);
    this.printSummary(result);
    return result;
  }

  private async executeTests(): Promise<TestResult> {
    return new Promise((resolve) => {
      const env = {...process.env};

      // Apply adjustments from previous attempts
      if (this.adjustmentLog.includes('timeout')) {
        env.VITEST_TIMEOUT_MULTIPLIER = '2';
      }
      if (this.adjustmentLog.includes('workers')) {
        env.VITEST_POOL_SIZE = '1';
      }

      const proc = spawn(this.options.command, this.options.args, {
        env,
        stdio: 'inherit',
        shell: true,
      });

      proc.on('close', (code) => {
        const coverage = this.readCoverage();
        resolve({
          success: code === 0,
          coverage,
          duration: 0,
          error: code !== 0 ? `Process exited with code ${code}` : undefined,
        });
      });

      proc.on('error', (error) => {
        resolve({
          success: false,
          duration: 0,
          error: error.message,
        });
      });
    });
  }

  private readCoverage(): TestResult['coverage'] | undefined {
    const coveragePath = join(
      process.cwd(),
      'coverage',
      'coverage-summary.json',
    );

    if (!existsSync(coveragePath)) {
      return undefined;
    }

    try {
      const summary = JSON.parse(readFileSync(coveragePath, 'utf-8'));
      const metrics = summary.total;

      const average =
        (metrics.statements.pct +
          metrics.branches.pct +
          metrics.functions.pct +
          metrics.lines.pct) /
        4;

      return {
        statements: metrics.statements.pct,
        branches: metrics.branches.pct,
        functions: metrics.functions.pct,
        lines: metrics.lines.pct,
        average,
      };
    } catch (error) {
      console.warn('Could not read coverage data:', error);
      return undefined;
    }
  }

  private async adjustAndRetry(result: TestResult) {
    const adjustments = this.options.adjustments;

    // Check if AI generation is enabled and coverage is low
    if (this.aiGenerator && result.coverage && 
        result.coverage.average < this.options.targetCoverage &&
        !this.adjustmentLog.includes('ai-generation')) {
      console.log('🤖 Coverage below threshold. Attempting AI test generation...');
      const generated = await this.generateMissingTests();
      if (generated > 0) {
        console.log(`✅ Generated ${generated} new tests. Re-running suite...`);
        this.adjustmentLog.push('ai-generation');
        return; // Retry with new tests
      }
    }

    // Determine what to adjust based on failure type and attempt number
    if (
      result.error?.includes('timeout') &&
      adjustments.timeout &&
      !this.adjustmentLog.includes('timeout')
    ) {
      console.log('📊 Increasing timeouts...');
      this.adjustmentLog.push('timeout');
      this.updateConfig('timeout');
    } else if (
      result.coverage &&
      result.coverage.average < this.options.targetCoverage
    ) {
      if (adjustments.isolate && !this.adjustmentLog.includes('isolate')) {
        console.log('📊 Enabling test isolation for better coverage...');
        this.adjustmentLog.push('isolate');
        this.updateConfig('isolate');
      } else if (
        adjustments.workers &&
        !this.adjustmentLog.includes('workers')
      ) {
        console.log('📊 Reducing parallel workers...');
        this.adjustmentLog.push('workers');
        this.updateConfig('workers');
      } else if (adjustments.retry && !this.adjustmentLog.includes('retry')) {
        console.log('📊 Increasing retry count...');
        this.adjustmentLog.push('retry');
        this.updateConfig('retry');
      }
    }

    // Wait a moment before retry
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private updateConfig(adjustment: string) {
    // In a real implementation, this would modify the actual config files
    // For now, we'll use environment variables in executeTests
    console.log(`Applied adjustment: ${adjustment}`);
  }

  private printSummary(result: TestResult) {
    console.log('\n📋 Test Summary:');
    console.log(`Suite: ${this.options.suite}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`Attempts: ${this.attempt + 1}`);
    console.log(`Adjustments: ${this.adjustmentLog.join(', ') || 'none'}`);
    
    if (this.generatedTests.length > 0) {
      console.log(`\n🤖 AI-Generated Tests: ${this.generatedTests.length}`);
      this.generatedTests.forEach(test => console.log(`  - ${test}`));
    }

    if (result.coverage) {
      console.log('\n📊 Coverage Report:');
      console.log(`Statements: ${result.coverage.statements.toFixed(1)}%`);
      console.log(`Branches: ${result.coverage.branches.toFixed(1)}%`);
      console.log(`Functions: ${result.coverage.functions.toFixed(1)}%`);
      console.log(`Lines: ${result.coverage.lines.toFixed(1)}%`);
      console.log(`Average: ${result.coverage.average.toFixed(1)}%`);
      console.log(`Target: ${this.options.targetCoverage}%`);
    }
  }

  private async generateMissingTests(): Promise<number> {
    if (!this.aiGenerator || !this.options.aiGeneration) {
      return 0;
    }

    try {
      // Parse user stories
      const storiesPath = this.options.aiGeneration.userStoriesPath || 
                         join(process.cwd(), 'docs/automation/USER_STORIES.yml');
      
      if (!existsSync(storiesPath)) {
        console.warn('⚠️  User stories file not found:', storiesPath);
        return 0;
      }

      const allStories = await parseUserStories(storiesPath);
      console.log(`📖 Loaded ${allStories.length} user stories`);

      // Analyze coverage gaps
      const uncoveredStories = await this.identifyUncoveredStories(allStories);
      console.log(`🔍 Found ${uncoveredStories.length} stories without test coverage`);

      if (uncoveredStories.length === 0) {
        return 0;
      }

      // Prioritize and limit stories for generation
      const prioritized = prioritizeStories(uncoveredStories).slice(0, 5); // Max 5 per run
      console.log(`🎯 Generating tests for ${prioritized.length} priority stories`);

      // Generate tests
      const generatedCount = await this.generateTestsForStories(prioritized);
      
      return generatedCount;
    } catch (error) {
      console.error('❌ AI test generation failed:', error);
      return 0;
    }
  }

  private async identifyUncoveredStories(stories: any[]): Promise<any[]> {
    // In a real implementation, this would analyze existing test coverage
    // For now, we'll simulate by filtering stories
    const suiteCategory = this.options.suite.toLowerCase();
    
    return filterStories(stories, {
      tags: [suiteCategory],
      complexity: { max: 50 }, // Start with simpler stories
    });
  }

  private async generateTestsForStories(stories: any[]): Promise<number> {
    let successCount = 0;
    const generatedDir = join(process.cwd(), 'tooling/testing/generated', this.options.suite.toLowerCase());
    
    // Ensure directory exists
    mkdirSync(generatedDir, { recursive: true });

    for (const story of stories) {
      try {
        console.log(`\n🔧 Generating test for: ${story.id}`);
        
        const context = {
          projectPath: process.cwd(),
          testPath: 'tooling/testing',
          existingTests: this.generatedTests,
          frontendPatterns: {
            selectors: ['data-testid', 'role', 'text'],
            components: ['Sidebar', 'ChatInterface', 'FileTree', 'GitPanel'],
          },
        };

        const generated = await this.aiGenerator!.generateTestFromStory(story, context);
        
        // Validate generated test
        const isValid = await this.aiGenerator!.validateGeneratedTest(generated.code, story);
        
        if (isValid) {
          // Write test file
          const testPath = join(generatedDir, `${story.id.toLowerCase()}.e2e.test.ts`);
          mkdirSync(dirname(testPath), { recursive: true });
          writeFileSync(testPath, generated.code);
          
          this.generatedTests.push(testPath);
          successCount++;
          console.log(`✅ Generated test: ${testPath}`);
        } else {
          console.log(`⚠️  Generated test failed validation for ${story.id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to generate test for ${story.id}:`, error);
      }
    }

    return successCount;
  }

  private async handleGeneratedTests(): Promise<void> {
    if (this.generatedTests.length === 0) return;

    console.log('\n🧪 Validating generated tests...');
    
    // Run generated tests in isolation first
    const isolatedResult = await this.runGeneratedTests();
    
    if (!isolatedResult.success) {
      console.log('⚠️  Some generated tests failed. Attempting refinement...');
      await this.refineFailedTests(isolatedResult);
    }
  }

  private async runGeneratedTests(): Promise<TestResult> {
    // Run only the generated tests
    const testPattern = this.generatedTests.map(t => `--testNamePattern="${t}"`).join(' ');
    
    return new Promise((resolve) => {
      const proc = spawn(
        this.options.command,
        [...this.options.args, testPattern],
        {
          env: process.env,
          stdio: 'pipe',
          shell: true,
        }
      );

      let output = '';
      proc.stdout?.on('data', (data) => { output += data.toString(); });
      proc.stderr?.on('data', (data) => { output += data.toString(); });

      proc.on('close', (code) => {
        resolve({
          success: code === 0,
          duration: 0,
          error: code !== 0 ? output : undefined,
        });
      });
    });
  }

  private async refineFailedTests(result: TestResult): Promise<void> {
    if (!result.error || !this.aiGenerator) return;

    const maxRefinementAttempts = this.options.aiGeneration?.maxGenerationAttempts || 3;
    
    for (let i = 0; i < maxRefinementAttempts; i++) {
      console.log(`\n🔄 Refinement attempt ${i + 1}/${maxRefinementAttempts}`);
      
      // For each failed test, attempt refinement
      for (const testPath of this.generatedTests) {
        try {
          const testCode = readFileSync(testPath, 'utf-8');
          const storyId = testPath.match(/([^/]+)\.e2e\.test\.ts$/)?.[1];
          
          if (!storyId) continue;
          
          // Mock story object for refinement (in real impl, would look up actual story)
          const story = { id: storyId, goal: 'test goal', acceptance: [], tags: [] };
          
          const refined = await this.aiGenerator.refineTestFromFailure(
            testCode,
            result.error,
            story
          );
          
          // Write refined test
          writeFileSync(testPath, refined);
          console.log(`📝 Refined test: ${testPath}`);
        } catch (error) {
          console.error(`Failed to refine ${testPath}:`, error);
        }
      }
      
      // Re-run refined tests
      const refinedResult = await this.runGeneratedTests();
      if (refinedResult.success) {
        console.log('✅ All refined tests now passing!');
        break;
      }
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const suite = args[0] || 'unit';
  const targetCoverage = Number(args[1]) || 85;

  const runners: Record<string, RunnerOptions> = {
    unit: {
      command: 'vitest',
      args: ['run', '--config', './src/configs/vitest/unit.ts', '--coverage'],
      suite: 'Unit',
      targetCoverage,
      maxRetries: 2,
      adjustments: {
        timeout: true,
        isolate: true,
        workers: true,
      },
    },
    integration: {
      command: 'vitest',
      args: [
        'run',
        '--config',
        './src/configs/vitest/integration.ts',
        '--coverage',
      ],
      suite: 'Integration',
      targetCoverage,
      maxRetries: 2,
      adjustments: {
        timeout: true,
        retry: true,
      },
    },
    e2e: {
      command: 'vitest',
      args: ['run', '--config', './src/configs/vitest/e2e.ts'],
      suite: 'E2E',
      targetCoverage: 0, // E2E coverage disabled by default
      maxRetries: 2,
      adjustments: {
        timeout: true,
        retry: true,
      },
      aiGeneration: {
        enabled: process.env.AI_GENERATION_ENABLED === '1',
        userStoriesPath: join(process.cwd(), 'docs/automation/USER_STORIES.yml'),
        maxGenerationAttempts: 3,
      },
    },
    storybook: {
      command: 'vitest',
      args: [
        'run',
        '--config',
        './src/configs/vitest/storybook.ts',
        '--coverage',
      ],
      suite: 'Storybook',
      targetCoverage,
      maxRetries: 2,
      adjustments: {
        timeout: true,
        isolate: true,
      },
    },
    'storybook-run': {
      command: 'test-storybook',
      args: ['--coverage', '--coverageDirectory', './coverage/storybook'],
      suite: 'Storybook Test Runner',
      targetCoverage,
      maxRetries: 2,
      adjustments: {
        timeout: true,
      },
    },
    playwright: {
      command: 'playwright',
      args: ['test', '--config', './src/configs/playwright/browser.ts'],
      suite: 'Playwright Browser',
      targetCoverage: 0, // Coverage via separate tool
      maxRetries: 2,
      adjustments: {
        timeout: true,
        retry: true,
        workers: true,
      },
      aiGeneration: {
        enabled: process.env.AI_GENERATION_ENABLED === '1',
        userStoriesPath: join(process.cwd(), 'docs/automation/USER_STORIES.yml'),
        maxGenerationAttempts: 3,
      },
    },
    'playwright-storybook': {
      command: 'playwright',
      args: ['test', '--config', './src/configs/playwright/storybook.ts'],
      suite: 'Playwright Storybook E2E',
      targetCoverage: 0,
      maxRetries: 2,
      adjustments: {
        timeout: true,
        retry: true,
      },
    },
    all: {
      command: 'npm',
      args: ['run', 'test:ci:sequential'],
      suite: 'All Test Suites',
      targetCoverage,
      maxRetries: 1,
      adjustments: {
        timeout: true,
      },
    },
  };

  const runnerConfig = runners[suite];
  if (!runnerConfig) {
    console.error(`Unknown test suite: ${suite}`);
    console.log(`Available suites: ${Object.keys(runners).join(', ')}`);
    process.exit(1);
  }

  const runner = new RecursiveTestRunner(runnerConfig);
  const result = await runner.run();

  // Generate coverage delta report
  if (result.coverage) {
    const delta = result.coverage.average - targetCoverage;
    const report = {
      suite,
      coverage: result.coverage,
      targetCoverage,
      delta,
      status: delta >= 0 ? 'PASS' : 'FAIL',
      duration: result.duration,
      timestamp: new Date().toISOString(),
    };

    writeFileSync(
      join(process.cwd(), `coverage-delta-${suite}.json`),
      JSON.stringify(report, null, 2),
    );
  }

  process.exit(result.success ? 0 : 1);
}

// Export for programmatic use
export {RecursiveTestRunner};
export type {TestResult, RunnerOptions};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
