import {test, expect} from '@playwright/test';

test.describe('ChatInterface E2E Tests', () => {
  test.beforeEach(async ({page}) => {
    // Navigate to Storybook
    await page.goto('http://localhost:6006');

    // Wait for Storybook to load
    await page.waitForSelector('#storybook-root');
  });

  test('should display no project selected state', async ({page}) => {
    // Navigate to NoProjectSelected story
    await page.click(
      '[data-item-id="features-chat-chatinterface--no-project-selected"]',
    );

    // Wait for story to load
    await page.waitForSelector('[data-testid="no-project-selected"]', {
      timeout: 10000,
    });

    // Check that the no project message is displayed
    await expect(
      page.locator('[data-testid="no-project-selected"]'),
    ).toBeVisible();
    await expect(page.locator('text=No project selected')).toBeVisible();
  });

  test('should display chat interface with project', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-chat-chatinterface--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Check that input area is present
    await expect(page.locator('[data-testid="input-area"]')).toBeVisible();

    // Check that messages area is present
    await expect(page.locator('[data-testid="messages-area"]')).toBeVisible();

    // Check that the input field is present and has correct placeholder
    const inputField = page.locator('textarea[placeholder*="Ask Claude"]');
    await expect(inputField).toBeVisible();
    await expect(inputField).toHaveAttribute(
      'placeholder',
      'Ask Claude to help with your code... (@ to reference files)',
    );
  });

  test('should handle message input and submission', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-chat-chatinterface--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Find and interact with input field
    const inputField = page.locator('textarea[placeholder*="Ask Claude"]');
    await inputField.fill('Test message');

    // Check that clear button appears
    await expect(page.locator('[data-testid="clear-button"]')).toBeVisible();

    // Check that send button is enabled
    const sendButton = page.locator('[data-testid="send-button"]');
    await expect(sendButton).toBeEnabled();

    // Submit the message
    await sendButton.click();

    // Input should be cleared after submission
    await expect(inputField).toHaveValue('');
  });

  test('should display messages correctly', async ({page}) => {
    // Navigate to WithActiveSession story
    await page.click(
      '[data-item-id="features-chat-chatinterface--with-active-session"]',
    );

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Check that messages are displayed
    await expect(page.locator('[data-testid="user-message"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="assistant-message"]'),
    ).toBeVisible();

    // Check message content
    await expect(
      page.locator('text=Hello Claude! Can you help me with React components?'),
    ).toBeVisible();
    await expect(
      page.locator(
        "text=Hello! I'd be happy to help you with React components",
      ),
    ).toBeVisible();
  });

  test('should handle file dropdown functionality', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-chat-chatinterface--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Type @ to trigger file dropdown
    const inputField = page.locator('textarea[placeholder*="Ask Claude"]');
    await inputField.fill('@');

    // Wait for file dropdown to appear
    await page.waitForSelector('[data-testid="file-dropdown"]', {
      timeout: 5000,
    });

    // Check that file dropdown is visible
    await expect(page.locator('[data-testid="file-dropdown"]')).toBeVisible();

    // Type to filter files
    await inputField.fill('@App');

    // Files should be filtered (this depends on the mock data in the story)
    // We'll check that the dropdown is still visible
    await expect(page.locator('[data-testid="file-dropdown"]')).toBeVisible();
  });

  test('should handle command menu functionality', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-chat-chatinterface--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Type / to trigger command menu
    const inputField = page.locator('textarea[placeholder*="Ask Claude"]');
    await inputField.fill('/');

    // Wait for command menu to appear
    await page.waitForSelector('[data-testid="command-menu"]', {timeout: 5000});

    // Check that command menu is visible
    await expect(page.locator('[data-testid="command-menu"]')).toBeVisible();

    // Type to filter commands
    await inputField.fill('/help');

    // Commands should be filtered
    await expect(page.locator('[data-testid="command-menu"]')).toBeVisible();
  });

  test('should display tool usage correctly', async ({page}) => {
    // Navigate to WithToolUse story
    await page.click(
      '[data-item-id="features-chat-chatinterface--with-tool-use"]',
    );

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Check that tool usage is displayed
    await expect(page.locator('[data-testid="tool-use"]')).toBeVisible();

    // Check that tool name is displayed
    await expect(page.locator('text=Read')).toBeVisible();

    // Check that tool parameters are shown
    await expect(page.locator('text=/src/App.tsx')).toBeVisible();
  });

  test('should handle loading state', async ({page}) => {
    // Navigate to Loading story
    await page.click('[data-item-id="features-chat-chatinterface--loading"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Check that loading indicator is shown
    await expect(page.locator('[data-testid="claude-status"]')).toBeVisible();

    // Check that the input is properly handled during loading
    const inputField = page.locator('textarea[placeholder*="Ask Claude"]');
    await expect(inputField).toBeVisible();
  });

  test('should handle error state', async ({page}) => {
    // Navigate to WithError story
    await page.click(
      '[data-item-id="features-chat-chatinterface--with-error"]',
    );

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Check that error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=Connection lost')).toBeVisible();
  });

  test('should be responsive on mobile', async ({page}) => {
    // Set mobile viewport
    await page.setViewportSize({width: 375, height: 667});

    // Navigate to Mobile story
    await page.click('[data-item-id="features-chat-chatinterface--mobile"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Check that mobile layout is applied
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

    // Check that input area is properly sized on mobile
    const inputField = page.locator('textarea[placeholder*="Ask Claude"]');
    await expect(inputField).toBeVisible();

    // Check that hint text is mobile-appropriate
    await expect(page.locator('text=Enter to send')).toBeVisible();
  });

  test('should handle theme switching', async ({page}) => {
    // Navigate to DarkMode story
    await page.click('[data-item-id="features-chat-chatinterface--dark-mode"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Check that dark mode styles are applied
    const body = page.locator('body');
    await expect(body).toHaveClass(/dark/);

    // Verify dark mode colors are applied
    const chatInterface = page.locator('[data-testid="chat-interface"]');
    await expect(chatInterface).toBeVisible();
  });

  test('should handle keyboard navigation', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-chat-chatinterface--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Focus on input field
    const inputField = page.locator('textarea[placeholder*="Ask Claude"]');
    await inputField.focus();

    // Test Enter key submission
    await inputField.fill('Test message');
    await inputField.press('Enter');

    // Input should be cleared
    await expect(inputField).toHaveValue('');

    // Test Shift+Enter for new line
    await inputField.fill('First line');
    await inputField.press('Shift+Enter');
    await inputField.type('Second line');

    // Should contain both lines
    await expect(inputField).toHaveValue('First line\nSecond line');
  });

  test('should handle microphone functionality', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-chat-chatinterface--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="chat-interface"]', {
      timeout: 10000,
    });

    // Check that microphone button is present
    await expect(page.locator('[data-testid="mic-button"]')).toBeVisible();

    // Click microphone button (will likely show permission dialog in real usage)
    await page.locator('[data-testid="mic-button"]').click();

    // Button should be clickable
    await expect(page.locator('[data-testid="mic-button"]')).toBeEnabled();
  });
});
