# 🔧 Investigate Test Failure

**Purpose:** Systematically diagnose test failures to determine root cause and provide specific fixing strategies.

**Use when:** A test is failing and you need to determine whether it's a regression, broken feature, or broken test.

## ⚠️ Agent Execution Note
**For AI agents**: Always use non-interactive test commands to avoid hanging:
- Use `--run` flag or `test:ci` scripts to avoid watch modes
- Add `--reporter=verbose` for detailed failure output
- Use `--no-watch` or `--watchAll=false` if available

## Instructions:

### 1. **Initial Failure Assessment**

#### **Gather Failure Information**
- **Error Message**: Exact error text and stack trace
- **Test Context**: Which test(s), test file, and test suite
- **Failure Frequency**: Always fails, intermittent, or environment-specific
- **Recent Changes**: Code changes since last successful run

#### **Quick Triage Questions**
```bash
# Check test isolation (non-interactive)
npm run test:run -- --testNamePattern="failing-test-name" --verbose

# Check if it's environment-specific
npm run test:ci vs npm run test:local

# Check test order dependency
npm run test:run -- --runInBand --testNamePattern="related-tests"

# Vitest specific commands
npx vitest run --testNamePattern="failing-test" --reporter=verbose
```

### 2. **Root Cause Analysis Framework**

#### **Is it a Broken Feature? (Regression)**
**Indicators:**
- Test was passing before recent code changes
- Multiple related tests are failing
- Manual testing confirms the feature is broken
- Error occurs in application code, not test code

**Investigation Steps:**
```bash
# Check git history
git log --oneline --since="3 days ago" -- path/to/feature

# Run the feature manually
npm run dev # Test the actual feature in browser/API

# Check if similar tests are also failing (non-interactive)
npm run test:run -- --testPathPattern="feature-name" --verbose
npx vitest run --testPathPattern="feature-name" --reporter=verbose
```

**Resolution Strategy:**
- **Primary**: Fix the feature code that's causing the failure
- **Secondary**: Update tests only if feature requirements changed intentionally

#### **Is it a Broken Test? (Test Issue)**
**Indicators:**
- Feature works correctly when tested manually
- Test code has logic errors or incorrect expectations
- Test is testing implementation details, not behavior
- Hard-coded values that are no longer valid

**Investigation Steps:**
```javascript
// Common test issues to check:

// 1. Async timing issues
test('async operation', async () => {
  // ❌ Missing await
  const result = api.fetchData();
  expect(result.data).toBe('expected');
  
  // ✅ Proper async handling
  const result = await api.fetchData();
  expect(result.data).toBe('expected');
});

// 2. Test isolation problems
test('user state', () => {
  // ❌ Depends on previous test state
  expect(currentUser.name).toBe('John');
  
  // ✅ Set up test state explicitly
  const user = createTestUser({ name: 'John' });
  expect(user.name).toBe('John');
});

// 3. Implementation vs behavior testing
test('component', () => {
  // ❌ Testing implementation
  expect(component.state.internalCounter).toBe(5);
  
  // ✅ Testing behavior
  expect(screen.getByText('Count: 5')).toBeInTheDocument();
});
```

#### **Is it a Test Environment Issue?**
**Indicators:**
- Passes locally but fails in CI
- Fails on specific operating systems or Node versions
- Network/database connectivity issues
- Missing environment variables or configuration

**Investigation Steps:**
```bash
# Check environment differences
env | grep -i test
cat .env.test

# Check CI-specific issues
# - Resource constraints
# - Timing differences
# - Missing dependencies
```

### 3. **Systematic Debugging Process**

#### **Step 1: Reproduce Locally**
```bash
# Try to reproduce the exact failure locally (non-interactive)
npm run test:run -- --testNamePattern="failing-test" --verbose

# If using different test runner commands in CI
npm run test:ci

# Vitest specific
npx vitest run --testNamePattern="failing-test" --reporter=verbose
```

#### **Step 2: Isolate the Failure**
```bash
# Run just the failing test (non-interactive)
npm run test:run -- path/to/test.spec.ts --testNamePattern="specific test"

# Check for test order dependencies
npm run test:run -- --runInBand

# Check for async race conditions
npm run test:run -- --detectOpenHandles

# Vitest specific isolation
npx vitest run path/to/test.spec.ts --reporter=verbose
```

#### **Step 3: Add Debugging Information**
```javascript
test('failing test', async () => {
  // Add detailed logging
  console.log('Test starting with state:', initialState);
  
  const result = await performAction();
  console.log('Action result:', result);
  
  // Add intermediate assertions
  expect(result).toBeDefined();
  expect(result.status).toBe('success');
  
  // More specific error messages
  expect(result.data).toBe('expected', 
    `Expected 'expected' but got '${result.data}'. Full result: ${JSON.stringify(result)}`
  );
});
```

### 4. **Common Fix Patterns**

#### **Timing and Async Issues**
```javascript
// ❌ Race condition
test('loads data', () => {
  component.loadData();
  expect(component.data).toBeTruthy();
});

// ✅ Wait for async operation
test('loads data', async () => {
  await component.loadData();
  expect(component.data).toBeTruthy();
});

// ✅ Use testing library waiting utilities
test('displays loaded data', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

#### **State Management Issues**
```javascript
// ❌ Shared state between tests
beforeEach(() => {
  // Incomplete cleanup
  userStore.clear();
});

// ✅ Complete state reset
beforeEach(() => {
  userStore.reset();
  localStorage.clear();
  sessionStorage.clear();
  // Reset any global variables
  global.mockDate = undefined;
});
```

#### **Assertion Problems**
```javascript
// ❌ Brittle assertion
expect(element.textContent).toBe('Items: 1, 2, 3');

// ✅ More flexible assertion
expect(element.textContent).toContain('Items:');
expect(element.textContent).toContain('1');
expect(element.textContent).toContain('2');

// ✅ Test the behavior, not exact output
expect(element.querySelectorAll('.item')).toHaveLength(3);
```

### 5. **Decision Framework**

#### **When to Fix the Test**
- Manual testing confirms feature works correctly
- Test is testing implementation details
- Test has logic errors or incorrect expectations
- Requirements changed and test needs updating

#### **When to Fix the Feature**
- Test correctly represents expected behavior
- Manual testing confirms feature is broken
- Multiple tests are failing for the same feature
- Error occurs in production code, not test code

#### **When to Update Requirements**
- Business requirements have changed
- Feature behavior intentionally modified
- Test represents old requirements

### 6. **Documentation Requirements**

#### **For Fixed Tests**
```javascript
// Document why the test was changed
test('user login flow', async () => {
  // CHANGED: Updated to match new API response format (2024-01-15)
  // Previous version expected { user: {...} }, now returns { data: { user: {...} } }
  const response = await login(credentials);
  expect(response.data.user.name).toBe('John');
});
```

#### **For Fixed Features**
```javascript
// Link test failure to bug fix
test('calculates tax correctly', () => {
  // This test was failing due to bug #1234 - incorrect tax calculation
  // Fixed in commit abc123f
  expect(calculateTax(100, 0.1)).toBe(10);
});
```

## Expected Inputs:
- **Failing Test Details**: Test name, file, error message, stack trace
- **Recent Changes**: Git commits or PR information since last success
- **Environment Context**: Local vs CI, test runner, Node version
- **Reproduction Steps**: How to consistently reproduce the failure

## Expected Outputs:
- **Root Cause Diagnosis**: Broken feature, broken test, or environment issue
- **Specific Fix Strategy**: Detailed steps to resolve the issue
- **Prevention Measures**: How to avoid similar issues in the future
- **Documentation Updates**: Comments or commit messages explaining the fix 