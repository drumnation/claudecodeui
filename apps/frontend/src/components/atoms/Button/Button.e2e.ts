import { test, expect } from '@playwright/test';

// E2E tests for Button component in Storybook
test.describe('Button Component E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Button story
    await page.goto('/iframe.html?id=atoms-button--default');
    await page.waitForLoadState('networkidle');
  });

  test('should render button with correct text', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Button' });
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Button');
  });

  test('should handle click events', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Button' });
    
    // Listen for console logs to verify logger is working
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'debug') {
        consoleLogs.push(msg.text());
      }
    });
    
    await button.click();
    
    // Verify button was clickable
    await expect(button).toBeEnabled();
    
    // Check that logger captured the click
    const hasClickLog = consoleLogs.some(log => 
      log.includes('Button clicked')
    );
    expect(hasClickLog).toBeTruthy();
  });

  test('should show all button variants', async ({ page }) => {
    // Navigate to variants story
    await page.goto('/iframe.html?id=atoms-button--variants');
    
    // Check all variants are visible
    const variants = ['Default', 'Destructive', 'Outline', 'Secondary', 'Ghost', 'Link'];
    
    for (const variant of variants) {
      const button = page.getByRole('button', { name: variant });
      await expect(button).toBeVisible();
    }
  });

  test('should handle disabled state correctly', async ({ page }) => {
    // Navigate to states story
    await page.goto('/iframe.html?id=atoms-button--states');
    
    const disabledButtons = page.locator('button:disabled');
    const count = await disabledButtons.count();
    
    // Should have 3 disabled buttons
    expect(count).toBe(3);
    
    // Try clicking disabled button
    const firstDisabled = disabledButtons.first();
    await expect(firstDisabled).toBeDisabled();
    
    // Disabled buttons should not be clickable
    await firstDisabled.click({ force: true });
    // No error should occur, but button remains disabled
    await expect(firstDisabled).toBeDisabled();
  });

  test('should support keyboard navigation', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Button' });
    
    // Focus the button
    await button.focus();
    await expect(button).toBeFocused();
    
    // Press Enter
    await page.keyboard.press('Enter');
    
    // Press Space
    await page.keyboard.press(' ');
    
    // Button should still be focused
    await expect(button).toBeFocused();
  });

  test('should have correct sizes', async ({ page }) => {
    // Navigate to sizes story
    await page.goto('/iframe.html?id=atoms-button--sizes');
    
    const buttons = {
      small: page.getByRole('button', { name: 'Small' }),
      default: page.getByRole('button', { name: 'Default' }),
      large: page.getByRole('button', { name: 'Large' }),
    };
    
    // Check that buttons have different sizes
    const smallBox = await buttons.small.boundingBox();
    const defaultBox = await buttons.default.boundingBox();
    const largeBox = await buttons.large.boundingBox();
    
    expect(smallBox?.height).toBeLessThan(defaultBox?.height || 0);
    expect(defaultBox?.height).toBeLessThan(largeBox?.height || 0);
  });

  test('should render with icons', async ({ page }) => {
    // Navigate to with icons story
    await page.goto('/iframe.html?id=atoms-button--with-icons');
    
    // Check buttons with icons
    const saveButton = page.getByRole('button', { name: 'Save' });
    const downloadButton = page.getByRole('button', { name: 'Download' });
    
    await expect(saveButton).toBeVisible();
    await expect(downloadButton).toBeVisible();
    
    // Check that SVG icons are present
    const saveIcon = saveButton.locator('svg');
    const downloadIcon = downloadButton.locator('svg');
    
    await expect(saveIcon).toBeVisible();
    await expect(downloadIcon).toBeVisible();
  });
});

// Cross-browser visual regression test
test.describe('Button Visual Regression', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  browsers.forEach(browserName => {
    test(`should match visual snapshot in ${browserName}`, async ({ page, browserName }) => {
      await page.goto('/iframe.html?id=atoms-button--all-variants-snapshot');
      await page.waitForLoadState('networkidle');
      
      // Wait for animations to complete
      await page.waitForTimeout(500);
      
      // Take screenshot
      await expect(page).toHaveScreenshot(`button-all-variants-${browserName}.png`, {
        fullPage: false,
        animations: 'disabled',
      });
    });
  });
});

// Mobile viewport tests
test.describe('Button Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test('should be touch-friendly on mobile', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-button--default');
    
    const button = page.getByRole('button', { name: 'Button' });
    const box = await button.boundingBox();
    
    // Button should be at least 44x44 pixels for touch targets
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});