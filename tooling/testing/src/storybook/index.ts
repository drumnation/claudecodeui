/**
 * Storybook testing utilities - Compatibility export
 * @deprecated Import from '@kit/testing' directly or use '@kit/testing/utilities/storybook/*'
 */

export * from '../utilities/storybook/component.js';
export * from '../utilities/storybook/interaction.js';
export {default as testRunnerConfig} from '../configs/storybook/test-runner.js';

// Re-export types
export type {StoryObj, Meta, StoryContext} from '@storybook/react';
export type {TestRunnerConfig} from '@storybook/test-runner';
