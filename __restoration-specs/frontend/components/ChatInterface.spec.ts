import { test, expect } from '@playwright/test';

/**
 * Restoration Test Spec: ChatInterface
 * Verifies all functionality from the original ChatInterface component is preserved
 * Based on: apps/frontend/src/original-components/ChatInterface.original.jsx
 * Target: apps/frontend/src/features/chat/components/ChatInterface/ChatInterface.tsx
 */

test.describe('ChatInterface Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8766');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Session Protection', () => {
    test('should mark session as active when sending message', async ({ page }) => {
      // Select a project
      await page.getByTestId('project-item-test-project').click();
      
      // Start a new session
      await page.getByTestId('new-session-button').click();
      
      // Send a message
      await page.getByTestId('chat-input').fill('Hello Claude');
      await page.getByTestId('send-message-button').click();
      
      // Verify session is marked as active (should prevent project updates)
      // This would be verified by checking that project update messages don't interrupt
      await expect(page.getByTestId('session-active-indicator')).toBeVisible();
    });

    test('should release session protection after conversation ends', async ({ page }) => {
      // Setup active session
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('new-session-button').click();
      
      // Send message and wait for response
      await page.getByTestId('chat-input').fill('Hi');
      await page.getByTestId('send-message-button').click();
      await page.waitForSelector('[data-testid="assistant-message"]');
      
      // Wait for session to become inactive
      await page.waitForTimeout(2000);
      
      // Session should no longer be protected
      await expect(page.getByTestId('session-active-indicator')).not.toBeVisible();
    });
  });

  test.describe('Message Rendering', () => {
    test('should render messages with ReactMarkdown', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('session-item-existing').click();
      
      // Check for markdown rendering
      await expect(page.locator('.message-content code')).toBeVisible();
      await expect(page.locator('.message-content strong')).toBeVisible();
      await expect(page.locator('.message-content em')).toBeVisible();
    });

    test('should display message metadata correctly', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('session-item-existing').click();
      
      // Check for timestamps
      await expect(page.getByTestId('message-timestamp')).toBeVisible();
      
      // Check for role indicators
      await expect(page.getByTestId('user-message')).toBeVisible();
      await expect(page.getByTestId('assistant-message')).toBeVisible();
    });
  });

  test.describe('Input Handling', () => {
    test('should handle text input with keyboard shortcuts', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('new-session-button').click();
      
      const input = page.getByTestId('chat-input');
      await input.fill('Test message');
      
      // Test Enter to send
      await input.press('Enter');
      await expect(page.getByTestId('user-message').last()).toContainText('Test message');
      
      // Test Shift+Enter for newline
      await input.fill('Line 1');
      await input.press('Shift+Enter');
      await input.type('Line 2');
      const value = await input.inputValue();
      expect(value).toContain('\n');
    });

    test('should show file dropdown when typing /', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('new-session-button').click();
      
      await page.getByTestId('chat-input').type('/');
      await expect(page.getByTestId('file-dropdown')).toBeVisible();
      
      // Select a file
      await page.getByTestId('file-option-readme').click();
      const inputValue = await page.getByTestId('chat-input').inputValue();
      expect(inputValue).toContain('/readme');
    });

    test('should show command dropdown when typing \\', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('new-session-button').click();
      
      await page.getByTestId('chat-input').type('\\');
      await expect(page.getByTestId('command-dropdown')).toBeVisible();
      
      // Select a command
      await page.getByTestId('command-option-help').click();
      const inputValue = await page.getByTestId('chat-input').inputValue();
      expect(inputValue).toContain('\\help');
    });
  });

  test.describe('WebSocket Communication', () => {
    test('should connect to WebSocket and handle messages', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('new-session-button').click();
      
      // Monitor WebSocket connection
      const wsConnected = await page.evaluate(() => {
        return new Promise((resolve) => {
          const checkConnection = setInterval(() => {
            // Check if WebSocket is connected (would be exposed on window in test mode)
            if (window.__ws && window.__ws.readyState === 1) {
              clearInterval(checkConnection);
              resolve(true);
            }
          }, 100);
          
          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkConnection);
            resolve(false);
          }, 5000);
        });
      });
      
      expect(wsConnected).toBe(true);
    });

    test('should handle streaming responses', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('new-session-button').click();
      
      // Send a message
      await page.getByTestId('chat-input').fill('Tell me a story');
      await page.getByTestId('send-message-button').click();
      
      // Wait for streaming to start
      await page.waitForSelector('[data-testid="assistant-message-streaming"]');
      
      // Verify content is being streamed
      const initialContent = await page.getByTestId('assistant-message-streaming').textContent();
      await page.waitForTimeout(500);
      const updatedContent = await page.getByTestId('assistant-message-streaming').textContent();
      
      expect(updatedContent?.length).toBeGreaterThan(initialContent?.length || 0);
    });
  });

  test.describe('Auto-scroll Behavior', () => {
    test('should auto-scroll to bottom on new messages', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('new-session-button').click();
      
      // Send multiple messages to trigger scrolling
      for (let i = 0; i < 10; i++) {
        await page.getByTestId('chat-input').fill(`Message ${i}`);
        await page.getByTestId('send-message-button').click();
        await page.waitForTimeout(100);
      }
      
      // Check if scrolled to bottom
      const isAtBottom = await page.evaluate(() => {
        const container = document.querySelector('[data-testid="messages-container"]');
        if (!container) return false;
        return Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 10;
      });
      
      expect(isAtBottom).toBe(true);
    });

    test('should not auto-scroll if user scrolled up', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('session-item-with-history').click();
      
      // Scroll up
      await page.evaluate(() => {
        const container = document.querySelector('[data-testid="messages-container"]');
        if (container) container.scrollTop = 100;
      });
      
      // Send a new message
      await page.getByTestId('chat-input').fill('New message');
      await page.getByTestId('send-message-button').click();
      
      // Check scroll position hasn't changed much
      const scrollTop = await page.evaluate(() => {
        const container = document.querySelector('[data-testid="messages-container"]');
        return container?.scrollTop || 0;
      });
      
      expect(scrollTop).toBeGreaterThan(50);
      expect(scrollTop).toBeLessThan(150);
    });
  });

  test.describe('Session Controls', () => {
    test('should handle new session creation', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      
      const initialSessionCount = await page.getByTestId('session-item').count();
      
      await page.getByTestId('new-session-button').click();
      await page.waitForSelector('[data-testid="chat-input"]');
      
      // Send a message to create the session
      await page.getByTestId('chat-input').fill('Hello');
      await page.getByTestId('send-message-button').click();
      
      // Navigate back to see sessions
      await page.getByTestId('back-to-sessions').click();
      
      const newSessionCount = await page.getByTestId('session-item').count();
      expect(newSessionCount).toBe(initialSessionCount + 1);
    });

    test('should handle session switching', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      
      // Load first session
      await page.getByTestId('session-item-1').click();
      const firstSessionContent = await page.getByTestId('messages-container').textContent();
      
      // Switch to second session
      await page.getByTestId('back-to-sessions').click();
      await page.getByTestId('session-item-2').click();
      const secondSessionContent = await page.getByTestId('messages-container').textContent();
      
      expect(firstSessionContent).not.toBe(secondSessionContent);
    });
  });

  test.describe('Tool Display', () => {
    test('should render tool use messages correctly', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('new-session-button').click();
      
      // Send a message that triggers tool use
      await page.getByTestId('chat-input').fill('Read the README.md file');
      await page.getByTestId('send-message-button').click();
      
      // Wait for tool use display
      await page.waitForSelector('[data-testid="tool-use-block"]');
      
      // Verify tool information is displayed
      await expect(page.getByTestId('tool-name')).toContainText('Read');
      await expect(page.getByTestId('tool-parameters')).toBeVisible();
      await expect(page.getByTestId('tool-result')).toBeVisible();
    });

    test('should handle tool use expansion/collapse', async ({ page }) => {
      await page.getByTestId('project-item-test-project').click();
      await page.getByTestId('session-item-with-tools').click();
      
      // Find a tool use block
      const toolBlock = page.getByTestId('tool-use-block').first();
      
      // Should be collapsed by default for long content
      await expect(toolBlock.getByTestId('tool-content-collapsed')).toBeVisible();
      
      // Expand it
      await toolBlock.getByTestId('expand-tool-button').click();
      await expect(toolBlock.getByTestId('tool-content-expanded')).toBeVisible();
      
      // Collapse it again
      await toolBlock.getByTestId('collapse-tool-button').click();
      await expect(toolBlock.getByTestId('tool-content-collapsed')).toBeVisible();
    });
  });
});