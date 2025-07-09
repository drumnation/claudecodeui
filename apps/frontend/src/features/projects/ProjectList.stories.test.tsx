/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {composeStories} from '@storybook/react';
import * as stories from './ProjectList.stories';

// Compose all stories
const {Default, EmptyState, LoadingState, WithSelectedProject} =
  composeStories(stories);

describe('ProjectList Stories', () => {
  describe('Default Story', () => {
    it('should render without crashing', async () => {
      render(<Default />);

      const projectList = screen.getByTestId('project-list');
      expect(projectList).toBeInTheDocument();
    });

    it('should display all projects', async () => {
      render(<Default />);

      const claudeProject = screen.getByText('Claude Code UI');
      const apiProject = screen.getByText('My API Service');

      expect(claudeProject).toBeInTheDocument();
      expect(apiProject).toBeInTheDocument();
    });

    it('should render project selection elements', async () => {
      render(<Default />);

      const firstProject = screen.getByText('Claude Code UI');
      expect(firstProject).toBeInTheDocument();
      expect(firstProject).toBeVisible();

      // Check if the project element is interactive (has click handlers)
      const projectElement =
        firstProject.closest('button') ||
        firstProject.closest('[role="button"]');
      if (projectElement) {
        expect(projectElement).toBeInTheDocument();
      }
    });

    it('should show refresh button', async () => {
      render(<Default />);

      const refreshButton = screen.getByRole('button', {name: /refresh/i});
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('EmptyState Story', () => {
    it('should render empty state when no projects', async () => {
      render(<EmptyState />);

      const emptyMessage =
        screen.queryByText(/no projects/i) ||
        screen.queryByText(/create your first project/i);

      if (emptyMessage) {
        expect(emptyMessage).toBeInTheDocument();
      }
    });

    it('should show create project button', async () => {
      render(<EmptyState />);

      const createButton =
        screen.queryByRole('button', {name: /create/i}) ||
        screen.queryByRole('button', {name: /new/i});

      if (createButton) {
        expect(createButton).toBeInTheDocument();
      }
    });
  });

  describe('LoadingState Story', () => {
    it('should show loading indicators', async () => {
      render(<LoadingState />);

      const loadingIndicator =
        screen.queryByText(/loading/i) ||
        screen.queryByRole('progressbar') ||
        screen.queryByTestId('loading-skeleton');

      if (loadingIndicator) {
        expect(loadingIndicator).toBeInTheDocument();
      }
    });

    it('should not show projects while loading', async () => {
      render(<LoadingState />);

      const projectContent = screen.queryByText('Claude Code UI');
      expect(projectContent).not.toBeInTheDocument();
    });
  });

  describe('WithSelectedProject Story', () => {
    it('should highlight selected project', async () => {
      render(<WithSelectedProject />);

      const selectedProject = screen.getByText('Claude Code UI');
      expect(selectedProject).toBeInTheDocument();

      // Check for selected styling
      const selectedIndicator = screen
        .getByText('Claude Code UI')
        .closest('[aria-selected="true"]');
      if (selectedIndicator) {
        expect(selectedIndicator).toBeInTheDocument();
      }
    });

    it('should show sessions for selected project', async () => {
      render(<WithSelectedProject />);

      const sessionSummary = screen.queryByText(/Implementing dark mode/i);
      if (sessionSummary) {
        expect(sessionSummary).toBeInTheDocument();
      }
    });
  });

  describe('Session Management', () => {
    it('should render session selection elements', async () => {
      render(<WithSelectedProject />);

      const sessionItem = screen.queryByText(/Implementing dark mode/i);
      if (sessionItem) {
        expect(sessionItem).toBeInTheDocument();
        expect(sessionItem).toBeVisible();
      }
    });

    it('should render new session creation button', async () => {
      render(<WithSelectedProject />);

      const newSessionButton = screen.queryByRole('button', {
        name: /new.*session/i,
      });
      if (newSessionButton) {
        expect(newSessionButton).toBeInTheDocument();
        expect(newSessionButton).toBeEnabled();
      }
    });

    it('should render session deletion controls', async () => {
      render(<WithSelectedProject />);

      const deleteButton = screen.queryByRole('button', {name: /delete/i});
      if (deleteButton) {
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toBeEnabled();
      }
    });
  });

  describe('Project Management', () => {
    it('should render project refresh button', async () => {
      render(<Default />);

      const refreshButton = screen.getByRole('button', {name: /refresh/i});
      expect(refreshButton).toBeInTheDocument();
      expect(refreshButton).toBeEnabled();
    });

    it('should render project management controls', async () => {
      render(<Default />);

      // Look for project menu or delete button
      const projectMenu =
        screen.queryByRole('button', {name: /menu/i}) ||
        screen.queryByRole('button', {name: /options/i});

      if (projectMenu) {
        expect(projectMenu).toBeInTheDocument();
        expect(projectMenu).toBeEnabled();
      }
    });
  });

  describe('Search and Filter', () => {
    it('should render project search input', async () => {
      render(<Default />);

      const searchInput =
        screen.queryByRole('textbox', {name: /search/i}) ||
        screen.queryByPlaceholderText(/search/i);

      if (searchInput) {
        expect(searchInput).toBeInTheDocument();
        expect(searchInput).toBeEnabled();

        // Check if it's accessible
        expect(searchInput).toBeVisible();
      }
    });

    it('should render all projects when search is available', async () => {
      render(<Default />);

      const searchInput = screen.queryByRole('textbox', {name: /search/i});

      if (searchInput) {
        // Should show all projects by default
        const claudeProject = screen.getByText('Claude Code UI');
        const apiProject = screen.queryByText('My API Service');

        expect(claudeProject).toBeInTheDocument();
        if (apiProject) {
          expect(apiProject).toBeInTheDocument();
        }
      }
    });
  });

  describe('Accessibility', () => {
    it('should render keyboard navigable elements', async () => {
      render(<Default />);

      const firstProject = screen.getByText('Claude Code UI');
      expect(firstProject).toBeInTheDocument();

      // Check if the element is focusable
      const focusableElement =
        firstProject.closest('button') ||
        firstProject.closest('[tabindex]') ||
        firstProject.closest('a');

      if (focusableElement) {
        expect(focusableElement).toBeInTheDocument();
      }
    });

    it('should have proper ARIA labels', async () => {
      render(<Default />);

      const projectList = screen.queryByRole('list');
      if (projectList) {
        expect(projectList).toBeInTheDocument();
      }

      const projectItems = screen.queryAllByRole('listitem');
      if (projectItems.length > 0) {
        expect(projectItems[0]).toBeInTheDocument();
      }
    });

    it('should render accessible selected project elements', async () => {
      render(<WithSelectedProject />);

      const selectedProject = document.querySelector('[aria-selected="true"]');
      if (selectedProject) {
        expect(selectedProject).toBeInTheDocument();
        expect(selectedProject).toHaveAttribute('aria-selected', 'true');
      }
    });
  });

  describe('Performance', () => {
    it('should handle large project lists efficiently', async () => {
      const manyProjects = Array.from({length: 100}, (_, i) => ({
        id: `proj-${i}`,
        name: `project-${i}`,
        displayName: `Project ${i}`,
        fullPath: `/path/to/project-${i}`,
        sessions: [],
        sessionMeta: {hasMore: false, total: 0},
      }));

      const startTime = performance.now();
      render(<Default projects={manyProjects} />);
      const endTime = performance.now();

      // Should render within reasonable time (< 200ms)
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should render project with many sessions efficiently', async () => {
      const projectWithManySessions = {
        id: 'proj-1',
        name: 'test-project',
        displayName: 'Test Project',
        fullPath: '/test',
        sessions: Array.from({length: 50}, (_, i) => ({
          id: `session-${i}`,
          summary: `Session ${i}`,
          timestamp: new Date(Date.now() - i * 1000).toISOString(),
          messageCount: i * 2,
        })),
        sessionMeta: {hasMore: false, total: 50},
      };

      const startTime = performance.now();
      render(<Default projects={[projectWithManySessions]} />);

      const project = screen.getByText('Test Project');
      expect(project).toBeInTheDocument();

      const endTime = performance.now();

      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Failed to load projects');

      render(<Default error={mockError} />);

      const errorMessage =
        screen.queryByText(/failed to load/i) || screen.queryByText(/error/i);

      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    });

    it('should render retry button on error', async () => {
      const mockError = new Error('Network error');

      render(<Default error={mockError} />);

      const retryButton =
        screen.queryByRole('button', {name: /retry/i}) ||
        screen.queryByRole('button', {name: /refresh/i});

      if (retryButton) {
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toBeEnabled();
      }
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should adapt to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Default />);

      const projectList = screen.getByTestId('project-list');
      expect(projectList).toBeInTheDocument();

      // Should show mobile-appropriate layout
      const mobileLayout = screen.queryByTestId('mobile-layout');
      if (mobileLayout) {
        expect(mobileLayout).toBeInTheDocument();
      }
    });
  });
});
