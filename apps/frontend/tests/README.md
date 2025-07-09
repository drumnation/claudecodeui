# Testing Strategy for Claude Code UI

## Overview

This project implements a comprehensive three-tier testing strategy designed for reliability, speed, and maintainability:

1. **🧩 Component Tests (Storybook E2E)** - Test isolated components with mocked data
2. **🚀 Application E2E Tests (Playwright)** - Test real app with real backend
3. **🔌 API Integration Tests (Playwright)** - Test API endpoints and WebSocket connections

## Test Types

### 1. Component Tests (Storybook)
- **Location**: `src/**/*.stories.tsx`
- **Purpose**: Test component behavior in isolation
- **Run**: `npm run test:storybook`
- **Speed**: Fast (seconds)
- **Scope**: UI components, interactions, props

### 2. Application E2E Tests (Playwright)
- **Location**: `tests/e2e/`
- **Purpose**: Test real user workflows end-to-end
- **Run**: `npm run test:e2e`
- **Speed**: Medium (minutes)
- **Scope**: Full application, cross-browser

### 3. Unit Tests (Vitest)
- **Location**: `src/**/*.test.{ts,tsx}`
- **Purpose**: Test individual functions and utilities
- **Run**: `npm run test`
- **Speed**: Fast (seconds)
- **Scope**: Pure functions, hooks, utilities

## E2E Test Categories

### Smoke Tests (`smoke.spec.ts`)
**Purpose**: Quick validation of critical functionality
- App loads and displays correctly
- Basic navigation works
- No major JavaScript errors

**Run**: `npm run test:e2e:smoke`

### Critical Journey Tests (`critical-journeys.spec.ts`)
**Purpose**: Test most important user workflows
- Complete project setup and first chat
- Settings panel functionality
- Error recovery and resilience
- Mobile responsive features
- Performance and loading states

**Run**: `npm run test:e2e:critical`

### API Integration Tests (`api-integration.spec.ts`)
**Purpose**: Test backend integration
- API endpoints respond correctly
- WebSocket connections work
- Error handling for API failures

**Run**: `npm run test:e2e:api`

### Visual Regression Tests (`visual-regression.spec.ts`)
**Purpose**: Detect visual changes
- Homepage consistency
- Component visual states
- Mobile layout consistency
- Dark mode support

**Run**: `npm run test:e2e:visual`

### Performance Tests (`performance.spec.ts`)
**Purpose**: Monitor app performance
- Page load times
- Memory usage
- Network request optimization
- Large dataset rendering

**Run**: `npm run test:e2e:performance`

## Brain Monitor Integration

All tests are integrated into the brain-monitor validation system:

### Quick Commands
```bash
# Run all validations (including E2E smoke + critical)
npm run brain:validate

# Run only critical validations
npm run brain:validate-critical

# Run extended validations (including visual + performance)
npm run brain:validate-extended

# Run specific E2E test types
npm run brain:test-e2e-smoke
npm run brain:test-e2e-critical
npm run brain:test-e2e-visual
npm run brain:test-e2e-performance
```

### Test Categories in Brain Monitor
- **Critical**: Must pass for deployment (smoke, critical journeys)
- **Warning**: Should pass but won't block deployment (API integration)
- **Optional**: Nice to have (visual, performance)

## Test Utilities

### TestHelpers Class (`tests/e2e/utils/test-helpers.ts`)
Common utilities for E2E tests:
- `waitForAppReady()` - Wait for app to fully load
- `selectProject(name)` - Select project by name
- `sendChatMessage(message)` - Send chat message and wait
- `elementExists(selector)` - Check element existence
- `takeScreenshot(name)` - Take screenshot with name
- `checkAccessibility()` - Basic accessibility checks

### Usage Example
```typescript
import { TestHelpers } from './utils/test-helpers';

test('my test', async ({ page }) => {
  const helpers = new TestHelpers(page);
  await page.goto('/');
  await helpers.waitForAppReady();
  
  if (await helpers.elementExists('[data-testid="project-item"]')) {
    await helpers.selectProject('my-project');
    await helpers.sendChatMessage('Hello!');
  }
});
```

## Running Tests

### Local Development
```bash
# Run all tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test type
npm run test:e2e:smoke
npm run test:e2e:critical
npm run test:e2e:visual
npm run test:e2e:performance
```

### CI/CD Integration
```bash
# Run all critical tests
npm run brain:validate-critical

# Run extended tests (full suite)
npm run brain:validate-extended
```

## Configuration

### Playwright Config (`playwright.config.ts`)
- **Base URL**: `http://localhost:8766`
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Reporters**: HTML, JSON, JUnit
- **Screenshots**: On failure only
- **Video**: On failure only
- **Traces**: On first retry

### Test Data
- Use `data-testid` attributes for reliable element selection
- Mock external services when needed
- Use consistent test data across all tests

## Best Practices

### Writing E2E Tests
1. **Use semantic selectors**: Prefer `data-testid` over CSS selectors
2. **Make tests resilient**: Use `waitFor` and conditional checks
3. **Keep tests focused**: One test per user workflow
4. **Mock external dependencies**: Don't rely on external services
5. **Clean up after tests**: Reset state between tests

### Performance Optimization
1. **Parallel execution**: Tests run in parallel by default
2. **Selective testing**: Use tags to run specific test types
3. **Efficient selectors**: Use efficient CSS selectors
4. **Avoid timeouts**: Use `waitFor` instead of `setTimeout`
5. **Reuse browser contexts**: Share contexts when possible

## Debugging

### Failed Tests
1. Check screenshots in `test-results/`
2. Review video recordings
3. Use `--headed` mode to see browser
4. Use `--ui` mode for interactive debugging

### Common Issues
- **Element not found**: Check if element exists conditionally
- **Timing issues**: Use `waitFor` instead of fixed timeouts
- **Flaky tests**: Add better error handling and retries

## Maintenance

### Updating Tests
1. Update test data when app changes
2. Add new tests for new features
3. Remove obsolete tests
4. Update selectors when UI changes

### Monitoring
- Check brain-monitor reports regularly
- Monitor test execution times
- Update timeouts if needed
- Review visual regression failures

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Storybook Testing](https://storybook.js.org/docs/react/writing-tests/introduction)
- [Vitest Documentation](https://vitest.dev/)
- [Brain Monitor Guide](../../tooling/brain-monitor/README.md)