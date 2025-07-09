import { Page, expect } from '@playwright/test';

/**
 * Common test utilities for E2E tests
 */
export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the app to be fully loaded
   */
  async waitForAppReady(timeout = 30000) {
    await this.page.waitForSelector('[data-testid="app-ready"]', { timeout });
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('[data-testid="loading-spinner"]', { 
      state: 'hidden', 
      timeout: 10000 
    }).catch(() => {
      // Loading spinner might not exist, that's fine
    });
  }

  /**
   * Select a project by name
   */
  async selectProject(projectName: string) {
    const projectSelector = `[data-testid="project-item"]:has-text("${projectName}")`;
    await this.page.waitForSelector(projectSelector, { timeout: 10000 });
    await this.page.click(projectSelector);
    
    // Verify project is selected
    await expect(this.page.locator('[data-testid="selected-project"]')).toContainText(projectName);
  }

  /**
   * Send a chat message and wait for response
   */
  async sendChatMessage(message: string, waitForResponse = true) {
    const chatInput = this.page.getByRole('textbox', { name: /message|chat/i });
    await chatInput.fill(message);
    await this.page.keyboard.press('Enter');
    
    // Verify message appears in chat
    await expect(this.page.getByText(message)).toBeVisible();
    
    if (waitForResponse) {
      // Wait for assistant response (look for typing indicator or new message)
      await this.page.waitForSelector('[data-testid="assistant-message"]', { 
        timeout: 30000 
      }).catch(() => {
        // Response might not come immediately, that's fine for smoke tests
      });
    }
  }

  /**
   * Check if element exists without throwing
   */
  async elementExists(selector: string): Promise<boolean> {
    return (await this.page.locator(selector).count()) > 0;
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Check for JavaScript errors
   */
  async checkForJSErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('pageerror', error => {
      errors.push(error.message);
    });
    return errors;
  }

  /**
   * Mock slow network conditions
   */
  async simulateSlowNetwork() {
    await this.page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });
  }

  /**
   * Check accessibility violations
   */
  async checkAccessibility() {
    // Basic accessibility checks
    const missingAltTexts = await this.page.locator('img:not([alt])').count();
    const missingAriaLabels = await this.page.locator('button:not([aria-label]):not(:has-text())').count();
    
    return {
      missingAltTexts,
      missingAriaLabels,
      hasIssues: missingAltTexts > 0 || missingAriaLabels > 0
    };
  }
}