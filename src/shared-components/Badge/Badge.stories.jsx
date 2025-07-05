import React from 'react';
import { Badge } from '@/shared-components/Badge/Badge';
import { BADGE_VARIANTS } from '@/shared-components/Badge/Badge.logic';

export default {
  title: 'Shared Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(BADGE_VARIANTS),
      description: 'The visual style variant of the badge',
      defaultValue: BADGE_VARIANTS.DEFAULT,
    },
    children: {
      control: 'text',
      description: 'The content to display inside the badge',
    },
  },
};

export const Default = {
  args: {
    children: 'Badge',
    variant: BADGE_VARIANTS.DEFAULT,
  },
};

export const Secondary = {
  args: {
    children: 'Secondary',
    variant: BADGE_VARIANTS.SECONDARY,
  },
};

export const Destructive = {
  args: {
    children: 'Destructive',
    variant: BADGE_VARIANTS.DESTRUCTIVE,
  },
};

export const Outline = {
  args: {
    children: 'Outline',
    variant: BADGE_VARIANTS.OUTLINE,
  },
};

export const AllVariants = () => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    <Badge variant={BADGE_VARIANTS.DEFAULT}>Default</Badge>
    <Badge variant={BADGE_VARIANTS.SECONDARY}>Secondary</Badge>
    <Badge variant={BADGE_VARIANTS.DESTRUCTIVE}>Destructive</Badge>
    <Badge variant={BADGE_VARIANTS.OUTLINE}>Outline</Badge>
  </div>
);

export const WithLongText = () => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    <Badge variant={BADGE_VARIANTS.DEFAULT}>This is a longer badge text</Badge>
    <Badge variant={BADGE_VARIANTS.SECONDARY}>Another long text example</Badge>
  </div>
);

export const WithEmoji = () => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    <Badge variant={BADGE_VARIANTS.DEFAULT}>✨ New</Badge>
    <Badge variant={BADGE_VARIANTS.SECONDARY}>🚀 Beta</Badge>
    <Badge variant={BADGE_VARIANTS.DESTRUCTIVE}>⚠️ Warning</Badge>
    <Badge variant={BADGE_VARIANTS.OUTLINE}>ℹ️ Info</Badge>
  </div>
);

export const InContext = () => (
  <div style={{ maxWidth: '400px' }}>
    <h3 style={{ marginBottom: '12px' }}>
      Product Name <Badge variant={BADGE_VARIANTS.DEFAULT}>New</Badge>
    </h3>
    <p style={{ marginBottom: '12px' }}>
      This is a description of a product with a <Badge variant={BADGE_VARIANTS.SECONDARY}>Popular</Badge> badge inline.
    </p>
    <div style={{ display: 'flex', gap: '8px' }}>
      <Badge variant={BADGE_VARIANTS.OUTLINE}>Tag 1</Badge>
      <Badge variant={BADGE_VARIANTS.OUTLINE}>Tag 2</Badge>
      <Badge variant={BADGE_VARIANTS.OUTLINE}>Tag 3</Badge>
    </div>
  </div>
);