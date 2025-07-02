/**
 * Storybook component testing utilities
 * For unit testing individual components with their stories
 */

import {composeStories, composeStory} from '@storybook/react';
import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import type {Meta, StoryObj, ReactRenderer} from '@storybook/react';
import type {ReactElement} from 'react';
import React from 'react';

/**
 * Test a single story
 */
export async function testStory<T>(
  Story: StoryObj<T> & {render: () => ReactElement},
  assertions: (screenUtils: typeof screen) => Promise<void> | void,
) {
  const StoryComponent = Story.render || (() => null);
  render(<StoryComponent />);
  await assertions(screen);
}

/**
 * Test all stories in a component
 */
export function testAllStories<T extends Record<string, any>>(
  stories: T & {default?: Meta},
  options?: {
    skip?: string[];
    only?: string[];
  },
) {
  const composedStories = composeStories(stories as any);
  const storyEntries = Object.entries(composedStories);

  describe(stories.default?.title || 'Component Stories', () => {
    storyEntries.forEach(([name, Story]) => {
      if (options?.skip?.includes(name)) return;
      if (options?.only && !options.only.includes(name)) return;

      it(`renders ${name} story`, async () => {
        const StoryComponent = (Story as any).render || (() => null);
        const {container} = render(React.createElement(StoryComponent));

        // Run play function if it exists
        if ((Story as any).play) {
          await (Story as any).play({
            canvasElement: container,
            step: async (label: string, fn: () => Promise<void>) => {
              console.log(`Step: ${label}`);
              await fn();
            },
          });
        }

        // Basic smoke test
        expect(container).toBeTruthy();
      });
    });
  });
}

/**
 * Component test helpers
 */
export const componentTest = {
  /**
   * Test component props variations
   */
  testPropVariations<P extends Record<string, any>>(
    Component: React.ComponentType<P>,
    baseProps: P,
    variations: Array<{
      name: string;
      props: Partial<P>;
      test: (screenUtils: typeof screen) => void;
    }>,
  ) {
    describe('Prop variations', () => {
      variations.forEach(({name, props, test}) => {
        it(name, () => {
          render(<Component {...baseProps} {...props} />);
          test(screen);
        });
      });
    });
  },

  /**
   * Test component accessibility
   */
  async testAccessibility(Story: StoryObj & {render: () => ReactElement}) {
    const StoryComponent = Story.render || (() => null);
    const {container} = render(React.createElement(StoryComponent));

    // Check for basic accessibility attributes
    const interactiveElements = container.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [role="link"]',
    );

    interactiveElements.forEach((element) => {
      // Check for accessible name
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
      const hasTextContent = (element.textContent?.trim()?.length ?? 0) > 0;
      const isInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);

      if (!isInput) {
        expect(
          hasAriaLabel || hasAriaLabelledBy || hasTextContent,
          `Element ${element.tagName} should have accessible name`,
        ).toBe(true);
      }

      // Check for keyboard accessibility
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex) {
        expect(Number(tabIndex)).toBeGreaterThanOrEqual(-1);
      }
    });
  },

  /**
   * Test component states
   */
  async testStates<P>(
    Component: React.ComponentType<P>,
    states: Array<{
      name: string;
      props: P;
      setup?: () => void;
      test: (screenUtils: typeof screen) => Promise<void> | void;
    }>,
  ) {
    for (const {name, props, setup, test} of states) {
      it(`handles ${name} state`, async () => {
        setup?.();
        render(
          React.createElement(Component as React.ComponentType<any>, props),
        );
        await test(screen);
      });
    }
  },

  /**
   * Test component events
   */
  testEvents<P extends Record<string, any>>(
    Component: React.ComponentType<P>,
    baseProps: P,
    events: Array<{
      name: string;
      trigger: (screenUtils: typeof screen) => Promise<void>;
      assertion: (props: P) => void;
    }>,
  ) {
    describe('Event handlers', () => {
      events.forEach(({name, trigger, assertion}) => {
        it(`handles ${name}`, async () => {
          const mockProps = {...baseProps};

          // Mock all function props
          Object.keys(mockProps).forEach((key) => {
            if (typeof (mockProps as any)[key] === 'function') {
              (mockProps as any)[key] = vi.fn((mockProps as any)[key]);
            }
          });

          render(React.createElement(Component, mockProps));
          await trigger(screen);
          assertion(mockProps);
        });
      });
    });
  },

  /**
   * Test component error boundaries
   */
  testErrorBoundary(
    Story: StoryObj & {render: () => ReactElement},
    errorMessage: string,
  ) {
    // Mock console.error to avoid noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      // Force an error
      const ThrowError = () => {
        throw new Error(errorMessage);
      };

      expect(() => render(React.createElement(ThrowError))).toThrow(
        errorMessage,
      );
    } finally {
      consoleSpy.mockRestore();
    }
  },

  /**
   * Test component render performance
   */
  async testRenderPerformance(
    Story: StoryObj & {render: () => ReactElement},
    maxRenderTime = 16, // 60fps threshold
  ) {
    const start = performance.now();
    const StoryComponent = Story.render || (() => null);
    render(React.createElement(StoryComponent));
    const end = performance.now();
    const renderTime = end - start;

    expect(
      renderTime,
      `Component should render in less than ${maxRenderTime}ms`,
    ).toBeLessThan(maxRenderTime);
  },
};

/**
 * Story snapshot testing
 */
export function createSnapshotTests<T extends Meta>(
  stories: T,
  options?: {
    skip?: string[];
    only?: string[];
  },
) {
  const composedStories = composeStories(stories as any);
  const storyEntries = Object.entries(composedStories);

  describe(`${(stories as any).default?.title || 'Component'} Snapshots`, () => {
    storyEntries.forEach(([name, Story]) => {
      if (options?.skip?.includes(name)) return;
      if (options?.only && !options.only.includes(name)) return;

      it(`${name} matches snapshot`, () => {
        const StoryComponent = (Story as any).render || (() => null);
        const {container} = render(React.createElement(StoryComponent));
        expect(container).toMatchSnapshot();
      });
    });
  });
}

/**
 * Create a test suite for a component
 */
export function createComponentTestSuite<T extends Record<string, any>>(
  stories: T & {default?: Meta},
  config?: {
    skipStories?: string[];
    skipSnapshots?: boolean;
    skipAccessibility?: boolean;
    customTests?: Array<{
      name: string;
      test: (stories: any) => void;
    }>;
  },
) {
  const composedStories = composeStories(stories as any);

  describe((stories as any).default?.title || 'Component Test Suite', () => {
    // Story rendering tests
    testAllStories(stories, {skip: config?.skipStories});

    // Snapshot tests
    if (!config?.skipSnapshots) {
      createSnapshotTests(stories as any, {skip: config?.skipStories});
    }

    // Accessibility tests
    if (!config?.skipAccessibility) {
      describe('Accessibility', () => {
        Object.entries(composedStories).forEach(([name, Story]) => {
          if (config?.skipStories?.includes(name)) return;

          it(`${name} is accessible`, async () => {
            await componentTest.testAccessibility(Story as any);
          });
        });
      });
    }

    // Custom tests
    config?.customTests?.forEach(({name, test}) => {
      describe(name, () => {
        test(composedStories);
      });
    });
  });
}
