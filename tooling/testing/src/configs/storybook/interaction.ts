/**
 * Configuration for Storybook interaction testing
 * Uses @storybook/test for component interaction testing
 */

import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  // Run interaction tests
  async postVisit(page, context) {
    // Get the story context to check for play function
    const storyContext = await getStoryContext(page, context);
    
    // Only run if story has play function (interaction test)
    if (storyContext?.story?.play) {
      console.log(`🎭 Running interaction test for ${context.id}`);
      
      // Wait for interactions to complete
      await page.waitForTimeout(100);
      
      // Check for any console errors during interaction
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Wait for interactions to finish
      await page.waitForLoadState('networkidle');
      
      if (errors.length > 0) {
        throw new Error(`Console errors during interaction:\n${errors.join('\n')}`);
      }
    }
  },
  
  // Only test stories with interaction tests
  tags: {
    include: ['interaction', 'play'],
    exclude: ['skip-test'],
  },
};

export default config;