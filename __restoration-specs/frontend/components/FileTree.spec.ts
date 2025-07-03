import { test, expect } from '@playwright/test';

/**
 * Restoration Test Spec: FileTree
 * Verifies all functionality from the original FileTree component is preserved
 * Target: apps/frontend/src/features/files/components/FileTree/FileTree.tsx
 */

test.describe('FileTree Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8766');
    await page.waitForLoadState('networkidle');
    
    // Navigate to a project and open Files tab
    await page.getByTestId('project-item').first().click();
    await page.getByTestId('tab-files').click();
  });

  test.describe('File Navigation', () => {
    test('should display root directory contents', async ({ page }) => {
      // Wait for file tree to load
      await page.waitForSelector('[data-testid="file-tree"]');
      
      // Should show files and directories
      const fileCount = await page.getByTestId('file-item').count();
      const dirCount = await page.getByTestId('directory-item').count();
      
      expect(fileCount + dirCount).toBeGreaterThan(0);
    });

    test('should navigate through directories', async ({ page }) => {
      // Click on a directory
      const srcDir = page.getByTestId('directory-item-src');
      await srcDir.click();
      
      // Should show loading state briefly
      await page.waitForSelector('[data-testid="directory-loading"]', { state: 'hidden' });
      
      // Should update breadcrumb
      await expect(page.getByTestId('breadcrumb')).toContainText('src');
      
      // Should show directory contents
      const filesInSrc = await page.getByTestId('file-item').count();
      expect(filesInSrc).toBeGreaterThan(0);
    });

    test('should handle navigation breadcrumbs', async ({ page }) => {
      // Navigate deep into directories
      await page.getByTestId('directory-item-src').click();
      await page.getByTestId('directory-item-components').click();
      
      // Breadcrumb should show full path
      const breadcrumb = page.getByTestId('breadcrumb');
      await expect(breadcrumb).toContainText('src');
      await expect(breadcrumb).toContainText('components');
      
      // Click on breadcrumb to navigate back
      await breadcrumb.getByText('src').click();
      
      // Should be back in src directory
      await expect(page.getByTestId('current-directory')).toContainText('src');
    });

    test('should handle back navigation', async ({ page }) => {
      // Navigate into a directory
      await page.getByTestId('directory-item-src').click();
      
      // Use back button
      await page.getByTestId('back-button').click();
      
      // Should be back at root
      await expect(page.getByTestId('current-directory')).toContainText('root');
    });
  });

  test.describe('Directory Expansion/Collapse', () => {
    test('should expand and collapse directories in tree view', async ({ page }) => {
      // Switch to tree view if not already
      await page.getByTestId('view-mode-tree').click();
      
      const directory = page.getByTestId('tree-directory-src');
      
      // Should be collapsed initially
      await expect(directory.getByTestId('tree-children')).not.toBeVisible();
      
      // Expand
      await directory.getByTestId('expand-arrow').click();
      await expect(directory.getByTestId('tree-children')).toBeVisible();
      
      // Should show child items
      const childCount = await directory.getByTestId('[data-testid^="tree-item-"]').count();
      expect(childCount).toBeGreaterThan(0);
      
      // Collapse
      await directory.getByTestId('collapse-arrow').click();
      await expect(directory.getByTestId('tree-children')).not.toBeVisible();
    });

    test('should maintain expansion state during navigation', async ({ page }) => {
      await page.getByTestId('view-mode-tree').click();
      
      // Expand multiple directories
      await page.getByTestId('tree-directory-src').getByTestId('expand-arrow').click();
      await page.getByTestId('tree-directory-public').getByTestId('expand-arrow').click();
      
      // Navigate to a different tab
      await page.getByTestId('tab-chat').click();
      
      // Come back
      await page.getByTestId('tab-files').click();
      
      // Expansion state should be preserved
      await expect(page.getByTestId('tree-directory-src').getByTestId('tree-children')).toBeVisible();
      await expect(page.getByTestId('tree-directory-public').getByTestId('tree-children')).toBeVisible();
    });
  });

  test.describe('File Selection', () => {
    test('should select files on click', async ({ page }) => {
      const file = page.getByTestId('file-item-readme');
      
      // Click to select
      await file.click();
      
      // Should be highlighted
      await expect(file).toHaveAttribute('data-selected', 'true');
      
      // Should open file preview/editor
      await expect(page.getByTestId('file-preview')).toBeVisible();
      await expect(page.getByTestId('file-preview-name')).toContainText('README');
    });

    test('should handle multiple file selection', async ({ page }) => {
      // Select first file
      await page.getByTestId('file-item-readme').click();
      
      // Ctrl+click to select another
      await page.getByTestId('file-item-package').click({ modifiers: ['Control'] });
      
      // Both should be selected
      await expect(page.getByTestId('file-item-readme')).toHaveAttribute('data-selected', 'true');
      await expect(page.getByTestId('file-item-package')).toHaveAttribute('data-selected', 'true');
      
      // Should show multi-select actions
      await expect(page.getByTestId('selected-count')).toContainText('2 files selected');
    });
  });

  test.describe('Image Detection and Viewing', () => {
    test('should detect and display image files differently', async ({ page }) => {
      // Navigate to a directory with images
      await page.getByTestId('directory-item-assets').click();
      
      // Image files should have special indicator
      const imageFile = page.getByTestId('file-item-logo-png');
      await expect(imageFile.getByTestId('image-icon')).toBeVisible();
      
      // Click on image
      await imageFile.click();
      
      // Should open image viewer, not text editor
      await expect(page.getByTestId('image-viewer')).toBeVisible();
      await expect(page.getByTestId('code-editor')).not.toBeVisible();
    });

    test('should show image preview on hover', async ({ page }) => {
      await page.getByTestId('directory-item-assets').click();
      
      const imageFile = page.getByTestId('file-item-banner-jpg');
      
      // Hover over image file
      await imageFile.hover();
      
      // Should show preview tooltip
      await expect(page.getByTestId('image-preview-tooltip')).toBeVisible();
    });
  });

  test.describe('Code Editor Integration', () => {
    test('should open code files in editor', async ({ page }) => {
      // Click on a code file
      await page.getByTestId('file-item-index-js').click();
      
      // Should open in code editor
      await expect(page.getByTestId('code-editor')).toBeVisible();
      await expect(page.getByTestId('editor-language')).toContainText('javascript');
      
      // Should show syntax highlighting
      await expect(page.locator('.token.keyword')).toBeVisible();
    });

    test('should handle different file types', async ({ page }) => {
      // Test various file types
      const fileTests = [
        { file: 'style.css', language: 'css' },
        { file: 'index.html', language: 'html' },
        { file: 'config.json', language: 'json' },
        { file: 'README.md', language: 'markdown' },
      ];
      
      for (const { file, language } of fileTests) {
        await page.getByTestId(`file-item-${file.replace('.', '-')}`).click();
        await expect(page.getByTestId('editor-language')).toContainText(language);
        
        // Close editor
        await page.getByTestId('close-editor').click();
      }
    });
  });

  test.describe('Search and Filter', () => {
    test('should filter files by search term', async ({ page }) => {
      const searchInput = page.getByTestId('file-search');
      
      // Get initial count
      const initialCount = await page.getByTestId('[data-testid^="file-item-"]').count();
      
      // Search for specific files
      await searchInput.fill('test');
      await page.waitForTimeout(300); // Debounce
      
      // Should show only matching files
      const filteredCount = await page.getByTestId('[data-testid^="file-item-"]').count();
      expect(filteredCount).toBeLessThan(initialCount);
      
      // All visible files should contain 'test'
      const visibleFiles = await page.getByTestId('[data-testid^="file-item-"]').all();
      for (const file of visibleFiles) {
        const fileName = await file.textContent();
        expect(fileName?.toLowerCase()).toContain('test');
      }
    });

    test('should search within subdirectories', async ({ page }) => {
      await page.getByTestId('search-recursive-checkbox').check();
      await page.getByTestId('file-search').fill('component');
      
      // Should find files in subdirectories
      await expect(page.getByTestId('search-result-count')).toContainText(/\d+ results? in \d+ directories?/);
      
      // Results should show full path
      const results = await page.getByTestId('search-result').all();
      for (const result of results) {
        await expect(result.getByTestId('file-path')).toBeVisible();
      }
    });
  });

  test.describe('File Operations', () => {
    test('should show context menu on right-click', async ({ page }) => {
      const file = page.getByTestId('file-item-readme');
      
      // Right-click
      await file.click({ button: 'right' });
      
      // Context menu should appear
      await expect(page.getByTestId('file-context-menu')).toBeVisible();
      
      // Should have file operations
      await expect(page.getByTestId('menu-rename')).toBeVisible();
      await expect(page.getByTestId('menu-delete')).toBeVisible();
      await expect(page.getByTestId('menu-copy-path')).toBeVisible();
    });

    test('should handle file renaming', async ({ page }) => {
      const file = page.getByTestId('file-item-test');
      
      // Open context menu and rename
      await file.click({ button: 'right' });
      await page.getByTestId('menu-rename').click();
      
      // Inline rename input should appear
      const renameInput = page.getByTestId('rename-input');
      await expect(renameInput).toBeVisible();
      await expect(renameInput).toBeFocused();
      
      // Rename file
      await renameInput.clear();
      await renameInput.fill('renamed-file.js');
      await renameInput.press('Enter');
      
      // File should be renamed
      await expect(page.getByTestId('file-item-renamed-file')).toBeVisible();
      await expect(page.getByTestId('file-item-test')).not.toBeVisible();
    });
  });

  test.describe('View Modes', () => {
    test('should switch between list and tree view', async ({ page }) => {
      // Default should be list view
      await expect(page.getByTestId('view-mode-list')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByTestId('file-list-view')).toBeVisible();
      
      // Switch to tree view
      await page.getByTestId('view-mode-tree').click();
      await expect(page.getByTestId('view-mode-tree')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByTestId('file-tree-view')).toBeVisible();
      
      // Tree view should show hierarchy
      await expect(page.getByTestId('tree-indent-guide')).toBeVisible();
    });

    test('should persist view mode preference', async ({ page }) => {
      // Switch to tree view
      await page.getByTestId('view-mode-tree').click();
      
      // Navigate away and back
      await page.getByTestId('tab-chat').click();
      await page.getByTestId('tab-files').click();
      
      // Should still be in tree view
      await expect(page.getByTestId('view-mode-tree')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByTestId('file-tree-view')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle directory access errors', async ({ page }) => {
      // Try to access a restricted directory
      await page.getByTestId('directory-item-system').click();
      
      // Should show error message
      await expect(page.getByTestId('access-error')).toBeVisible();
      await expect(page.getByTestId('access-error')).toContainText('Permission denied');
    });

    test('should handle file loading errors', async ({ page }) => {
      // Simulate network error
      await page.route('**/api/files/content/*', route => route.abort());
      
      // Try to open a file
      await page.getByTestId('file-item-large').click();
      
      // Should show error state
      await expect(page.getByTestId('file-load-error')).toBeVisible();
      await expect(page.getByTestId('retry-load-button')).toBeVisible();
      
      // Clean up
      await page.unroute('**/api/files/content/*');
    });
  });
});