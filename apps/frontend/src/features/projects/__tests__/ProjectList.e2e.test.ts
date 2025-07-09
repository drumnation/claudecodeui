import {test, expect} from '@playwright/test';

test.describe('ProjectList E2E Tests', () => {
  test.beforeEach(async ({page}) => {
    // Navigate to Storybook
    await page.goto('http://localhost:6006');

    // Wait for Storybook to load
    await page.waitForSelector('#storybook-root');
  });

  test('should display project list with projects', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Check that header is present
    await expect(
      page.locator('[data-testid="project-list-header"]'),
    ).toBeVisible();

    // Check that Claude logo is present
    await expect(page.locator('[data-testid="claude-logo"]')).toBeVisible();

    // Check that projects are displayed
    await expect(page.locator('[data-testid="project-item"]')).toHaveCount(3);

    // Check that project names are displayed
    await expect(page.locator('text=Claude Code UI')).toBeVisible();
    await expect(page.locator('text=My API Service')).toBeVisible();
    await expect(page.locator('text=Empty Project')).toBeVisible();
  });

  test('should display loading state', async ({page}) => {
    // Navigate to Loading story
    await page.click('[data-item-id="features-projects--loading"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Check that loading indicator is shown
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible();
    await expect(page.locator('text=Loading projects...')).toBeVisible();

    // Check that loading spinner is present
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test('should display empty state', async ({page}) => {
    // Navigate to Empty story
    await page.click('[data-item-id="features-projects--empty"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Check that empty state is shown
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('text=No projects found')).toBeVisible();

    // Check that empty state instructions are shown
    await expect(
      page.locator('text=Run Claude CLI in a project directory'),
    ).toBeVisible();
  });

  test('should handle project selection', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Click on a project
    const firstProject = page.locator('[data-testid="project-item"]').first();
    await firstProject.click();

    // Check that project is selected (selected project should have different styling)
    await expect(firstProject).toHaveClass(/selected/);

    // Check that sessions are displayed when project is expanded
    await expect(page.locator('[data-testid="session-list"]')).toBeVisible();
  });

  test('should handle session selection', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Click on a project to expand it
    const firstProject = page.locator('[data-testid="project-item"]').first();
    await firstProject.click();

    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', {timeout: 5000});

    // Click on a session
    const firstSession = page.locator('[data-testid="session-item"]').first();
    await firstSession.click();

    // Check that session is selected
    await expect(firstSession).toHaveClass(/selected/);

    // Check that session details are shown
    await expect(page.locator('[data-testid="session-summary"]')).toBeVisible();
  });

  test('should handle refresh functionality', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Click refresh button
    const refreshButton = page.locator('[data-testid="refresh-button"]');
    await refreshButton.click();

    // Check that refresh button shows loading state
    await expect(refreshButton).toHaveClass(/loading/);
  });

  test('should handle new project creation', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Click new project button
    const newProjectButton = page.locator('[data-testid="new-project-button"]');
    await newProjectButton.click();

    // Check that new project modal is shown
    await expect(
      page.locator('[data-testid="new-project-modal"]'),
    ).toBeVisible();

    // Fill in project details
    const projectPathInput = page.locator('[data-testid="project-path-input"]');
    await projectPathInput.fill('/test/new-project');

    // Click create button
    const createButton = page.locator('[data-testid="create-project-button"]');
    await createButton.click();

    // Modal should close
    await expect(
      page.locator('[data-testid="new-project-modal"]'),
    ).not.toBeVisible();
  });

  test('should handle project actions menu', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Hover over project to show actions
    const firstProject = page.locator('[data-testid="project-item"]').first();
    await firstProject.hover();

    // Check that actions menu is shown
    await expect(page.locator('[data-testid="project-actions"]')).toBeVisible();

    // Click on actions menu
    const actionsButton = page.locator(
      '[data-testid="project-actions-button"]',
    );
    await actionsButton.click();

    // Check that dropdown menu is shown
    await expect(
      page.locator('[data-testid="project-actions-menu"]'),
    ).toBeVisible();

    // Check that actions are available
    await expect(
      page.locator('[data-testid="rename-project-action"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="delete-project-action"]'),
    ).toBeVisible();
  });

  test('should handle session actions', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Expand project
    const firstProject = page.locator('[data-testid="project-item"]').first();
    await firstProject.click();

    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', {timeout: 5000});

    // Hover over session to show actions
    const firstSession = page.locator('[data-testid="session-item"]').first();
    await firstSession.hover();

    // Check that session actions are shown
    await expect(page.locator('[data-testid="session-actions"]')).toBeVisible();

    // Click on session actions
    const sessionActionsButton = page.locator(
      '[data-testid="session-actions-button"]',
    );
    await sessionActionsButton.click();

    // Check that session actions menu is shown
    await expect(
      page.locator('[data-testid="session-actions-menu"]'),
    ).toBeVisible();

    // Check that actions are available
    await expect(
      page.locator('[data-testid="delete-session-action"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="rename-session-action"]'),
    ).toBeVisible();
  });

  test('should handle search functionality', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Check if search input is present
    const searchInput = page.locator('[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      // Type in search
      await searchInput.fill('Claude');

      // Check that results are filtered
      await expect(page.locator('[data-testid="project-item"]')).toHaveCount(1);
      await expect(page.locator('text=Claude Code UI')).toBeVisible();

      // Clear search
      await searchInput.clear();

      // Check that all projects are shown again
      await expect(page.locator('[data-testid="project-item"]')).toHaveCount(3);
    }
  });

  test('should be responsive on mobile', async ({page}) => {
    // Set mobile viewport
    await page.setViewportSize({width: 375, height: 667});

    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Check that mobile layout is applied
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();

    // Check that mobile navigation works
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
  });

  test('should handle settings button', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Click settings button
    const settingsButton = page.locator('[data-testid="settings-button"]');
    await settingsButton.click();

    // Check that settings action is triggered (in real app, this would open settings)
    // For now, we just check that the button is clickable
    await expect(settingsButton).toBeEnabled();
  });

  test('should handle keyboard navigation', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Focus on first project
    const firstProject = page.locator('[data-testid="project-item"]').first();
    await firstProject.focus();

    // Press Enter to select project
    await firstProject.press('Enter');

    // Check that project is selected
    await expect(firstProject).toHaveClass(/selected/);

    // Use arrow keys to navigate
    await firstProject.press('ArrowDown');

    // Check that focus moved to next project
    const secondProject = page.locator('[data-testid="project-item"]').nth(1);
    await expect(secondProject).toBeFocused();
  });

  test('should handle theme switching', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Check that theme toggle is present
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Check that theme is switched
      const body = page.locator('body');
      await expect(body).toHaveClass(/dark/);
    }
  });

  test('should handle load more sessions', async ({page}) => {
    // Navigate to Default story
    await page.click('[data-item-id="features-projects--default"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Expand project
    const firstProject = page.locator('[data-testid="project-item"]').first();
    await firstProject.click();

    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', {timeout: 5000});

    // Check if load more button is present
    const loadMoreButton = page.locator('[data-testid="load-more-sessions"]');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();

      // Check that more sessions are loaded
      await expect(page.locator('[data-testid="session-item"]')).toHaveCount(3);
    }
  });

  test('should handle active sessions indicator', async ({page}) => {
    // Navigate to WithActiveSession story
    await page.click('[data-item-id="features-projects--with-active-session"]');

    // Wait for story to load
    await page.waitForSelector('[data-testid="project-list"]', {
      timeout: 10000,
    });

    // Check that active session indicator is shown
    await expect(
      page.locator('[data-testid="active-session-indicator"]'),
    ).toBeVisible();

    // Check that active session has different styling
    const activeSession = page.locator(
      '[data-testid="session-item"][data-active="true"]',
    );
    await expect(activeSession).toHaveClass(/active/);
  });
});
