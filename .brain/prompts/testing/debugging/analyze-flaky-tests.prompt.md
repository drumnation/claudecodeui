# 🔍 Analyze Flaky Tests

**Purpose:** Identify and diagnose intermittent test failures and flaky behavior patterns.

**Use when:** Tests are failing inconsistently, passing locally but failing in CI, or showing random failure patterns.

## ⚠️ Agent Execution Note
**For AI agents**: Use non-interactive commands for flaky test detection:
- Use `--run` flag to avoid watch modes hanging
- Add `--repeat` or loop commands for multiple test runs
- Use `--reporter=verbose` for detailed failure patterns

## Instructions:

### 1. **Identify Flaky Test Patterns**
- Analyze test failure history over multiple runs
- Look for tests that pass/fail inconsistently without code changes
- Check for environment-dependent failures (local vs. CI)
- Identify timing-sensitive or order-dependent tests

### 2. **Common Flaky Test Causes**

#### **Timing Issues**
- Race conditions in async operations
- Insufficient wait times for DOM updates
- Missing `await` keywords in async tests
- Hard-coded timeouts that are too short

#### **State Management Issues**
- Tests not properly cleaning up after themselves
- Shared global state between tests
- Database or cache not reset between tests
- Test order dependencies

#### **Environment Dependencies**
- Network requests without proper mocking
- File system dependencies
- System clock dependencies
- Browser/environment-specific behavior

#### **Resource Contention**
- Parallel test execution conflicts
- Port conflicts in integration tests
- Database connection limits
- File lock conflicts

### 3. **Flaky Test Detection Strategy**
```bash
# Run tests multiple times to identify flaky patterns (agent-safe)
for i in {1..10}; do
  echo "Run $i:"
  pnpm test:run [test-pattern] || echo "FAILED on run $i"
done

# Use test runner's repeat functionality (non-interactive)
npx vitest run --reporter=verbose --repeat=10 [test-file]
npx playwright test --repeat-each=5 [test-spec]

# For Jest/Vitest with shell loops
for i in {1..5}; do
  npm run test:run -- --testNamePattern="flaky-test" --verbose
done
```

### 4. **Analysis Workflow**

#### **Step 1: Gather Evidence**
- Run the suspected flaky test multiple times (10-20 runs)
- Collect logs from both successful and failed runs
- Note any patterns in failure timing or conditions
- Check if failures correlate with system load or CI queue times

#### **Step 2: Root Cause Analysis**
- Review test code for common flaky patterns
- Check for proper async/await usage
- Verify test isolation and cleanup
- Examine external dependencies and mocking

#### **Step 3: Environment Analysis**
- Compare local vs. CI failure rates
- Check for resource constraints during failures
- Analyze concurrent test execution impacts
- Review test runner configuration

### 5. **Stabilization Strategies**

#### **Timing Fixes**
```javascript
// ❌ Flaky: Hard-coded timeout
await new Promise(resolve => setTimeout(resolve, 100));

// ✅ Stable: Wait for specific condition
await waitFor(() => expect(element).toBeVisible(), { timeout: 5000 });

// ✅ Stable: Proper async handling
await screen.findByRole('button', { name: /submit/i });
```

#### **State Isolation**
```javascript
// ✅ Proper cleanup in each test
afterEach(async () => {
  await cleanup();
  await resetDatabase();
  localStorage.clear();
});
```

#### **Deterministic Mocking**
```javascript
// ✅ Stable: Mock time-dependent functions
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-01'));
```

### 6. **Monitoring & Prevention**
- Set up flaky test detection in CI
- Implement test retry strategies with limits
- Add test stability metrics to dashboards
- Establish flaky test triage processes

## Expected Inputs:
- **Test Names/Patterns**: Specific tests experiencing flakiness
- **Failure Logs**: Error messages and stack traces from failed runs
- **Test Environment**: Local vs. CI, parallel vs. sequential execution
- **Failure Frequency**: How often tests fail (e.g., 3 out of 10 runs)
- **Recent Changes**: Code changes that might have introduced flakiness

## Expected Outputs:
- **Flaky Test Report**: List of identified flaky tests with failure rates
- **Root Cause Analysis**: Likely causes for each flaky test
- **Stabilization Plan**: Specific fixes and improvements for each issue
- **Prevention Recommendations**: Process improvements to avoid future flakiness
- **Monitoring Setup**: Tools and processes for ongoing flaky test detection 