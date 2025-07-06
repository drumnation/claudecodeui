# ⚡ Debug Test Performance

**Purpose:** Identify and resolve slow test execution and performance bottlenecks in test suites.

**Use when:** Test suites are running slowly, CI times are increasing, or you need to optimize test performance.

## Instructions:

### 1. **Performance Profiling**

#### **Measure Current Performance**
```bash
# Time test execution
time pnpm test

# Vitest performance profiling
npx vitest run --reporter=verbose --reporter=json > test-results.json

# Playwright performance analysis
npx playwright test --reporter=json > playwright-results.json

# Jest with timing information
npx jest --verbose --detectOpenHandles
```

#### **Identify Slow Tests**
- Run tests with detailed timing output
- Sort tests by execution time
- Identify outliers (tests taking significantly longer)
- Check for tests that timeout or approach timeout limits

### 2. **Common Performance Bottlenecks**

#### **Database Operations**
- Unnecessary database connections per test
- Missing database cleanup between tests
- Complex database seeding for simple tests
- Missing database indexes in test environment

#### **Network Requests**
- Real HTTP requests instead of mocks
- Slow external API calls
- Large file downloads in tests
- Missing request timeout configurations

#### **File System Operations**
- Large file reading/writing operations
- Temporary file creation without cleanup
- Complex file system mocking
- Directory scanning operations

#### **Resource-Heavy Operations**
- Complex computational operations in tests
- Large data set processing
- Image/video processing in tests
- Cryptographic operations

### 3. **Performance Analysis Workflow**

#### **Step 1: Baseline Measurement**
```bash
# Measure full suite performance
pnpm test 2>&1 | tee performance-baseline.log

# Measure individual package performance
pnpm test --filter="@package/name" --reporter=verbose
```

#### **Step 2: Identify Bottlenecks**
- Parse test output for timing information
- Create performance report with slowest tests
- Categorize performance issues by type
- Prioritize optimizations by impact

#### **Step 3: Resource Analysis**
```bash
# Monitor resource usage during tests
top -pid $(pgrep -f "test") -l 0

# Check for memory leaks
node --inspect-brk ./node_modules/.bin/vitest run
```

### 4. **Optimization Strategies**

#### **Database Optimization**
```javascript
// ❌ Slow: Individual database operations
beforeEach(async () => {
  await User.create({ name: 'John' });
  await Post.create({ title: 'Test Post', userId: user.id });
});

// ✅ Fast: Batch operations or fixtures
beforeEach(async () => {
  await seedTestData(); // Pre-built efficient seeder
});
```

#### **Parallel Execution**
```javascript
// Vitest configuration for parallel execution
export default defineConfig({
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 2
      }
    }
  }
});
```

#### **Smart Mocking**
```javascript
// ❌ Slow: Real API calls
const response = await fetch('https://api.example.com/data');

// ✅ Fast: Efficient mocks
vi.mock('node-fetch', () => ({
  default: vi.fn(() => Promise.resolve({
    json: () => Promise.resolve(mockData)
  }))
}));
```

#### **Test Isolation Optimization**
```javascript
// ❌ Slow: Full cleanup after each test
afterEach(async () => {
  await clearDatabase();
  await resetFileSystem();
  await clearCaches();
});

// ✅ Fast: Scoped cleanup
afterEach(async () => {
  await cleanup.onlyChangedTables();
});
```

### 5. **Advanced Performance Techniques**

#### **Test Sharding**
```bash
# Split tests across multiple processes
npx vitest run --shard=1/4  # Run 1st quarter of tests
npx vitest run --shard=2/4  # Run 2nd quarter of tests
```

#### **Selective Test Running**
```bash
# Only run affected tests
pnpm test --changed
pnpm test --related src/components/Button.tsx
```

#### **Resource Pooling**
```javascript
// Share expensive resources across tests
const dbPool = new DatabasePool();

beforeAll(async () => {
  await dbPool.initialize();
});

afterAll(async () => {
  await dbPool.cleanup();
});
```

### 6. **Performance Monitoring**

#### **CI Performance Tracking**
```yaml
# GitHub Actions performance tracking
- name: Run tests with timing
  run: |
    time pnpm test 2>&1 | tee test-performance.log
    echo "Test duration: $(grep 'Test duration' test-performance.log)"
```

#### **Performance Budgets**
```javascript
// Set performance budgets for test suites
const PERFORMANCE_BUDGETS = {
  unit: 30000, // 30 seconds max
  integration: 120000, // 2 minutes max
  e2e: 600000 // 10 minutes max
};
```

### 7. **Environment Optimization**

#### **Node.js Performance**
```bash
# Increase Node.js memory for large test suites
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable Node.js performance optimizations
export NODE_OPTIONS="--optimize-for-size"
```

#### **Test Runner Configuration**
```javascript
// Optimize test runner settings
export default defineConfig({
  test: {
    // Reduce overhead
    isolate: false,
    // Pool reuse
    pool: 'forks',
    // Timeout optimization
    testTimeout: 10000,
    hookTimeout: 5000
  }
});
```

## Expected Inputs:
- **Test Suite Scope**: Which tests to analyze (unit, integration, e2e, specific packages)
- **Performance Baseline**: Current test execution times
- **Resource Constraints**: Available CPU, memory, and time budgets
- **Environment Details**: Local vs. CI, parallel execution settings
- **Priority Level**: Critical slow tests vs. general optimization

## Expected Outputs:
- **Performance Report**: Detailed timing analysis of test execution
- **Bottleneck Identification**: Specific slow tests and root causes
- **Optimization Plan**: Prioritized list of performance improvements
- **Implementation Guide**: Step-by-step optimization instructions
- **Monitoring Setup**: Tools and metrics for ongoing performance tracking
- **Performance Budget**: Recommended performance targets and limits 