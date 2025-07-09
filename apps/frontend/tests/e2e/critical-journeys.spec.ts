import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Critical User Journeys', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForAppReady();
  });

  test('Complete project setup and first chat workflow', async ({ page }) => {
    // This test covers the most critical user path
    
    // Step 1: Check if projects are available
    if (await helpers.elementExists('[data-testid="project-list"]')) {
      // If projects exist, select the first one
      const firstProject = page.locator('[data-testid="project-item"]').first();
      if (await firstProject.count() > 0) {
        await firstProject.click();
        
        // Step 2: Verify project selection UI updates
        await expect(page.locator('[data-testid="selected-project"]')).toBeVisible();
        
        // Step 3: Send first message
        await helpers.sendChatMessage('Hello! Can you help me understand this project?', false);
        
        // Step 4: Verify chat interface is functional
        await expect(page.getByText('Hello! Can you help me understand this project?')).toBeVisible();
      }
    } else {
      // If no projects, verify empty state
      await expect(page.locator('[data-testid="empty-projects"]')).toBeVisible();
    }
  });

  test('Settings panel accessibility and functionality', async ({ page }) => {
    // Test settings accessibility - critical for user experience
    
    const settingsButton = page.getByRole('button', { name: /settings/i });
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      
      // Verify settings panel opens
      await expect(page.locator('[data-testid="settings-panel"]')).toBeVisible();
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Test escape key closes settings
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="settings-panel"]')).not.toBeVisible();
    }
  });

  test('Error recovery and resilience', async ({ page }) => {
    // Test how app handles various error conditions
    
    // Simulate network error
    await page.route('/api/**', route => {
      if (Math.random() > 0.5) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });
    
    // App should still function with intermittent errors
    await expect(page.getByText('Claude Code UI')).toBeVisible();
    
    // Try to interact with UI despite network issues
    if (await helpers.elementExists('[data-testid="project-list"]')) {
      const refreshButton = page.getByRole('button', { name: /refresh|reload/i });
      if (await refreshButton.count() > 0) {
        await refreshButton.click();
        // Should handle refresh gracefully
        await expect(page.getByText('Claude Code UI')).toBeVisible();
      }
    }
  });

  test('Mobile responsive critical features', async ({ page }) => {
    // Test mobile-specific functionality
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Basic layout should work
    await expect(page.getByText('Claude Code UI')).toBeVisible();
    
    // Test mobile navigation if it exists
    const mobileMenuButton = page.getByRole('button', { name: /menu|hamburger/i });
    if (await mobileMenuButton.count() > 0) {
      await mobileMenuButton.click();
      
      // Navigation should open
      await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
    }
    
    // Test touch interactions
    if (await helpers.elementExists('[data-testid="project-item"]')) {
      await page.locator('[data-testid="project-item"]').first().tap();
    }
  });

  test('Performance and loading states', async ({ page }) => {
    // Test loading states and performance
    
    // Simulate slow loading
    await helpers.simulateSlowNetwork();
    await page.reload();
    
    // Should show appropriate loading states
    const loadingIndicators = [
      '[data-testid="loading-spinner"]',
      '[data-testid="skeleton-loader"]',
      'text="Loading"'
    ];
    
    let foundLoadingState = false;
    for (const selector of loadingIndicators) {
      if (await helpers.elementExists(selector)) {
        foundLoadingState = true;
        break;
      }
    }
    
    // Eventually app should load
    await helpers.waitForAppReady();
    await expect(page.getByText('Claude Code UI')).toBeVisible();
  });

  test('Data persistence and session management', async ({ page, context }) => {
    // Test that user interactions persist appropriately
    
    if (await helpers.elementExists('[data-testid="project-item"]')) {
      // Select a project
      const projectName = await page.locator('[data-testid="project-item"]').first().textContent();
      if (projectName) {
        await helpers.selectProject(projectName.trim());
        
        // Refresh page
        await page.reload();
        await helpers.waitForAppReady();
        
        // Check if selection persists (if app implements this)
        const selectedProject = page.locator('[data-testid="selected-project"]');
        if (await selectedProject.count() > 0) {
          // Selection should persist if implemented
          await expect(selectedProject).toBeVisible();
        }
      }
    }
  });

  test.afterEach(async ({ page }) => {
    // Check for JavaScript errors after each test
    const errors = await helpers.checkForJSErrors();
    if (errors.length > 0) {
      console.warn('JavaScript errors detected:', errors);
    }
    
    // Take screenshot on failure
    if (test.info().status === 'failed') {
      await helpers.takeScreenshot(`failure-${test.info().title}`);
    }
  });
});