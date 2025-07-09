import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Visual Regression Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForAppReady();
  });

  test('homepage visual consistency', async ({ page }) => {
    // Ensure consistent homepage appearance
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      // Allow some flexibility for dynamic content
      threshold: 0.2,
      // Mask dynamic elements
      mask: [
        page.locator('[data-testid="timestamp"]'),
        page.locator('[data-testid="user-avatar"]')
      ]
    });
  });

  test('project selection visual consistency', async ({ page }) => {
    if (await helpers.elementExists('[data-testid="project-list"]')) {
      // Take screenshot of project list
      await expect(page.locator('[data-testid="project-list"]')).toHaveScreenshot('project-list.png');
      
      // Select first project and check visual state
      const firstProject = page.locator('[data-testid="project-item"]').first();
      if (await firstProject.count() > 0) {
        await firstProject.click();
        
        // Screenshot of selected state
        await expect(page.locator('[data-testid="selected-project"]')).toHaveScreenshot('selected-project.png');
      }
    }
  });

  test('chat interface visual consistency', async ({ page }) => {
    // Test chat interface appearance
    if (await helpers.elementExists('[data-testid="chat-interface"]')) {
      await expect(page.locator('[data-testid="chat-interface"]')).toHaveScreenshot('chat-interface.png');
    }
  });

  test('mobile layout visual consistency', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Take mobile screenshot
    await expect(page).toHaveScreenshot('mobile-layout.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('dark mode visual consistency', async ({ page }) => {
    // Toggle dark mode if available
    const themeToggle = page.getByRole('button', { name: /dark|theme/i });
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      
      // Wait for theme transition
      await page.waitForTimeout(1000);
      
      // Take dark mode screenshot
      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
        threshold: 0.2
      });
    }
  });
});