import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Performance Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('page load performance', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('/');
    await helpers.waitForAppReady();
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = entries.reduce((acc, entry) => {
            if (entry.name === 'first-contentful-paint') {
              acc.fcp = entry.startTime;
            }
            return acc;
          }, {} as any);
          resolve(vitals);
        }).observe({ entryTypes: ['paint'] });
      });
    });
    
    console.log('Performance metrics:', metrics);
  });

  test('large dataset rendering performance', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForAppReady();
    
    // If there are many projects, measure rendering time
    const projectCount = await page.locator('[data-testid="project-item"]').count();
    
    if (projectCount > 10) {
      const startTime = Date.now();
      await page.locator('[data-testid="project-list"]').scrollIntoView();
      const renderTime = Date.now() - startTime;
      
      // Should render large lists efficiently
      expect(renderTime).toBeLessThan(3000); // 3 seconds max
    }
  });

  test('memory usage during interaction', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForAppReady();
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Perform typical user interactions
    if (await helpers.elementExists('[data-testid="project-item"]')) {
      for (let i = 0; i < 5; i++) {
        await page.locator('[data-testid="project-item"]').first().click();
        await page.waitForTimeout(500);
      }
    }
    
    // Check memory after interactions
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory shouldn't grow excessively
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB max growth
    }
  });

  test('network request optimization', async ({ page }) => {
    // Track network requests
    const requests: string[] = [];
    page.on('request', request => {
      requests.push(request.url());
    });
    
    await page.goto('/');
    await helpers.waitForAppReady();
    
    // Count API requests
    const apiRequests = requests.filter(url => url.includes('/api/'));
    
    // Should not make excessive API requests
    expect(apiRequests.length).toBeLessThan(10);
    
    // Check for duplicate requests
    const uniqueRequests = new Set(apiRequests);
    expect(uniqueRequests.size).toBe(apiRequests.length);
  });
});