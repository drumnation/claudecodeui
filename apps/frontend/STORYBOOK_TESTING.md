# Storybook Testing Integration

This document describes the comprehensive testing setup for Storybook stories that integrates with the brain:validate command for fast, parallel frontend testing.

## Overview

The Storybook testing system provides:

- **Story Validation**: Ensures stories match real app implementation
- **E2E Testing**: Tests user interactions across all stories
- **Accessibility Testing**: Automated a11y checks with axe-playwright
- **Visual Regression**: Screenshots for visual comparison
- **Performance Testing**: Monitors critical component performance
- **Parallel Execution**: Optimized for speed and efficiency

## Test Types

### 1. Unit Tests (`npm run test:storybook:unit`)

- Tests individual story rendering
- Validates story props and behavior
- Uses Vitest with jsdom environment
- Fast execution with parallel workers

### 2. E2E Tests (`npm run test:storybook:e2e`)

- Tests user interactions in real browser
- Validates story functionality end-to-end
- Uses Playwright with multiple browsers
- Covers chat and project features comprehensively

### 3. Accessibility Tests (`npm run test:storybook:a11y`)

- Automated accessibility testing with axe-playwright
- Validates WCAG compliance
- Tests keyboard navigation and screen reader support
- Integrated into test-runner configuration

### 4. Integration Tests (`npm run test:storybook:integration`)

- Comprehensive test suite combining all test types
- Generates coverage reports and performance metrics
- Saves results for brain monitor integration
- Optimized for CI/CD environments

## Configuration Files

### Test Runner Configuration

- `.storybook/test-runner.js` - Main test runner config
- `playwright.storybook.config.ts` - Playwright configuration
- `vitest.storybook.config.ts` - Vitest configuration

### Test Setup

- `src/test/storybook.setup.ts` - Test environment setup
- `src/test/global-setup.ts` - Playwright global setup
- `src/test/global-teardown.ts` - Playwright cleanup

### Integration Script

- `scripts/test-storybook-integration.js` - Orchestrates all test types

## Story Structure

Stories are structured to match the real app implementation:

```typescript
// ChatInterface.stories.tsx
export default {
  title: 'Features/Chat/ChatInterface',
  component: ChatInterface,
  parameters: {
    layout: 'fullscreen',
    docs: {description: {component: 'Main chat interface...'}},
  },
  argTypes: {
    selectedProject: {description: 'Currently selected project'},
    // ... complete prop documentation
  },
};

// Mock data matches real app structure
const mockProject = {
  name: 'claude-code-ui',
  displayName: 'Claude Code UI',
  path: '/claude-code-ui',
  fullPath: '/Users/developer/projects/claude-code-ui',
};

// Stories cover all major scenarios
export const Default = {
  args: {
    /* realistic defaults */
  },
};
export const WithActiveSession = {
  args: {
    /* with session data */
  },
};
export const Loading = {
  args: {
    /* loading states */
  },
};
export const WithError = {
  args: {
    /* error conditions */
  },
};
export const DarkMode = {
  /* theme variations */
};
export const Mobile = {
  /* responsive design */
};
```

## Test Implementation

### E2E Test Example

```typescript
// ChatInterface.e2e.test.ts
test('should handle message input and submission', async ({page}) => {
  await page.click('[data-item-id="features-chat-chatinterface--default"]');
  await page.waitForSelector('[data-testid="chat-interface"]');

  const inputField = page.locator('textarea[placeholder*="Ask Claude"]');
  await inputField.fill('Test message');

  await expect(page.locator('[data-testid="clear-button"]')).toBeVisible();
  await page.locator('[data-testid="send-button"]').click();
  await expect(inputField).toHaveValue('');
});
```

### Accessibility Testing

```javascript
// .storybook/test-runner.js
async postVisit(page, context) {
  await checkA11y(page, '#storybook-root', {
    rules: {
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
    },
  });
}
```

## Brain Monitor Integration

The testing system integrates with the brain:validate command:

```bash
# Run all validations including Storybook tests
npm run brain:validate

# Run comprehensive Storybook tests only
npm run test:storybook:all

# Individual test types
npm run test:storybook:unit
npm run test:storybook:e2e
npm run test:storybook:a11y
```

### Brain Monitor Configuration

- `test-storybook-comprehensive` task added to validation pipeline
- Results saved to `_errors/reports/errors.test-storybook-comprehensive-failures.md`
- Parallel execution with other validation tasks
- Comprehensive error reporting and debugging information

## Performance Optimizations

### Parallel Execution

- Multiple test suites run in parallel
- Playwright uses 4 workers by default
- Vitest uses thread pool for unit tests
- Storybook pre-warming for faster startup

### Caching

- Storybook build cache for faster subsequent runs
- Playwright browser context reuse
- Test result caching for unchanged stories
- Screenshot comparison for visual regression

### Resource Management

- Automatic cleanup of test artifacts
- Memory leak detection in tests
- Resource usage monitoring
- Timeout management for reliable execution

## Test Data Management

### Test IDs

Components include `data-testid` attributes for reliable testing:

- `data-testid="chat-interface"` - Main chat interface
- `data-testid="no-project-selected"` - No project state
- `data-testid="input-area"` - Input area component
- `data-testid="messages-area"` - Messages display area

### Mock Data

Stories use realistic mock data that matches the actual app:

- Project structures with sessions
- Message threads with tool usage
- Connection health states
- Error conditions and loading states

## Coverage and Reporting

### Test Coverage

- Unit test coverage with Vitest
- E2E test coverage with Playwright
- Combined coverage reporting
- Threshold enforcement (70% minimum)

### Performance Metrics

- Component render times
- Story loading performance
- Memory usage tracking
- Bundle size impact analysis

### Visual Regression

- Automatic screenshot generation
- Cross-browser comparison
- Mobile vs desktop layouts
- Dark mode vs light mode

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Storybook Tests
  run: npm run test:storybook:integration

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: storybook-test-results
    path: test-results/
```

### Local Development

```bash
# Watch mode for development
npm run test:storybook:watch

# Visual testing with UI
npm run test:ui

# Debug failed tests
npm run test:storybook:debug
```

## Troubleshooting

### Common Issues

1. **Storybook not starting**: Check port availability and dependencies
2. **Test timeouts**: Increase timeout values in config files
3. **Screenshot differences**: Update baseline images or adjust viewport
4. **Memory leaks**: Check component cleanup in useEffect hooks

### Debug Commands

```bash
# Run tests with debug output
DEBUG=pw:api npm run test:storybook:e2e

# Generate detailed test report
npm run test:storybook:integration --reporter=verbose

# Check test coverage
npm run test:coverage
```

## Future Enhancements

### Planned Features

- Visual regression testing with Percy/Chromatic
- Performance budgets and monitoring
- Cross-browser testing matrix
- Automated story generation from components
- Integration with design system validation

### Optimization Opportunities

- Parallel story pre-warming
- Incremental testing based on changed files
- Smart test selection based on component dependencies
- Automated test data generation

## Best Practices

### Story Writing

1. Use realistic mock data
2. Cover all component states
3. Include error conditions
4. Test responsive behavior
5. Validate accessibility

### Test Implementation

1. Use stable selectors (data-testid)
2. Test user workflows, not implementation
3. Keep tests independent
4. Use page object patterns
5. Handle async operations properly

### Performance

1. Pre-warm critical stories
2. Use parallel execution
3. Cache test results
4. Monitor resource usage
5. Optimize test data size

This comprehensive testing setup ensures that our Storybook stories accurately represent the real application and provide reliable, fast feedback during development.
