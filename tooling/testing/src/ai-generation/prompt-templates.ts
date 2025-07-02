import type { UserStory, TestRequirements } from './story-parser.js';

export interface PromptContext {
  projectInfo: {
    name: string;
    techStack: string[];
    testingFramework: string;
  };
  existingPatterns: {
    selectors: string[];
    utilities: string[];
    conventions: string[];
  };
  relatedTests?: string[];
}

export function generateTestPrompt(story: UserStory, context: PromptContext): string {
  const requirements = extractTestRequirements(story);
  
  return `Generate a Playwright end-to-end test for the following user story:

USER STORY:
- ID: ${story.id}
- As a: ${story.role}
- I want to: ${story.action}
- So that: ${story.goal}

ACCEPTANCE CRITERIA:
${story.acceptance.map((ac, i) => `${i + 1}. ${ac}`).join('\n')}

TECHNICAL CONTEXT:
- Testing Framework: Playwright with TypeScript
- Application: Claude Code UI (React frontend, Express backend)
- Test Environment: Isolated test mode with stubbed Claude CLI

REQUIREMENTS:
${formatRequirements(requirements)}

SELECTOR STRATEGY:
1. Prefer semantic selectors in this order:
   - getByRole() for buttons, links, form elements
   - getByTitle() for elements with title attributes
   - getByText() for unique text content
   - getByTestId() as fallback (data-testid attributes)
2. Available test IDs:
   ${getAvailableTestIds(story.tags[0])}

TEST PATTERNS TO FOLLOW:
1. Use async/await for all asynchronous operations
2. Add explicit waits before assertions when needed
3. Use page.waitForLoadState('networkidle') after navigation
4. Handle dynamic content with appropriate wait conditions
5. Include meaningful test descriptions

EXAMPLE PATTERN:
\`\`\`typescript
test('should ${story.goal.toLowerCase()}', async ({ page }) => {
  // Setup
  await page.goto('http://localhost:9000');
  await page.waitForLoadState('networkidle');
  
  // Actions
  // [Implement the user actions based on acceptance criteria]
  
  // Assertions
  // [Verify the expected outcomes]
});
\`\`\`

Generate a complete, working Playwright test that:
1. Sets up the necessary test environment
2. Performs all actions described in the acceptance criteria
3. Verifies all expected outcomes
4. Handles potential timing issues with dynamic content
5. Uses appropriate selectors based on the strategy above`;
}

function formatRequirements(requirements: TestRequirements): string {
  const lines: string[] = [];
  
  // Setup requirements
  const setupNeeds = Object.entries(requirements.setup)
    .filter(([_, needed]) => needed)
    .map(([item, _]) => item);
  
  if (setupNeeds.length > 0) {
    lines.push(`- Setup needed: ${setupNeeds.join(', ')}`);
  }
  
  // UI elements
  if (requirements.elements.length > 0) {
    lines.push(`- UI elements: ${requirements.elements.join(', ')}`);
  }
  
  // Assertions
  if (requirements.assertions.length > 0) {
    lines.push(`- Assertion types: ${requirements.assertions.join(', ')}`);
  }
  
  // Dependencies
  if (requirements.dependencies.length > 0) {
    lines.push(`- Dependencies: ${requirements.dependencies.join(', ')}`);
  }
  
  return lines.join('\n');
}

function getAvailableTestIds(category: string): string {
  const testIdsByCategory: Record<string, string[]> = {
    'project-management': [
      'new-project-button',
      'project-item-{projectName}',
      'session-item-{sessionId}',
      'refresh-projects-button',
    ],
    'chat': [
      'chat-input',
      'send-message-button',
      'abort-session-button',
      'message-{index}',
      'claude-status',
    ],
    'file-management': [
      'file-tree',
      'file-{filePath}',
      'directory-{dirPath}',
      'expand-{dirPath}',
    ],
    'git': [
      'git-status',
      'git-file-{filePath}',
      'commit-message-input',
      'commit-button',
      'branch-selector',
    ],
    'settings': [
      'tools-settings-modal',
      'allowed-tools-section',
      'skip-permissions-toggle',
      'theme-toggle',
    ],
  };
  
  return testIdsByCategory[category]?.join(', ') || 'Various component-specific test IDs';
}

export function refineTestPrompt(
  testCode: string,
  error: string,
  story: UserStory
): string {
  const errorAnalysis = analyzeError(error);
  
  return `The following Playwright test failed with an error. Please fix the test code:

ORIGINAL TEST:
\`\`\`typescript
${testCode}
\`\`\`

ERROR OUTPUT:
\`\`\`
${error}
\`\`\`

ERROR ANALYSIS:
${errorAnalysis}

USER STORY CONTEXT:
- ID: ${story.id}
- Goal: ${story.goal}
- Key acceptance criteria that might be affected:
${story.acceptance.filter(ac => mightBeRelatedToError(ac, error)).map(ac => `  - ${ac}`).join('\n')}

COMMON FIXES FOR THIS ERROR TYPE:
${getCommonFixes(errorAnalysis)}

Please provide the corrected test code that:
1. Addresses the specific error
2. Maintains the original test intent
3. Follows Playwright best practices
4. Includes appropriate error handling

Focus on making the test more robust and reliable.`;
}

function analyzeError(error: string): string {
  if (error.includes('locator.click: Target closed') || 
      error.includes('element not found')) {
    return 'Selector Issue: The element selector is not finding the target element.';
  }
  
  if (error.includes('Timeout') || error.includes('exceeded')) {
    return 'Timeout Issue: The operation took longer than expected.';
  }
  
  if (error.includes('Expected') && error.includes('Received')) {
    return 'Assertion Failure: The actual value does not match the expected value.';
  }
  
  if (error.includes('ERR_CONNECTION_REFUSED')) {
    return 'Connection Issue: Cannot connect to the test server.';
  }
  
  if (error.includes('strict mode violation')) {
    return 'Multiple Elements: The selector matches multiple elements.';
  }
  
  return 'Unknown Error: The test failed for an unidentified reason.';
}

function mightBeRelatedToError(acceptanceCriterion: string, error: string): boolean {
  const criterionLower = acceptanceCriterion.toLowerCase();
  const errorLower = error.toLowerCase();
  
  // Check for common correlations
  const keywords = ['button', 'click', 'input', 'select', 'visible', 'appear', 'show'];
  
  return keywords.some(keyword => 
    criterionLower.includes(keyword) && errorLower.includes(keyword)
  );
}

function getCommonFixes(errorType: string): string {
  const fixes: Record<string, string> = {
    'Selector Issue': `
1. Check if the element has a different selector (inspect in browser DevTools)
2. Add data-testid to the component if missing
3. Use a more specific selector path
4. Wait for the element to be visible before interacting:
   await page.locator('selector').waitFor({ state: 'visible' });
5. Try alternative selector methods (getByRole, getByText, etc.)`,
    
    'Timeout Issue': `
1. Increase the timeout for the specific operation:
   await page.click('selector', { timeout: 30000 });
2. Add explicit waits before the operation:
   await page.waitForLoadState('networkidle');
3. Check if there are loading states to wait for
4. Use more specific wait conditions:
   await page.waitForSelector('selector', { state: 'visible' });`,
    
    'Assertion Failure': `
1. Log the actual value to understand what's different:
   console.log(await page.locator('selector').textContent());
2. Check if the expected value needs to be updated
3. Consider using more flexible assertions:
   expect(value).toContain('partial text');
4. Account for dynamic content or timing issues`,
    
    'Connection Issue': `
1. Ensure the test server is running on the correct port
2. Check the base URL in the test
3. Add a delay before the first navigation
4. Verify the test environment setup`,
    
    'Multiple Elements': `
1. Make the selector more specific
2. Use .first() or .nth(index) to select a specific element
3. Filter by additional attributes or text content
4. Use a more unique selector approach`,
  };
  
  return fixes[errorType.split(':')[0]] || 'Review the error message and adjust the test accordingly.';
}

export function validateTestPrompt(testCode: string, story: UserStory): string {
  return `Please validate the following Playwright test for quality and completeness:

TEST CODE:
\`\`\`typescript
${testCode}
\`\`\`

USER STORY:
- ID: ${story.id}
- Goal: ${story.goal}
- Acceptance Criteria:
${story.acceptance.map((ac, i) => `  ${i + 1}. ${ac}`).join('\n')}

VALIDATION CHECKLIST:
1. Code Quality:
   - [ ] Proper TypeScript syntax
   - [ ] Async/await used correctly
   - [ ] No syntax errors
   - [ ] Follows naming conventions

2. Test Coverage:
   - [ ] All acceptance criteria are tested
   - [ ] Setup is appropriate
   - [ ] Teardown is handled if needed
   - [ ] Edge cases considered

3. Selector Strategy:
   - [ ] Uses semantic selectors (getByRole, etc.)
   - [ ] Falls back to data-testid appropriately
   - [ ] Avoids brittle selectors
   - [ ] Selectors are maintainable

4. Error Handling:
   - [ ] Proper waits for dynamic content
   - [ ] Timeout handling
   - [ ] Clear error messages
   - [ ] Screenshot on failure (if applicable)

5. Best Practices:
   - [ ] DRY principle followed
   - [ ] Helper functions used where appropriate
   - [ ] Comments explain complex logic
   - [ ] Test is independent and isolated

Please provide:
1. A score out of 100 for test quality
2. Specific issues found (if any)
3. Suggested improvements
4. Whether the test adequately covers the user story`;
}

// Helper function to extract test requirements (imported from story-parser)
function extractTestRequirements(story: UserStory): TestRequirements {
  // This would be imported from story-parser.ts in real implementation
  // Simplified version here for the template
  return {
    setup: {
      project: story.tags.includes('project-management'),
      session: story.tags.includes('session-management') || story.tags.includes('chat'),
      files: story.tags.includes('file-management'),
      git: story.tags.includes('git'),
    },
    elements: [],
    assertions: [],
    dependencies: [],
    mockData: {},
  };
}

export function generateBatchPrompt(stories: UserStory[], category: string): string {
  return `Generate a comprehensive Playwright test suite for the following related user stories:

CATEGORY: ${category}

USER STORIES:
${stories.map(story => `
- ID: ${story.id}
  Role: ${story.role}
  Action: ${story.action}
  Goal: ${story.goal}
`).join('\n')}

REQUIREMENTS:
1. Create a single test file that covers all stories
2. Use shared setup and teardown where appropriate
3. Group related tests using describe blocks
4. Share helper functions between tests
5. Ensure tests can run independently
6. Use the test environment configuration for isolation

STRUCTURE:
\`\`\`typescript
import { test, expect } from '@playwright/test';
import { setupTestEnvironment, cleanupTestEnvironment } from '../test-environment';

test.describe('${category} functionality', () => {
  // Shared setup
  
  // Individual tests for each story
  
  // Shared helpers
});
\`\`\`

Generate efficient, maintainable tests that maximize code reuse while ensuring each story is properly tested.`;
}