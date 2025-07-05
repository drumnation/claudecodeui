import React from 'react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from 'vitest';
import { ThemeToggle } from '@/shared-components/ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default {
  title: 'Shared Components/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'A toggle button component for switching between light and dark modes. Uses a smooth animated transition and includes proper accessibility attributes.',
      },
    },
  },
};

export const Default = {
  args: {},
};

export const LightMode = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'The toggle in light mode state with a sun icon.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // The component will render in light mode by default
  },
};

export const DarkMode = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'The toggle in dark mode state with a moon icon.',
      },
    },
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => {
      // Force dark mode for this story
      React.useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => {
          document.documentElement.classList.remove('dark');
        };
      }, []);
      return <Story />;
    },
  ],
};

export const WithCustomWrapper = {
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Example of the toggle within a custom container.',
      },
    },
  },
};

export const Interactive = {
  parameters: {
    docs: {
      description: {
        story: 'Click the toggle to switch between light and dark modes. The animation and icon will change accordingly.',
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    
    await step('Initial state - Light mode', async () => {
      await expect(toggle).toHaveAttribute('aria-checked', 'false');
    });
    
    await step('Click to switch to dark mode', async () => {
      await userEvent.click(toggle);
      await expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
    
    await step('Click to switch back to light mode', async () => {
      await userEvent.click(toggle);
      await expect(toggle).toHaveAttribute('aria-checked', 'false');
    });
  },
};