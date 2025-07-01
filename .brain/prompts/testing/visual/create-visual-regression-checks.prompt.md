# 👁️ Add Visual Regression Coverage for Component

**Purpose:** Extend existing Storybook stories to support visual regression testing using supported tooling.

**Use when:** You have existing components with Storybook stories and want to add visual regression testing to catch UI changes.

## Instructions:

### 1. **Analyze Existing Component**
- Review the component's current Storybook stories
- Identify which stories need visual regression coverage
- Check for dynamic content that might cause flaky visual tests
- Assess component variants and states to cover

### 2. **Choose Visual Testing Tool**
Based on your project setup:
- **Chromatic**: Best for Storybook-native visual testing
- **Percy**: Cross-platform visual testing with CI integration
- **Playwright**: In-house visual testing with fine-grained control

### 3. **Configure Visual Regression**

#### **For Chromatic (Recommended)**
```javascript
// Update component story for visual regression
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    chromatic: {
      // Configure visual regression settings
      viewports: [320, 768, 1200], // Test multiple screen sizes
      delay: 500, // Wait for animations to complete
      pauseAnimationAtEnd: true, // Ensure consistent animation states
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Enhanced stories for visual regression
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <ComponentName variant="primary" />
      <ComponentName variant="secondary" />
      <ComponentName variant="danger" />
    </div>
  ),
  parameters: {
    chromatic: {
      modes: {
        light: { backgrounds: { default: 'light' } },
        dark: { backgrounds: { default: 'dark' } },
      },
    },
  },
};
```

#### **For Percy**
```javascript
// Add Percy-specific annotations
export const VisualTest: Story = {
  args: {
    children: 'Sample content',
  },
  parameters: {
    percy: {
      name: 'ComponentName - Default State',
      widths: [320, 768, 1200],
    },
  },
};
```

#### **For Playwright Visual Testing**
```javascript
// tests/visual/component-name.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ComponentName Visual Tests', () => {
  test('component renders correctly in all variants', async ({ page }) => {
    await page.goto('/iframe.html?id=components-componentname--all-variants');
    
    // Wait for component to load
    await page.locator('[data-testid="component-name"]').waitFor();
    
    // Take screenshot
    await expect(page.locator('[data-testid="component-name"]')).toHaveScreenshot('component-name-variants.png');
  });
});
```

### 4. **Handle Dynamic Content**
```javascript
// For components with dynamic content
export const StableVisualTest: Story = {
  render: () => (
    <ComponentName 
      timestamp="2024-01-15T12:00:00Z" // Fixed timestamp
      randomId="stable-id-123" // Fixed ID
      userName="Test User" // Fixed user data
    />
  ),
  parameters: {
    chromatic: {
      // Disable for dynamic content or use mock data
      disable: false,
    },
  },
};
```

### 5. **CI Integration Commands**
```bash
# Run visual regression tests
npm run chromatic
npm run percy
npm run test:visual

# Update baselines (when changes are intentional)
npm run chromatic -- --auto-accept-changes
npm run percy -- --update-baseline
npm run test:visual -- --update-snapshots
```

## Expected Inputs:
- **Component Name**: The component to add visual regression for
- **Existing Stories**: Current Storybook story configuration
- **Tooling Context**: Chromatic, Percy, or Playwright preference
- **Variants to Test**: Different component states and props

## Expected Outputs:
- **Enhanced Stories**: Updated Storybook stories with visual regression annotations
- **Configuration**: Tool-specific settings for optimal visual testing
- **CI Commands**: Instructions for running visual tests in CI/CD
- **Documentation**: Usage guidelines for maintaining visual tests 