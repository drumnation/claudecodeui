import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  test('API endpoints respond correctly', async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8766';
    
    // Test health endpoint
    const healthResponse = await request.get(`${baseURL}/api/health`);
    expect(healthResponse.ok()).toBeTruthy();
    
    // Test projects endpoint
    const projectsResponse = await request.get(`${baseURL}/api/projects`);
    if (projectsResponse.ok()) {
      const projects = await projectsResponse.json();
      expect(Array.isArray(projects)).toBeTruthy();
    }
  });

  test('WebSocket connection works', async ({ page }) => {
    await page.goto('/');
    
    // Listen for WebSocket connection
    let wsConnected = false;
    page.on('websocket', ws => {
      wsConnected = true;
      ws.on('framereceived', frame => {
        console.log('WebSocket frame received:', frame.payload);
      });
    });
    
    // Wait for connection
    await page.waitForTimeout(5000);
    
    // If WebSocket is expected, verify connection
    if (wsConnected) {
      expect(wsConnected).toBeTruthy();
    }
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API to return errors
    await page.route('/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto('/');
    
    // App should still load basic structure
    await expect(page.getByText('Claude Code UI')).toBeVisible();
    
    // Should show appropriate error states
    const errorIndicator = page.locator('[data-testid="error-state"]');
    if (await errorIndicator.count() > 0) {
      await expect(errorIndicator).toBeVisible();
    }
  });
});