# 👁️ Setup Visual Testing

**Purpose:** Configure comprehensive visual regression testing infrastructure and workflows for UI consistency.

**Use when:** Setting up visual testing for the first time, migrating visual testing tools, or establishing visual regression workflows for design systems.

## Instructions:

### 1. **Visual Testing Strategy**

#### **Choose Visual Testing Approach**
- **Component-Level**: Individual component visual tests (Storybook + Chromatic)
- **Page-Level**: Full page screenshots (Playwright Visual Testing)
- **Cross-Browser**: Multi-browser visual consistency (Playwright + multiple browsers)
- **Responsive**: Multiple viewport and device testing
- **Design System**: Visual regression for component libraries

#### **Tool Selection Matrix**
```javascript
// Recommended Visual Testing Stack
{
  "component": "Storybook + Chromatic",     // Component isolation
  "e2e": "Playwright Visual Testing",      // Full page flows
  "mobile": "Playwright Mobile Viewports", // Responsive testing
  "accessibility": "axe-playwright",       // Visual + a11y
  "ci": "GitHub Actions + Chromatic"       // Automated visual reviews
}
```

### 2. **Chromatic + Storybook Setup**

#### **Chromatic Configuration**
```javascript
// .github/workflows/chromatic.yml
name: 'Chromatic'
on: 
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  chromatic-deployment:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required for Chromatic baseline detection
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build Storybook
        run: pnpm build-storybook --quiet
      
      - name: Publish to Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          token: ${{ secrets.GITHUB_TOKEN }}
          buildScriptName: build-storybook
          exitZeroOnChanges: true
          autoAcceptChanges: main # Auto-accept changes on main branch
```

#### **Storybook Visual Testing Configuration**
```javascript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook', // Chromatic addon
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  features: {
    buildStoriesJson: true, // Enable for Chromatic
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

#### **Component Story Best Practices**
```javascript
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    // Chromatic configuration per story
    chromatic: {
      viewports: [320, 768, 1200], // Test multiple viewports
      delay: 300, // Wait for animations
      pauseAnimationAtEnd: true, // Pause animations for consistent snapshots
    },
    docs: {
      description: {
        component: 'Primary button component used throughout the application.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'destructive'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants for visual regression
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    chromatic: {
      // Custom configuration for this specific story
      modes: {
        light: { backgrounds: { default: 'light' } },
        dark: { backgrounds: { default: 'dark' } },
      },
    },
  },
};

// Interactive states
export const HoverStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button>Normal</Button>
      <Button className="hover">Hover</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
  parameters: {
    pseudo: { hover: ['.hover'] }, // Pseudo-state addon
  },
};
```

### 3. **Playwright Visual Testing**

#### **Playwright Visual Configuration**
```javascript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  
  // Visual testing specific settings
  expect: {
    // Threshold for visual comparisons (0-1, where 1 is exact match)
    threshold: 0.2,
    // Screenshot comparison mode
    toHaveScreenshot: {
      threshold: 0.2,
      mode: 'color', // or 'grayscale'
      animations: 'disabled', // Disable animations for consistent screenshots
    },
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },
  
  use: {
    baseURL: 'http://localhost:3000',
    // Global visual testing settings
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    
    // Mobile devices
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    
    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],
});
```

#### **Visual Test Examples**
```javascript
// tests/visual/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage Visual Tests', () => {
  test('homepage renders correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic content that changes between runs
    await page.addStyleTag({
      content: `
        .timestamp, .random-content { 
          visibility: hidden !important; 
        }
      `
    });
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png');
  });
  
  test('navigation component', async ({ page }) => {
    await page.goto('/');
    
    const navigation = page.locator('[data-testid="main-navigation"]');
    await expect(navigation).toHaveScreenshot('navigation.png');
  });
  
  test('responsive hero section', async ({ page }) => {
    await page.goto('/');
    
    const hero = page.locator('[data-testid="hero-section"]');
    
    // Test multiple viewport sizes
    await page.setViewportSize({ width: 320, height: 568 }); // Mobile
    await expect(hero).toHaveScreenshot('hero-mobile.png');
    
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await expect(hero).toHaveScreenshot('hero-tablet.png');
    
    await page.setViewportSize({ width: 1200, height: 800 }); // Desktop
    await expect(hero).toHaveScreenshot('hero-desktop.png');
  });
  
  test('dark mode visual comparison', async ({ page }) => {
    await page.goto('/');
    
    // Light mode screenshot
    await expect(page).toHaveScreenshot('homepage-light.png');
    
    // Switch to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500); // Wait for theme transition
    
    // Dark mode screenshot
    await expect(page).toHaveScreenshot('homepage-dark.png');
  });
});
```

### 4. **Advanced Visual Testing Patterns**

#### **Component Visual Testing Utilities**
```javascript
// tests/visual/utils/visual-helpers.ts
import { Page, Locator } from '@playwright/test';

export class VisualTestHelpers {
  static async hideTimestamps(page: Page) {
    await page.addStyleTag({
      content: `
        [data-testid*="timestamp"], 
        .timestamp, 
        .relative-time,
        .loading-spinner {
          visibility: hidden !important;
        }
      `
    });
  }
  
  static async waitForImagesLoaded(page: Page) {
    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every(img => img.complete);
    });
  }
  
  static async mockDynamicContent(page: Page) {
    // Mock time-sensitive content
    await page.addInitScript(() => {
      // Override Date.now for consistent timestamps
      Date.now = () => new Date('2024-01-15T12:00:00Z').getTime();
      
      // Mock random number generation
      Math.random = () => 0.5;
    });
  }
  
  static async screenshotComponent(
    locator: Locator, 
    name: string, 
    options: { fullPage?: boolean; clip?: any } = {}
  ) {
    // Ensure component is visible
    await locator.scrollIntoViewIfNeeded();
    await locator.waitFor({ state: 'visible' });
    
    return await locator.screenshot({
      path: `test-results/screenshots/${name}.png`,
      ...options
    });
  }
}
```

#### **Cross-Browser Visual Testing**
```javascript
// tests/visual/cross-browser.spec.ts
import { test, expect, devices } from '@playwright/test';

const browsers = [
  { name: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
];

browsers.forEach(({ name, device }) => {
  test.describe(`Cross-browser: ${name}`, () => {
    test.use(device);
    
    test(`landing page consistency - ${name}`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Browser-specific screenshot
      await expect(page).toHaveScreenshot(`landing-${name}.png`);
    });
    
    test(`form components - ${name}`, async ({ page }) => {
      await page.goto('/forms');
      
      const form = page.locator('[data-testid="contact-form"]');
      await expect(form).toHaveScreenshot(`form-${name}.png`);
    });
  });
});
```

### 5. **CI/CD Integration**

#### **GitHub Actions with Visual Testing**
```yaml
# .github/workflows/visual-tests.yml
name: Visual Tests
on:
  pull_request:
    branches: [main]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build application
        run: pnpm build
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Run visual tests
        run: pnpm test:visual
      
      - name: Upload visual test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-test-results
          path: |
            test-results/
            playwright-report/
      
      - name: Chromatic visual tests
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          token: ${{ secrets.GITHUB_TOKEN }}
          exitZeroOnChanges: false # Fail on visual changes
```

### 6. **Visual Testing Maintenance**

#### **Baseline Management**
```javascript
// scripts/update-visual-baselines.js
const { exec } = require('child_process');
const path = require('path');

async function updateBaselines() {
  console.log('Updating visual test baselines...');
  
  // Update Playwright baselines
  exec('pnpm exec playwright test --update-snapshots', (error, stdout) => {
    if (error) {
      console.error('Playwright baseline update failed:', error);
      return;
    }
    console.log('Playwright baselines updated');
  });
  
  // Accept all Chromatic changes
  exec('npx chromatic --auto-accept-changes', (error, stdout) => {
    if (error) {
      console.error('Chromatic baseline update failed:', error);
      return;
    }
    console.log('Chromatic baselines updated');
  });
}

updateBaselines();
```

#### **Package Scripts**
```json
{
  "scripts": {
    "test:visual": "playwright test tests/visual",
    "test:visual:update": "playwright test tests/visual --update-snapshots",
    "test:visual:ui": "playwright test tests/visual --ui",
    "chromatic": "chromatic --exit-zero-on-changes",
    "chromatic:ci": "chromatic --exit-once-uploaded",
    "visual:update-all": "node scripts/update-visual-baselines.js"
  }
}
```

## Expected Inputs:
- **Project Type**: Component library, web application, design system
- **UI Framework**: React, Vue, Angular, plain HTML/CSS
- **Design Requirements**: Brand consistency, responsive design, accessibility
- **Browser Support**: Target browsers and devices
- **Team Workflow**: Review process, approval workflow

## Expected Outputs:
- **Tool Configuration**: Chromatic, Playwright visual testing setup
- **CI/CD Workflows**: Automated visual testing in pull requests
- **Test Suites**: Component and page-level visual tests
- **Baseline Management**: Scripts for updating visual baselines
- **Documentation**: Visual testing guidelines and best practices
- **Review Workflows**: Process for handling visual changes and approvals 