/**
 * Storybook interaction testing utilities
 * For testing user interactions within stories
 */

import {expect, waitFor, within, userEvent, fn, spyOn} from '@storybook/test';
import type {StoryObj, Meta} from '@storybook/react';

/**
 * Common interaction testing patterns
 */
export const interactions = {
  /**
   * Click interaction helper
   */
  async clickElement(canvas: ReturnType<typeof within>, selector: string) {
    const element = await canvas.findByRole('button', {name: selector});
    await userEvent.click(element);
  },

  /**
   * Type text interaction helper
   */
  async typeText(
    canvas: ReturnType<typeof within>,
    selector: string,
    text: string,
  ) {
    const input = await canvas.findByRole('textbox', {name: selector});
    await userEvent.clear(input);
    await userEvent.type(input, text);
  },

  /**
   * Select option interaction helper
   */
  async selectOption(
    canvas: ReturnType<typeof within>,
    selector: string,
    option: string,
  ) {
    const select = await canvas.findByRole('combobox', {name: selector});
    await userEvent.selectOptions(select, option);
  },

  /**
   * Check/uncheck interaction helper
   */
  async toggleCheckbox(canvas: ReturnType<typeof within>, selector: string) {
    const checkbox = await canvas.findByRole('checkbox', {name: selector});
    await userEvent.click(checkbox);
  },

  /**
   * Wait for element to appear
   */
  async waitForElement(
    canvas: ReturnType<typeof within>,
    role: string,
    name: string,
  ) {
    return await waitFor(async () => {
      return await canvas.findByRole(role, {name});
    });
  },

  /**
   * Assert element text content
   */
  async assertText(canvas: ReturnType<typeof within>, text: string) {
    const element = await canvas.findByText(text);
    await expect(element).toBeInTheDocument();
  },

  /**
   * Assert element is visible
   */
  async assertVisible(element: HTMLElement) {
    await expect(element).toBeVisible();
  },

  /**
   * Assert element is disabled
   */
  async assertDisabled(element: HTMLElement) {
    await expect(element).toBeDisabled();
  },
};

/**
 * Story interaction test template
 */
export interface InteractionTest<T = any> {
  play: NonNullable<StoryObj<T>['play']>;
}

/**
 * Create an interaction test
 */
export function createInteractionTest<T>(
  test: (
    context: Parameters<NonNullable<StoryObj<T>['play']>>[0],
  ) => Promise<void>,
): InteractionTest<T> {
  return {
    play: async (context: any) => {
      await test(context);
    },
  };
}

/**
 * Common interaction test scenarios
 */
export const commonScenarios = {
  /**
   * Test form submission
   */
  formSubmission: <T>(
    fields: Record<string, string>,
    submitButton = 'Submit',
  ): InteractionTest<T> => ({
    play: async ({canvasElement, step}: any) => {
      const canvas = within(canvasElement);

      await step('Fill form fields', async () => {
        for (const [field, value] of Object.entries(fields)) {
          await interactions.typeText(canvas, field, value);
        }
      });

      await step('Submit form', async () => {
        await interactions.clickElement(canvas, submitButton);
      });

      await step('Verify submission', async () => {
        // Add your verification logic here
        await waitFor(async () => {
          await canvas.findByText('Form submitted successfully');
        });
      });
    },
  }),

  /**
   * Test modal interaction
   */
  modalInteraction: <T>(
    openButton: string,
    closeButton = 'Close',
  ): InteractionTest<T> => ({
    play: async ({canvasElement, step}: any) => {
      const canvas = within(canvasElement);

      await step('Open modal', async () => {
        await interactions.clickElement(canvas, openButton);
      });

      await step('Verify modal is open', async () => {
        const modal = await canvas.findByRole('dialog');
        await interactions.assertVisible(modal);
      });

      await step('Close modal', async () => {
        await interactions.clickElement(canvas, closeButton);
      });

      await step('Verify modal is closed', async () => {
        await waitFor(async () => {
          const modal = canvas.queryByRole('dialog');
          expect(modal).not.toBeInTheDocument();
        });
      });
    },
  }),

  /**
   * Test data loading states
   */
  dataLoading: <T>(): InteractionTest<T> => ({
    play: async ({canvasElement, step}: any) => {
      const canvas = within(canvasElement);

      await step('Check loading state', async () => {
        const loader = await canvas.findByRole('progressbar');
        await interactions.assertVisible(loader);
      });

      await step('Wait for data', async () => {
        await waitFor(
          async () => {
            const content = await canvas.findByTestId('content');
            await interactions.assertVisible(content);
          },
          {timeout: 5000},
        );
      });

      await step('Verify loaded state', async () => {
        const loader = canvas.queryByRole('progressbar');
        expect(loader).not.toBeInTheDocument();
      });
    },
  }),
};

/**
 * Mock utilities for Storybook
 */
export const mockUtils: {
  createMock: typeof fn;
  spyOnMethod: typeof spyOn;
  mockApiResponse: (data: any, delay?: number) => Promise<any>;
  mockApiError: (error: string, delay?: number) => Promise<never>;
} = {
  /**
   * Create a mock function with type safety
   */
  createMock: fn,

  /**
   * Spy on object methods
   */
  spyOnMethod: spyOn,

  /**
   * Mock API responses
   */
  mockApiResponse: (data: any, delay = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  },

  /**
   * Mock error responses
   */
  mockApiError: (error: string, delay = 100) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(error)), delay);
    });
  },
};

// Re-export Storybook test utilities
export {expect, waitFor, within, userEvent, fn, spyOn} from '@storybook/test';
