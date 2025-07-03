import { test, expect } from '@playwright/test';

/**
 * Restoration Test Spec: MainContent
 * Verifies all functionality from the original MainContent component is preserved
 * Based on: apps/frontend/src/original-components/MainContent.original.jsx
 * Target: apps/frontend/src/components/layouts/MainContent/MainContent.tsx
 */

test.describe('MainContent Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8766');
    await page.waitForLoadState('networkidle');
    
    // Select a project to access main content
    await page.getByTestId('project-item').first().click();
  });

  test.describe('Tab Navigation', () => {
    test('should display all tabs', async ({ page }) => {
      // Verify all tabs are present
      await expect(page.getByTestId('tab-chat')).toBeVisible();
      await expect(page.getByTestId('tab-shell')).toBeVisible();
      await expect(page.getByTestId('tab-files')).toBeVisible();
      await expect(page.getByTestId('tab-git')).toBeVisible();
      await expect(page.getByTestId('tab-preview')).toBeVisible();
    });

    test('should switch between tabs correctly', async ({ page }) => {
      // Chat tab should be active by default
      await expect(page.getByTestId('tab-chat')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('chat-content')).toBeVisible();
      
      // Switch to Shell
      await page.getByTestId('tab-shell').click();
      await expect(page.getByTestId('tab-shell')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('shell-content')).toBeVisible();
      await expect(page.getByTestId('chat-content')).not.toBeVisible();
      
      // Switch to Files
      await page.getByTestId('tab-files').click();
      await expect(page.getByTestId('tab-files')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('files-content')).toBeVisible();
      
      // Switch to Git
      await page.getByTestId('tab-git').click();
      await expect(page.getByTestId('tab-git')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('git-content')).toBeVisible();
      
      // Switch to Preview
      await page.getByTestId('tab-preview').click();
      await expect(page.getByTestId('tab-preview')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('preview-content')).toBeVisible();
    });

    test('should preserve tab state when switching', async ({ page }) => {
      // Type something in chat
      await page.getByTestId('chat-input').fill('Test message');
      
      // Switch to another tab
      await page.getByTestId('tab-files').click();
      
      // Switch back to chat
      await page.getByTestId('tab-chat').click();
      
      // Message should still be there
      const inputValue = await page.getByTestId('chat-input').inputValue();
      expect(inputValue).toBe('Test message');
    });
  });

  test.describe('Session Protection Integration', () => {
    test('should pass session protection state to ChatInterface', async ({ page }) => {
      // Start a new session
      await page.getByTestId('new-session-button').click();
      
      // Send a message to activate session protection
      await page.getByTestId('chat-input').fill('Hello');
      await page.getByTestId('send-message-button').click();
      
      // Session should be marked as active
      await expect(page.getByTestId('session-active-indicator')).toBeVisible();
      
      // Switch tabs - protection should persist
      await page.getByTestId('tab-files').click();
      await page.getByTestId('tab-chat').click();
      
      // Session should still be active
      await expect(page.getByTestId('session-active-indicator')).toBeVisible();
    });
  });

  test.describe('File Editing Modal', () => {
    test('should open file editor from Files tab', async ({ page }) => {
      // Switch to Files tab
      await page.getByTestId('tab-files').click();
      
      // Click on a file
      await page.getByTestId('file-item-readme').click();
      
      // Editor modal should open
      await expect(page.getByTestId('file-editor-modal')).toBeVisible();
      await expect(page.getByTestId('editor-filename')).toContainText('README.md');
    });

    test('should handle file editing and saving', async ({ page }) => {
      // Open a file
      await page.getByTestId('tab-files').click();
      await page.getByTestId('file-item-config').click();
      
      // Edit content
      const editor = page.getByTestId('code-editor');
      await editor.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('// Updated content');
      
      // Save file
      await page.getByTestId('save-file-button').click();
      
      // Should show success message
      await expect(page.getByTestId('save-success-message')).toBeVisible();
      
      // Close modal
      await page.getByTestId('close-editor-button').click();
      await expect(page.getByTestId('file-editor-modal')).not.toBeVisible();
    });

    test('should warn about unsaved changes', async ({ page }) => {
      // Open a file
      await page.getByTestId('tab-files').click();
      await page.getByTestId('file-item-source').click();
      
      // Make changes
      const editor = page.getByTestId('code-editor');
      await editor.click();
      await page.keyboard.type('// New line');
      
      // Try to close without saving
      await page.getByTestId('close-editor-button').click();
      
      // Should show warning dialog
      await expect(page.getByTestId('unsaved-changes-dialog')).toBeVisible();
      
      // Cancel closing
      await page.getByTestId('cancel-close-button').click();
      await expect(page.getByTestId('file-editor-modal')).toBeVisible();
    });
  });

  test.describe('Server Status Handling', () => {
    test('should display server status in Preview tab', async ({ page }) => {
      // Switch to Preview tab
      await page.getByTestId('tab-preview').click();
      
      // Check server status indicator
      await expect(page.getByTestId('server-status')).toBeVisible();
      
      // Status should be one of: stopped, starting, running, error
      const status = await page.getByTestId('server-status').getAttribute('data-status');
      expect(['stopped', 'starting', 'running', 'error']).toContain(status);
    });

    test('should handle server start/stop', async ({ page }) => {
      await page.getByTestId('tab-preview').click();
      
      // If server is stopped, start it
      const initialStatus = await page.getByTestId('server-status').getAttribute('data-status');
      
      if (initialStatus === 'stopped') {
        await page.getByTestId('start-server-button').click();
        
        // Wait for server to start
        await page.waitForSelector('[data-testid="server-status"][data-status="starting"]');
        await page.waitForSelector('[data-testid="server-status"][data-status="running"]', { timeout: 30000 });
        
        // Stop server
        await page.getByTestId('stop-server-button').click();
        await page.waitForSelector('[data-testid="server-status"][data-status="stopped"]');
      }
    });
  });

  test.describe('Responsive Layout', () => {
    test('should adapt layout for desktop', async ({ page }) => {
      // Desktop should show sidebar and main content side by side
      await expect(page.getByTestId('sidebar')).toBeVisible();
      await expect(page.getByTestId('main-content')).toBeVisible();
      
      // Both should be visible simultaneously
      const sidebarBox = await page.getByTestId('sidebar').boundingBox();
      const mainBox = await page.getByTestId('main-content').boundingBox();
      
      expect(sidebarBox?.x).toBeLessThan(mainBox?.x || 0);
    });

    test.use({ viewport: { width: 768, height: 1024 } });
    
    test('should adapt layout for tablet', async ({ page }) => {
      // Tablet might show collapsible sidebar
      const sidebar = page.getByTestId('sidebar');
      const mainContent = page.getByTestId('main-content');
      
      // Check if sidebar can be toggled
      if (await page.getByTestId('sidebar-toggle').isVisible()) {
        // Sidebar should be collapsible
        await page.getByTestId('sidebar-toggle').click();
        await expect(sidebar).not.toBeVisible();
        
        // Main content should expand
        const mainBox = await mainContent.boundingBox();
        expect(mainBox?.width).toBeGreaterThan(700);
      }
    });

    test.use({ viewport: { width: 375, height: 667 } });
    
    test('should show mobile-optimized tabs', async ({ page }) => {
      // Tabs might be in a scrollable container or dropdown on mobile
      const tabContainer = page.getByTestId('tab-container');
      
      // Check if tabs are scrollable
      const containerBox = await tabContainer.boundingBox();
      const tabs = await page.getByTestId('[data-testid^="tab-"]').all();
      
      if (tabs.length > 3) {
        // Should have scroll indicators or be scrollable
        await expect(tabContainer).toHaveCSS('overflow-x', 'auto');
      }
    });
  });

  test.describe('Integration Between Tabs', () => {
    test('should update Files tab when file is created in Chat', async ({ page }) => {
      // Send a message to create a file
      await page.getByTestId('chat-input').fill('Create a new file called test.js');
      await page.getByTestId('send-message-button').click();
      
      // Wait for response
      await page.waitForSelector('[data-testid="assistant-message"]');
      
      // Switch to Files tab
      await page.getByTestId('tab-files').click();
      
      // New file should be visible
      await expect(page.getByTestId('file-item-test-js')).toBeVisible();
    });

    test('should reflect Git changes from Chat actions', async ({ page }) => {
      // Make a change via chat
      await page.getByTestId('chat-input').fill('Add a comment to README.md');
      await page.getByTestId('send-message-button').click();
      
      // Wait for completion
      await page.waitForSelector('[data-testid="tool-use-block"]');
      
      // Switch to Git tab
      await page.getByTestId('tab-git').click();
      
      // Should show uncommitted changes
      await expect(page.getByTestId('git-modified-files')).toBeVisible();
      await expect(page.getByTestId('git-file-readme')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle tab loading errors gracefully', async ({ page }) => {
      // Simulate network error
      await page.route('**/api/files', route => route.abort());
      
      // Try to load Files tab
      await page.getByTestId('tab-files').click();
      
      // Should show error message
      await expect(page.getByTestId('files-error-message')).toBeVisible();
      await expect(page.getByTestId('retry-files-button')).toBeVisible();
      
      // Clean up
      await page.unroute('**/api/files');
    });

    test('should handle session errors without breaking layout', async ({ page }) => {
      // Simulate session error
      await page.route('**/api/sessions/*', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      // Try to load a session
      await page.getByTestId('new-session-button').click();
      
      // Should show error but layout should remain intact
      await expect(page.getByTestId('session-error-message')).toBeVisible();
      
      // Other tabs should still work
      await page.getByTestId('tab-files').click();
      await expect(page.getByTestId('files-content')).toBeVisible();
      
      // Clean up
      await page.unroute('**/api/sessions/*');
    });
  });
});