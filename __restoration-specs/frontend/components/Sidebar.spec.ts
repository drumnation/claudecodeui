import { test, expect } from '@playwright/test';

/**
 * Restoration Test Spec: Sidebar
 * Verifies all functionality from the original Sidebar component is preserved
 * Based on: apps/frontend/src/original-components/Sidebar.original.jsx
 * Target: apps/frontend/src/features/projects/components/Sidebar/Sidebar.tsx
 */

test.describe('Sidebar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8766');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Project Management', () => {
    test('should display list of projects', async ({ page }) => {
      // Wait for projects to load
      await page.waitForSelector('[data-testid="project-item"]');
      
      // Verify project items are displayed
      const projectCount = await page.getByTestId('project-item').count();
      expect(projectCount).toBeGreaterThan(0);
      
      // Verify project information is shown
      const firstProject = page.getByTestId('project-item').first();
      await expect(firstProject.getByTestId('project-name')).toBeVisible();
      await expect(firstProject.getByTestId('project-path')).toBeVisible();
    });

    test('should handle project expansion/collapse', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      
      // Initially collapsed
      await expect(project.getByTestId('session-list')).not.toBeVisible();
      
      // Click to expand
      await project.getByTestId('expand-project').click();
      await expect(project.getByTestId('session-list')).toBeVisible();
      
      // Click to collapse
      await project.getByTestId('collapse-project').click();
      await expect(project.getByTestId('session-list')).not.toBeVisible();
    });

    test('should handle new project creation', async ({ page }) => {
      const initialCount = await page.getByTestId('project-item').count();
      
      // Click new project button
      await page.getByTestId('new-project-button').click();
      
      // In test environment, this would mock the file dialog
      // Wait for the new project to appear
      await page.waitForFunction(
        (count) => document.querySelectorAll('[data-testid="project-item"]').length > count,
        initialCount
      );
      
      const newCount = await page.getByTestId('project-item').count();
      expect(newCount).toBe(initialCount + 1);
    });

    test('should handle project deletion', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      const projectName = await project.getByTestId('project-name').textContent();
      
      // Open project menu
      await project.getByTestId('project-menu-button').click();
      await page.getByTestId('delete-project-option').click();
      
      // Confirm deletion
      await page.getByTestId('confirm-delete-button').click();
      
      // Verify project is removed
      await expect(page.getByTestId('project-name').getByText(projectName!)).not.toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should load sessions when project is expanded', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      
      // Expand project
      await project.getByTestId('expand-project').click();
      
      // Wait for sessions to load
      await page.waitForSelector('[data-testid="session-item"]');
      
      // Verify sessions are displayed
      const sessionCount = await project.getByTestId('session-item').count();
      expect(sessionCount).toBeGreaterThan(0);
    });

    test('should display session information correctly', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      await project.getByTestId('expand-project').click();
      
      const session = project.getByTestId('session-item').first();
      
      // Verify session details
      await expect(session.getByTestId('session-summary')).toBeVisible();
      await expect(session.getByTestId('session-time')).toBeVisible();
      await expect(session.getByTestId('message-count')).toBeVisible();
    });

    test('should handle session pagination', async ({ page }) => {
      // Find a project with many sessions
      const project = page.getByTestId('project-item-many-sessions');
      await project.getByTestId('expand-project').click();
      
      // Initial load should show first batch
      const initialSessions = await project.getByTestId('session-item').count();
      expect(initialSessions).toBe(5); // Default pagination
      
      // Load more sessions
      await project.getByTestId('load-more-sessions').click();
      
      // Wait for additional sessions
      await page.waitForFunction(
        (count) => document.querySelectorAll('[data-testid="session-item"]').length > count,
        initialSessions
      );
      
      const updatedSessions = await project.getByTestId('session-item').count();
      expect(updatedSessions).toBeGreaterThan(initialSessions);
    });

    test('should handle session deletion', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      await project.getByTestId('expand-project').click();
      
      const session = project.getByTestId('session-item').first();
      const sessionSummary = await session.getByTestId('session-summary').textContent();
      
      // Delete session
      await session.getByTestId('delete-session-button').click();
      await page.getByTestId('confirm-delete-button').click();
      
      // Verify session is removed
      await expect(page.getByText(sessionSummary!)).not.toBeVisible();
    });
  });

  test.describe('Summary Editing', () => {
    test('should enable summary editing on click', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      await project.getByTestId('expand-project').click();
      
      const session = project.getByTestId('session-item').first();
      const summary = session.getByTestId('session-summary');
      
      // Click to edit
      await summary.click();
      
      // Input should appear
      const input = session.getByTestId('summary-input');
      await expect(input).toBeVisible();
      await expect(input).toBeFocused();
    });

    test('should save edited summary', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      await project.getByTestId('expand-project').click();
      
      const session = project.getByTestId('session-item').first();
      const summary = session.getByTestId('session-summary');
      
      // Start editing
      await summary.click();
      const input = session.getByTestId('summary-input');
      
      // Edit summary
      await input.clear();
      await input.fill('Updated summary text');
      await input.press('Enter');
      
      // Verify summary is updated
      await expect(summary).toContainText('Updated summary text');
    });

    test('should cancel editing on Escape', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      await project.getByTestId('expand-project').click();
      
      const session = project.getByTestId('session-item').first();
      const summary = session.getByTestId('session-summary');
      const originalText = await summary.textContent();
      
      // Start editing
      await summary.click();
      const input = session.getByTestId('summary-input');
      
      // Type new text and cancel
      await input.clear();
      await input.fill('Cancelled text');
      await input.press('Escape');
      
      // Verify original text is preserved
      await expect(summary).toContainText(originalText!);
    });
  });

  test.describe('Project Name Editing', () => {
    test('should allow editing custom project names', async ({ page }) => {
      const project = page.getByTestId('project-item-custom-name');
      const projectName = project.getByTestId('project-name');
      
      // Verify edit button is visible for custom names
      await expect(project.getByTestId('edit-name-button')).toBeVisible();
      
      // Click to edit
      await project.getByTestId('edit-name-button').click();
      
      // Input should appear
      const input = project.getByTestId('project-name-input');
      await expect(input).toBeVisible();
      
      // Edit name
      await input.clear();
      await input.fill('New Project Name');
      await input.press('Enter');
      
      // Verify name is updated
      await expect(projectName).toContainText('New Project Name');
    });

    test('should not show edit button for non-custom names', async ({ page }) => {
      const project = page.getByTestId('project-item-package-json');
      
      // Edit button should not be visible
      await expect(project.getByTestId('edit-name-button')).not.toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should show mobile navigation', async ({ page }) => {
      // Mobile nav should be visible
      await expect(page.getByTestId('mobile-nav')).toBeVisible();
      
      // Sidebar should be hidden initially
      await expect(page.getByTestId('sidebar')).not.toBeVisible();
      
      // Open sidebar
      await page.getByTestId('mobile-menu-button').click();
      await expect(page.getByTestId('sidebar')).toBeVisible();
      
      // Should have overlay
      await expect(page.getByTestId('sidebar-overlay')).toBeVisible();
      
      // Close on overlay click
      await page.getByTestId('sidebar-overlay').click();
      await expect(page.getByTestId('sidebar')).not.toBeVisible();
    });

    test('should close sidebar on project selection (mobile)', async ({ page }) => {
      // Open sidebar
      await page.getByTestId('mobile-menu-button').click();
      
      // Select a project
      await page.getByTestId('project-item').first().click();
      
      // Sidebar should close automatically
      await expect(page.getByTestId('sidebar')).not.toBeVisible();
    });
  });

  test.describe('Search and Filtering', () => {
    test('should filter projects by search term', async ({ page }) => {
      const searchInput = page.getByTestId('project-search');
      
      // Get initial count
      const initialCount = await page.getByTestId('project-item').count();
      
      // Search for specific project
      await searchInput.fill('test');
      
      // Wait for filtering
      await page.waitForTimeout(300);
      
      // Verify filtered results
      const filteredCount = await page.getByTestId('project-item').count();
      expect(filteredCount).toBeLessThan(initialCount);
      
      // All visible projects should contain 'test'
      const visibleProjects = await page.getByTestId('project-name').allTextContents();
      visibleProjects.forEach(name => {
        expect(name.toLowerCase()).toContain('test');
      });
    });

    test('should show no results message', async ({ page }) => {
      const searchInput = page.getByTestId('project-search');
      
      // Search for non-existent project
      await searchInput.fill('xyz123nonexistent');
      await page.waitForTimeout(300);
      
      // Should show no results message
      await expect(page.getByTestId('no-projects-found')).toBeVisible();
    });
  });

  test.describe('Summary Generation', () => {
    test('should show generate summary button for sessions without summary', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      await project.getByTestId('expand-project').click();
      
      // Find session without summary
      const sessionWithoutSummary = page.getByTestId('session-item-no-summary').first();
      
      // Generate button should be visible
      await expect(sessionWithoutSummary.getByTestId('generate-summary-button')).toBeVisible();
    });

    test('should generate summary on button click', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      await project.getByTestId('expand-project').click();
      
      const session = page.getByTestId('session-item-no-summary').first();
      
      // Click generate
      await session.getByTestId('generate-summary-button').click();
      
      // Wait for summary generation
      await page.waitForSelector('[data-testid="generating-summary-spinner"]');
      await page.waitForSelector('[data-testid="session-summary"]', { timeout: 10000 });
      
      // Summary should now be visible
      await expect(session.getByTestId('session-summary')).toBeVisible();
      await expect(session.getByTestId('session-summary')).not.toBeEmpty();
    });
  });

  test.describe('Time Formatting', () => {
    test('should display relative time for recent sessions', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      await project.getByTestId('expand-project').click();
      
      // Recent session should show relative time
      const recentSession = page.getByTestId('session-item-recent').first();
      const timeText = await recentSession.getByTestId('session-time').textContent();
      
      expect(timeText).toMatch(/(\d+ minutes? ago|\d+ hours? ago|just now)/);
    });

    test('should display date for older sessions', async ({ page }) => {
      const project = page.getByTestId('project-item').first();
      await project.getByTestId('expand-project').click();
      
      // Older session should show date
      const oldSession = page.getByTestId('session-item-old').first();
      const timeText = await oldSession.getByTestId('session-time').textContent();
      
      expect(timeText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });
});