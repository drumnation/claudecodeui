// Generated test for story: US_PROJECT_CREATE
import { test, expect } from '@playwright/test';

test('Project user can create a new project', async ({ page }) => {
  await page.goto('/');
  
  // Click create project button
  await page.getByTestId('create-project-button').click();
  
  // Fill in project details
  await page.getByTestId('project-name-input').fill('Test Project');
  
  // Submit form
  await page.getByTestId('create-project-submit').click();
  
  // Verify project appears in sidebar
  await expect(page.getByTestId('project-Test Project')).toBeVisible();
});
