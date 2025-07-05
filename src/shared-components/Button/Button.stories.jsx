import React from 'react';
import { Button } from '@/shared-components/Button/Button';
import { BUTTON_VARIANTS, BUTTON_SIZES } from '@/shared-components/Button/Button.logic';

export default {
  title: 'Shared Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(BUTTON_VARIANTS),
      description: 'The visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: Object.values(BUTTON_SIZES),
      description: 'The size of the button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    onClick: { action: 'clicked' },
  },
};

// Default story
export const Default = {
  args: {
    children: 'Button',
  },
};

// All variants
export const AllVariants = () => (
  <div className="flex flex-col gap-4">
    {Object.values(BUTTON_VARIANTS).map((variant) => (
      <div key={variant} className="flex items-center gap-4">
        <span className="w-24 text-sm font-medium">{variant}:</span>
        <Button variant={variant}>
          {variant.charAt(0).toUpperCase() + variant.slice(1)} Button
        </Button>
      </div>
    ))}
  </div>
);

// All sizes
export const AllSizes = () => (
  <div className="flex flex-col gap-4">
    {Object.values(BUTTON_SIZES).map((size) => (
      <div key={size} className="flex items-center gap-4">
        <span className="w-24 text-sm font-medium">{size}:</span>
        <Button size={size}>
          {size === 'icon' ? '🚀' : `${size.charAt(0).toUpperCase() + size.slice(1)} Button`}
        </Button>
      </div>
    ))}
  </div>
);

// Variant and size combinations
export const VariantSizeCombinations = () => (
  <div className="flex flex-col gap-8">
    {Object.values(BUTTON_VARIANTS).map((variant) => (
      <div key={variant}>
        <h3 className="mb-4 text-lg font-semibold">{variant} variant</h3>
        <div className="flex items-center gap-4">
          {Object.values(BUTTON_SIZES).map((size) => (
            <Button key={`${variant}-${size}`} variant={variant} size={size}>
              {size === 'icon' ? '🎯' : size}
            </Button>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// With icons
export const WithIcons = () => (
  <div className="flex flex-col gap-4">
    <Button>
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Item
    </Button>
    <Button variant="destructive">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Delete
    </Button>
    <Button variant="outline">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      Upload
    </Button>
  </div>
);

// Loading state
export const LoadingState = () => (
  <div className="flex gap-4">
    <Button disabled>
      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading...
    </Button>
    <Button variant="secondary" disabled>
      Processing...
    </Button>
  </div>
);

// Disabled states
export const DisabledStates = () => (
  <div className="flex flex-col gap-4">
    {Object.values(BUTTON_VARIANTS).map((variant) => (
      <Button key={variant} variant={variant} disabled>
        Disabled {variant}
      </Button>
    ))}
  </div>
);

// As link
export const AsLink = () => (
  <div className="flex gap-4">
    <Button variant="link">Link Button</Button>
    <Button variant="link" size="sm">
      Small Link
    </Button>
    <Button variant="link" size="lg">
      Large Link
    </Button>
  </div>
);

// Interactive playground
export const Playground = {
  args: {
    children: 'Click me!',
    variant: 'default',
    size: 'default',
    disabled: false,
  },
};