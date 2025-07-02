# 🛠️ Setup Test Environment

**Purpose:** Configure and initialize comprehensive testing infrastructure for new projects or packages.

**Use when:** Setting up testing for a new package, app, migrating test frameworks, or when test infrastructure needs complete configuration.

## Instructions:

### 1. **Project Analysis & Framework Selection**

#### **Analyze Project Type**
- **React/Frontend**: Component testing, visual regression, user interactions
- **Node.js/Backend**: API testing, database integration, service testing  
- **Full-stack**: End-to-end workflows, API + UI integration
- **Library/Package**: Unit testing, API surface testing, compatibility testing

#### **Recommended Test Framework Stack**
```javascript
// Modern Testing Stack (2024)
{
  "unit": "Vitest",           // Fast, ESM-native, Vite integration
  "integration": "Vitest",    // Same runner for consistency
  "e2e": "Playwright",        // Cross-browser, reliable
  "visual": "Chromatic",      // Storybook integration
  "mocking": "MSW",           // API mocking
  "assertions": "Testing Library", // User-centric testing
}
```

### 2. **Test Runner Configuration**

#### **Vitest Setup (Recommended)**
```javascript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Environment
    environment: 'jsdom', // or 'node' for backend
    
    // File patterns
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
    
    // Global setup
    globalSetup: './tests/setup.ts',
    setupFiles: ['./tests/setup-each.ts'],
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['tests/', '**/*.d.ts', '**/*.config.*'],
    },
    
    // Performance
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 2
      }
    }
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests')
    }
  }
});
```

#### **Playwright Setup (E2E)**
```javascript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // Parallel execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: 'html',
  
  // Global setup
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown'),
  
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. **Test Utilities & Helpers**

#### **Test Setup Files**
```javascript
// tests/setup.ts (Global setup)
import { beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

export { server };
```

```javascript
// tests/setup-each.ts (Per-test setup)
import { beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './setup';

beforeEach(() => {
  server.resetHandlers();
});

afterEach(() => {
  cleanup();
});
```

#### **Custom Testing Utilities**
```javascript
// tests/utils/render.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from '../src/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### 4. **Package.json Scripts**

#### **Test Scripts Configuration**
```json
{
  "scripts": {
    // Core test commands
    "test": "vitest",
    "test:run": "vitest run",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    
    // Test types
    "test:unit": "vitest run --config vitest.config.unit.ts",
    "test:integration": "vitest run --config vitest.config.integration.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    
    // Coverage and reporting
    "test:coverage": "vitest run --coverage",
    "test:coverage:open": "vitest run --coverage && open coverage/index.html",
    
    // CI/CD commands
    "test:ci": "vitest run --coverage --reporter=junit --outputFile=test-results.xml",
    "test:e2e:ci": "playwright test --reporter=junit"
  }
}
```

### 5. **Database & API Testing Setup**

#### **Database Testing (Integration)**
```javascript
// tests/database-setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { createDatabase, dropDatabase } from './db-utils';

const TEST_DB_NAME = `test_db_${Date.now()}`;

beforeAll(async () => {
  await createDatabase(TEST_DB_NAME);
  process.env.DATABASE_URL = `postgresql://localhost/${TEST_DB_NAME}`;
});

afterAll(async () => {
  await dropDatabase(TEST_DB_NAME);
});

beforeEach(async () => {
  await truncateAllTables();
});
```

#### **API Mocking with MSW**
```javascript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ]);
  }),
  
  http.post('/api/users', async ({ request }) => {
    const user = await request.json();
    return HttpResponse.json({ id: 3, ...user }, { status: 201 });
  }),
];
```

### 6. **CI/CD Integration**

#### **GitHub Actions Configuration**
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test:ci
      
      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm test:e2e:ci
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            test-results.xml
            playwright-report/
            coverage/
```

### 7. **File Structure**

#### **Recommended Directory Structure**
```
project/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   └── ...
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── helpers.test.ts
│   └── ...
├── tests/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   └── user-flow.spec.ts
│   ├── integration/
│   │   ├── api.test.ts
│   │   └── database.test.ts
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── fixtures.ts
│   ├── utils/
│   │   ├── render.tsx
│   │   └── test-utils.ts
│   ├── setup.ts
│   └── setup-each.ts
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

## Expected Inputs:
- **Project Type**: React app, Node.js API, full-stack, library
- **Existing Dependencies**: Current testing setup (if any)
- **Testing Requirements**: Unit, integration, e2e, visual testing needs
- **Team Preferences**: Framework preferences, CI/CD platform
- **Performance Constraints**: Test execution time budgets

## Expected Outputs:
- **Configuration Files**: Complete test runner configurations
- **Test Utilities**: Custom render functions, helpers, mocks
- **Package Scripts**: Comprehensive npm/pnpm scripts for all test types
- **CI/CD Setup**: Complete workflow configurations
- **Documentation**: Setup guide and testing conventions
- **Example Tests**: Sample tests demonstrating best practices 