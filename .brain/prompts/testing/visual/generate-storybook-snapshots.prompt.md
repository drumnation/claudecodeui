# 📸 Generate Storybook Snapshot Tests

**Purpose:** Create snapshot or visual regression tests for all stories in a given component. Useful for visual diffing and catching UI regressions.

**Use when:** You want to automatically generate visual regression tests for existing Storybook stories or create comprehensive snapshot coverage.

## Instructions:

### 1. **Analyze Component Stories**
- Identify the target component and its story file
- Review existing stories and their variations
- Determine which stories should have snapshot coverage
- Check for stories that might be problematic for snapshots (animations, random data)

### 2. **Choose Snapshot Strategy**

#### **Storybook Test Runner (Recommended)**
```javascript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  setup() {
    // Global setup for all story tests
  },
  async postRender(page, context) {
    // Custom logic after each story renders
    const elementHandler = await page.$('#storybook-root');
    const innerHTML = await elementHandler?.innerHTML();
    expect(innerHTML).toMatchSnapshot();
  },
};

export default config;
```

#### **Playwright Storybook Integration**
```javascript
// tests/storybook.spec.ts
import { test, expect } from '@playwright/test';
import { composeStories } from '@storybook/react';
import * as stories from '../src/components/Button/Button.stories';

const { Primary, Secondary, Large } = composeStories(stories);

test.describe('Button Stories Snapshots', () => {
  test('Primary story matches snapshot', async ({ mount }) => {
    const component = await mount(<Primary />);
    await expect(component).toHaveScreenshot('button-primary.png');
  });

  test('Secondary story matches snapshot', async ({ mount }) => {
    const component = await mount(<Secondary />);
    await expect(component).toHaveScreenshot('button-secondary.png');
  });

  test('Large story matches snapshot', async ({ mount }) => {
    const component = await mount(<Large />);
    await expect(component).toHaveScreenshot('button-large.png');
  });
});
```

### 3. **Generate Automated Snapshot Tests**

#### **Script to Generate Test Files**
```javascript
// scripts/generate-story-snapshots.js
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

function generateSnapshotTests() {
  const storyFiles = globSync('src/**/*.stories.@(js|jsx|ts|tsx)');
  
  storyFiles.forEach(storyFile => {
    const componentName = path.basename(storyFile, path.extname(storyFile)).replace('.stories', '');
    const testContent = generateTestFileContent(storyFile, componentName);
    
    const testDir = path.dirname(storyFile.replace('src/', 'tests/snapshots/'));
    const testFile = path.join(testDir, `${componentName}.snapshot.spec.ts`);
    
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(testFile, testContent);
    
    console.log(`Generated snapshot test: ${testFile}`);
  });
}

function generateTestFileContent(storyFile, componentName) {
  const importPath = storyFile.replace('src/', '../../../src/').replace('.ts', '').replace('.js', '');
  
  return `// Auto-generated snapshot tests for ${componentName}
import { test, expect } from '@playwright/test';
import { composeStories } from '@storybook/react';
import * as stories from '${importPath}';

const composedStories = composeStories(stories);

test.describe('${componentName} Story Snapshots', () => {
  Object.entries(composedStories).forEach(([storyName, Story]) => {
    test(\`\${storyName} matches snapshot\`, async ({ mount }) => {
      const component = await mount(<Story />);
      await expect(component).toHaveScreenshot(\`\${componentName.toLowerCase()}-\${storyName.toLowerCase()}.png\`);
    });
  });
});
`;
}

generateSnapshotTests();
```

### 4. **Chromatic Integration**
```javascript
// Enhanced story file for Chromatic snapshots
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    chromatic: {
      // Automatically snapshot all stories
      modes: {
        light: { backgrounds: { default: 'light' } },
        dark: { backgrounds: { default: 'dark' } },
      },
      viewports: [320, 768, 1200], // Multiple viewport snapshots
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// All stories will automatically get visual regression testing
export const Default: Story = {};
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Disabled: Story = { args: { disabled: true } };

// Comprehensive snapshot story
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      <Button>Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button size="small">Small</Button>
      <Button size="large">Large</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
  parameters: {
    chromatic: { delay: 300 }, // Wait for render
  },
};
```

### 5. **Package Scripts**
```json
{
  "scripts": {
    "generate:snapshots": "node scripts/generate-story-snapshots.js",
    "test:snapshots": "playwright test tests/snapshots",
    "test:storybook": "test-storybook",
    "test:visual:all": "npm run test:snapshots && npm run test:storybook",
    "update:snapshots": "playwright test tests/snapshots --update-snapshots"
  }
}
```

### 6. **Filtering Stories for Snapshots**

#### **Include/Exclude Configuration**
```javascript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async preRender(page, story) {
    // Skip stories that shouldn't be snapshot tested
    const skipSnapshots = story.parameters?.skipSnapshot || 
                         story.parameters?.chromatic?.disable;
    
    if (skipSnapshots) {
      return;
    }
  },
  async postRender(page, story) {
    // Only snapshot stories marked for visual testing
    if (story.parameters?.snapshot !== false) {
      await expect(page.locator('#storybook-root')).toHaveScreenshot(
        `${story.title.replace(/\//g, '-')}-${story.name}.png`
      );
    }
  },
};
```

#### **Story-Level Configuration**
```javascript
// Control which stories get snapshots
export const InteractiveDemo: Story = {
  args: { interactive: true },
  parameters: {
    skipSnapshot: true, // Skip this story for snapshots
    chromatic: { disable: true }, // Skip for Chromatic too
  },
};

export const StaticSnapshot: Story = {
  args: { value: 'Fixed content' },
  parameters: {
    snapshot: true, // Explicitly include
    chromatic: { delay: 500 }, // Wait for animations
  },
};
```

### 7. **Maintenance and Updates**

#### **Snapshot Review Workflow**
```bash
# Review snapshot changes
npm run test:snapshots
# If changes are intentional:
npm run update:snapshots

# For Chromatic changes
npm run chromatic -- --auto-accept-changes
```

## Expected Inputs:
- **Component Name or Path**: Target component for snapshot generation
- **Story File Content**: Existing `.stories.tsx` file (optional for analysis)
- **Snapshot Strategy**: Playwright, Storybook Test Runner, or Chromatic
- **Coverage Requirements**: Which stories/variants to include

## Expected Outputs:
- **Snapshot Test Files**: Generated test files with visual regression coverage
- **Configuration**: Test runner setup for automated snapshot generation
- **CI Integration**: Scripts and workflows for automated snapshot testing
- **Documentation**: Maintenance guidelines and update procedures 