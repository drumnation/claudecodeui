/**
 * Configuration for Storybook snapshot testing
 * Visual regression and DOM snapshot testing
 */

import type { TestRunnerConfig } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

// Extend jest matchers
expect.extend({ toMatchImageSnapshot });

const config: TestRunnerConfig = {
  // Setup snapshot directories
  async setup() {
    const { mkdirSync } = await import('node:fs');
    mkdirSync('./__snapshots__', { recursive: true });
    mkdirSync('./__image_snapshots__', { recursive: true });
    mkdirSync('./__diff_output__', { recursive: true });
  },
  
  // Run snapshot tests after story renders
  async postVisit(page, context) {
    // Wait for story to stabilize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300); // Wait for animations
    
    // Take DOM snapshot
    const storyRoot = await page.$('#storybook-root');
    if (storyRoot) {
      const html = await storyRoot.innerHTML();
      
      // Clean up dynamic content for stable snapshots
      const cleanedHtml = html
        .replace(/data-testid="[^"]*"/g, 'data-testid="[TESTID]"')
        .replace(/id="[^"]*"/g, 'id="[ID]"')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Save DOM snapshot
      await saveSnapshot(context.id, 'dom', cleanedHtml);
    }
    
    // Take visual snapshot
    const image = await page.screenshot({
      fullPage: false,
      animations: 'disabled',
    });
    
    // Compare with baseline
    try {
      expect(image).toMatchImageSnapshot({
        customSnapshotsDir: './__image_snapshots__',
        customDiffDir: './__diff_output__',
        customSnapshotIdentifier: context.id.replace(/[^a-zA-Z0-9]/g, '-'),
        failureThreshold: 0.01, // 1% difference threshold
        failureThresholdType: 'percent',
        blur: 1, // Slight blur to reduce flakiness
      });
    } catch (error) {
      console.error(`📸 Visual snapshot mismatch for ${context.id}`);
      throw error;
    }
  },
  
  // Tags for snapshot testing
  tags: {
    include: ['snapshot', 'visual'],
    exclude: ['skip-snapshot', 'skip-test'],
  },
};

// Helper to save snapshots
async function saveSnapshot(storyId: string, type: string, content: string) {
  const { writeFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  
  const snapshotPath = join(
    './__snapshots__',
    `${storyId.replace(/[^a-zA-Z0-9]/g, '-')}.${type}.snap`
  );
  
  writeFileSync(snapshotPath, content);
}

export default config;