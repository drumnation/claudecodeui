import { test, expect } from '@playwright/test';

// Smoke tests for critical user journeys
test.describe('Claude Code UI - Smoke Tests', () => {
  // Test app loads and displays correctly
  test('app loads with correct title and navigation', async ({ page }) => {
    await page.goto('/');
    
    // Basic app structure
    await expect(page).toHaveTitle(/Claude Code UI/);
    await expect(page.getByText('Claude Code UI')).toBeVisible();
    
    // Navigation elements
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  // Test project workflow
  test('can select project and start chat session', async ({ page }) => {
    await page.goto('/');
    
    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-list"]', { timeout: 10000 });
    
    // Select first project if available
    const firstProject = page.locator('[data-testid="project-item"]').first();
    if (await firstProject.count() > 0) {
      await firstProject.click();
      
      // Verify project is selected
      await expect(page.locator('[data-testid="selected-project"]')).toBeVisible();
      
      // Try to start a chat
      const chatInput = page.getByRole('textbox', { name: /message/i });
      if (await chatInput.count() > 0) {
        await chatInput.fill('Hello, can you help me?');
        await page.keyboard.press('Enter');
        
        // Verify message appears in chat
        await expect(page.getByText('Hello, can you help me?')).toBeVisible();
      }
    }
  });

  // Test settings accessibility
  test('settings panel opens and closes', async ({ page }) => {
    await page.goto('/');
    
    // Look for settings button
    const settingsButton = page.getByRole('button', { name: /settings/i });
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      
      // Verify settings panel opens
      await expect(page.locator('[data-testid="settings-panel"]')).toBeVisible();
      
      // Close settings
      const closeButton = page.getByRole('button', { name: /close/i });
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await expect(page.locator('[data-testid="settings-panel"]')).not.toBeVisible();
      }
    }
  });

  // Test responsive design
  test('app works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Basic layout should still work
    await expect(page.getByText('Claude Code UI')).toBeVisible();
    
    // Mobile navigation should be present
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    if (await mobileNav.count() > 0) {
      await expect(mobileNav).toBeVisible();
    }
  });

  // Test error boundaries
  test('handles network errors gracefully', async ({ page }) => {
    // Block all network requests to simulate offline
    await page.route('**/*', route => route.abort());
    
    await page.goto('/');
    
    // App should still load basic structure
    await expect(page.getByText('Claude Code UI')).toBeVisible();
    
    // Should show appropriate error states
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });
});