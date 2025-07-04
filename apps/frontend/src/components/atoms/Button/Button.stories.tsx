import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { expect, userEvent, within } from '@storybook/test';
import { Download, Plus, Save, X } from 'lucide-react';
import { Button } from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and comprehensive logging for user interactions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size variant of the button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    children: {
      control: { type: 'text' },
      description: 'Button content',
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Save className="mr-2 h-4 w-4" />
        Save
      </Button>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="secondary">
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
      <Button variant="destructive">
        <X className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>Disabled Outline</Button>
      <Button variant="destructive" disabled>Disabled Destructive</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        Loading...
      </Button>
      <Button variant="outline" disabled>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Processing...
      </Button>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    children: 'Click me!',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'This button logs interactions and can be used to test the logging functionality.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Click me!' });
    
    // Test that button is rendered
    await expect(button).toBeInTheDocument();
    
    // Test that button is enabled
    await expect(button).toBeEnabled();
    
    // Test click interaction
    await userEvent.click(button);
    
    // Verify onClick was called
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
  tags: ['interaction'],
};

export const DisabledInteraction: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled Button' });
    
    // Test that button is disabled
    await expect(button).toBeDisabled();
    
    // Try to click disabled button
    await userEvent.click(button);
    
    // Verify onClick was NOT called
    await expect(args.onClick).not.toHaveBeenCalled();
  },
  tags: ['interaction'],
};

export const KeyboardInteraction: Story = {
  args: {
    children: 'Keyboard Test',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Keyboard Test' });
    
    // Focus the button
    await button.focus();
    
    // Test that button is focused
    await expect(button).toHaveFocus();
    
    // Press Enter key
    await userEvent.keyboard('{Enter}');
    
    // Verify onClick was called
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    
    // Press Space key
    await userEvent.keyboard(' ');
    
    // Verify onClick was called again
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
  tags: ['interaction', 'a11y'],
};

// Snapshot testing stories
export const AllVariantsSnapshot: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  tags: ['snapshot', 'visual'],
};

export const AllSizesSnapshot: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
  tags: ['snapshot', 'visual'],
};

export const StatesSnapshot: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Normal</h3>
        <div className="flex gap-2">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Disabled</h3>
        <div className="flex gap-2">
          <Button disabled>Default</Button>
          <Button variant="outline" disabled>Outline</Button>
          <Button variant="destructive" disabled>Destructive</Button>
        </div>
      </div>
    </div>
  ),
  tags: ['snapshot', 'visual'],
};