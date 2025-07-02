/**
 * Utilities for Storybook E2E testing with Playwright
 */

import {test as base, expect, Page} from '@playwright/test';
import type {StoryContext} from '@storybook/react';

/**
 * Extended test with Storybook utilities
 */
export const test = base.extend<{
  gotoStory: (storyId: string, args?: Record<string, any>) => Promise<void>;
  getStoryFrame: () => Promise<Page>;
}>({
  gotoStory: async ({page}, use) => {
    await use(async (storyId: string, args?: Record<string, any>) => {
      const params = new URLSearchParams({
        viewMode: 'story',
        id: storyId,
      });

      if (args) {
        params.set('args', encodeURIComponent(JSON.stringify(args)));
      }

      await page.goto(`/iframe.html?${params.toString()}`);
      await page.waitForLoadState('networkidle');
    });
  },

  getStoryFrame: async ({page}, use) => {
    await use(async () => {
      // In Storybook 7+, stories are rendered directly in iframe.html
      return page;
    });
  },
});

/**
 * Storybook E2E test helpers
 */
export const storybookE2E = {
  /**
   * Navigate to a story by its ID
   */
  async navigateToStory(
    page: Page,
    storyId: string,
    args?: Record<string, any>,
  ) {
    const params = new URLSearchParams({
      viewMode: 'story',
      id: storyId,
    });

    if (args) {
      params.set('args', encodeURIComponent(JSON.stringify(args)));
    }

    await page.goto(`/iframe.html?${params.toString()}`);
    await page.waitForLoadState('networkidle');
  },

  /**
   * Get story canvas element
   */
  async getCanvas(page: Page) {
    return page.locator('#storybook-root, #root').first();
  },

  /**
   * Wait for story to render
   */
  async waitForStoryRender(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(100); // Small delay for React renders
  },

  /**
   * Take a screenshot of the story
   */
  async captureStory(page: Page, name: string) {
    const canvas = await this.getCanvas(page);
    return await canvas.screenshot({
      path: `screenshots/${name}.png`,
      animations: 'disabled',
    });
  },

  /**
   * Test story interactions
   */
  async testInteractions(
    page: Page,
    interactions: Array<{
      action: 'click' | 'fill' | 'select' | 'check' | 'hover';
      selector: string;
      value?: string;
      options?: any;
    }>,
  ) {
    for (const {action, selector, value, options} of interactions) {
      switch (action) {
        case 'click':
          await page.click(selector, options);
          break;
        case 'fill':
          await page.fill(selector, value || '', options);
          break;
        case 'select':
          await page.selectOption(selector, value || '', options);
          break;
        case 'check':
          await page.check(selector, options);
          break;
        case 'hover':
          await page.hover(selector, options);
          break;
      }

      // Wait for any animations or state updates
      await page.waitForTimeout(100);
    }
  },

  /**
   * Test story accessibility
   */
  async testAccessibility(page: Page) {
    // Run accessibility checks
    const violations = await page.evaluate(() => {
      // This would integrate with axe-core or similar
      // For now, return basic checks
      const issues: string[] = [];

      // Check for alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.alt) {
          issues.push(`Image missing alt text: ${img.src}`);
        }
      });

      // Check for button labels
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn) => {
        if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
          issues.push('Button missing accessible label');
        }
      });

      return issues;
    });

    return violations;
  },

  /**
   * Test story responsiveness
   */
  async testResponsive(
    page: Page,
    storyId: string,
    viewports: Array<{name: string; width: number; height: number}>,
  ) {
    const results: Array<{name: string; screenshot: Buffer}> = [];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await this.navigateToStory(page, storyId);
      await this.waitForStoryRender(page);

      const screenshot = await this.captureStory(
        page,
        `${storyId}-${viewport.name}`,
      );
      results.push({name: viewport.name, screenshot});
    }

    return results;
  },

  /**
   * Test story visual regression
   */
  async testVisualRegression(page: Page, storyId: string, threshold = 0.2) {
    const canvas = await this.getCanvas(page);
    await expect(canvas).toHaveScreenshot(`${storyId}.png`, {
      maxDiffPixels: 100,
      threshold,
      animations: 'disabled',
    });
  },

  /**
   * Get story metadata from Storybook
   */
  async getStoryMetadata(page: Page): Promise<Partial<StoryContext>> {
    return await page.evaluate(() => {
      // Access Storybook's global API if available
      const win = window as any;
      if (win.__STORYBOOK_STORY_STORE__) {
        const store = win.__STORYBOOK_STORY_STORE__;
        const story = store.raw();
        return {
          id: story?.id,
          title: story?.title,
          name: story?.name,
          parameters: story?.parameters,
        };
      }
      return {};
    });
  },
};

/**
 * Create a story E2E test suite
 */
export function createStoryE2ETests(
  componentName: string,
  stories: Array<{
    id: string;
    name: string;
    args?: Record<string, any>;
    skip?: boolean;
    only?: boolean;
  }>,
  options?: {
    skipVisualRegression?: boolean;
    skipAccessibility?: boolean;
    skipResponsive?: boolean;
    viewports?: Array<{name: string; width: number; height: number}>;
  },
) {
  test.describe(`${componentName} Stories E2E`, () => {
    stories.forEach((story) => {
      if (story.skip) return;

      const describeFn = story.only ? test.describe.only : test.describe;

      describeFn(story.name, () => {
        test.beforeEach(async ({gotoStory}) => {
          await gotoStory(story.id, story.args);
        });

        test('renders correctly', async ({page}) => {
          await storybookE2E.waitForStoryRender(page);
          const canvas = await storybookE2E.getCanvas(page);
          await expect(canvas).toBeVisible();
        });

        if (!options?.skipVisualRegression) {
          test('visual regression', async ({page}) => {
            await storybookE2E.testVisualRegression(page, story.id);
          });
        }

        if (!options?.skipAccessibility) {
          test('accessibility', async ({page}) => {
            const violations = await storybookE2E.testAccessibility(page);
            expect(violations).toHaveLength(0);
          });
        }

        if (!options?.skipResponsive && options?.viewports) {
          test('responsive design', async ({page}) => {
            await storybookE2E.testResponsive(
              page,
              story.id,
              options.viewports!,
            );
          });
        }
      });
    });
  });
}

// Re-export Playwright utilities
export {expect} from '@playwright/test';
