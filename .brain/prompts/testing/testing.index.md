# 🧪 Testing Prompt Index

A collection of prompts organized by **action type**, aligned with the **Functional Validation Testing Philosophy**:  
Tests must verify real, observable application behavior with minimal mocking. If the tests pass, the app works. If they fail, something meaningful is broken.

---

## ⚠️ Agent Execution Guidelines

**For AI agents executing test commands**: Always use non-interactive forms to avoid hanging:

```bash
# ✅ Agent-safe commands
npm run test:run              # Instead of npm test
npm run test:ci               # CI-specific non-interactive
pnpm test:run -- --verbose   # Add verbose output for agents
npx vitest run               # Instead of npx vitest
npx playwright test          # Playwright is non-interactive by default

# ❌ Avoid these (interactive/watch modes)
npm test                     # Often defaults to watch mode
npx vitest                   # Defaults to watch mode
npm run test:watch           # Explicitly watch mode
```

**Common flags for agents:**
- `--run` - Force non-interactive mode
- `--reporter=verbose` - Detailed output for debugging
- `--reporter=json` - Structured output for parsing
- `--no-watch` or `--watchAll=false` - Disable watch modes

---

## 📂 Action Categories

### 🏃 **Execution** - Running Tests
Prompts for executing tests and validating results.

- [`run-functional-tests.prompt.md`](./execution/run-functional-tests.prompt.md) - Execute functional tests with auto-detection
- [`validate-after-task.prompt.md`](./execution/validate-after-task.prompt.md) - Post-completion test validation
- [`run-test-suite.prompt.md`](./execution/run-test-suite.prompt.md) - Comprehensive test suite execution with smart filtering

### 🔍 **Analysis** - Evaluating Test Quality & Effectiveness
Prompts for assessing test suite health and quality.

- [`skipped-tests-analysis.prompt.md`](./analysis/skipped-tests-analysis.prompt.md) - Analyze and address skipped tests
- [`test-suite-quality-assessment-agent.prompt.md`](./analysis/test-suite-quality-assessment-agent.prompt.md) - Comprehensive test suite health analysis
- [`test-viability-assessment-agent.prompt.md`](./analysis/test-viability-assessment-agent.prompt.md) - Evaluate test effectiveness and value
- [`prioritize-ai-verification-tests.prompt.md`](./analysis/prioritize-ai-verification-tests.prompt.md) - **🤖 AI-FOCUSED**: Identify tests that enable AI to verify functionality works

### 🔧 **Debugging** - Fixing Broken Tests & Features
Prompts for diagnosing test failures and determining root cause.

- [`analyze-flaky-tests.prompt.md`](./debugging/analyze-flaky-tests.prompt.md) - Identify and fix intermittent test failures
- [`debug-test-performance.prompt.md`](./debugging/debug-test-performance.prompt.md) - Optimize slow test execution
- [`investigate-test-failure.prompt.md`](./debugging/investigate-test-failure.prompt.md) - Determine if failure is broken feature vs broken test

### ✍️ **Creation** - Writing & Planning Tests
Prompts for creating tests and testing strategies.

- [`write-functional-tests.prompt.md`](./creation/write-functional-tests.prompt.md) - Create high-signal functional tests
- [`design-test-strategy-for-feature.prompt.md`](./creation/design-test-strategy-for-feature.prompt.md) - Plan comprehensive testing approach
- [`setup-test-environment.prompt.md`](./creation/setup-test-environment.prompt.md) - Configure testing infrastructure and tooling
- [`generate-test-data.prompt.md`](./creation/generate-test-data.prompt.md) - Create realistic test fixtures and data
- [`write-ai-verification-tests.prompt.md`](./creation/write-ai-verification-tests.prompt.md) - **🤖 AI-FOCUSED**: Write tests that enable AI to verify functionality

### 👁️ **Visual** - Visual Regression Testing
Prompts for visual testing and UI regression detection.

- [`create-visual-regression-checks.prompt.md`](./visual/create-visual-regression-checks.prompt.md) - Add visual regression coverage for components
- [`generate-storybook-snapshots.prompt.md`](./visual/generate-storybook-snapshots.prompt.md) - Create Storybook snapshot tests
- [`setup-visual-testing.prompt.md`](./visual/setup-visual-testing.prompt.md) - Configure comprehensive visual testing infrastructure

---

## 🤖 AI-Assisted Development Focus

**Special emphasis for AI-driven development**: The testing suite serves as AI's primary verification interface. Two key prompts optimize for this:

### **Analysis**: [`prioritize-ai-verification-tests.prompt.md`](./analysis/prioritize-ai-verification-tests.prompt.md)
- Identify which tests actually verify working functionality vs implementation details
- Prioritize tests that give AI meaningful feedback about feature health
- Enable the recursive improvement cycle: code change → test → verify → iterate

### **Creation**: [`write-ai-verification-tests.prompt.md`](./creation/write-ai-verification-tests.prompt.md)  
- Write tests specifically designed for AI verification
- Focus on end-to-end functionality over implementation details
- Create tests that answer "Is this feature working?" not "Is this code correct?"

**Core principle**: Tests should be AI's reliable interface for verifying that functionality actually works, enabling confident recursive improvement.

---

## 🧠 Best Practices

- Pair these prompts with `functional-test-principles.rules.mdc`
- Prefer fast, low-maintenance, real-world test coverage
- Avoid over-relying on coverage %, mocks, or brittle internal checks
- Use action-based prompts based on your current need:
  - **Need to run tests?** → Use **Execution** prompts
  - **Want to assess test quality?** → Use **Analysis** prompts
  - **Tests failing or broken?** → Use **Debugging** prompts  
  - **Need new tests?** → Use **Creation** prompts
  - **UI regression concerns?** → Use **Visual** prompts
  - **Optimizing for AI development?** → Use **🤖 AI-FOCUSED** prompts

---

## 📊 Prompt Status

### ✅ **Complete & Enhanced**
- **Execution**: 3/3 prompts (2 existing + 1 comprehensive new)
- **Analysis**: 4/4 prompts (3 existing + 1 AI-focused new)
- **Debugging**: 3/3 prompts (3 comprehensive new debugging prompts)
- **Creation**: 5/5 prompts (2 existing + 3 comprehensive new including AI-focused)
- **Visual**: 3/3 prompts (2 existing + 1 comprehensive new)

### 🎯 **Quality Improvements Made**
- **Corrected Categorization**: Analysis vs debugging properly distinguished
- **Agent-Safe Commands**: All prompts use non-interactive test execution
- **AI Verification Focus**: Dedicated prompts for AI-driven development cycles
- **Comprehensive Instructions**: All prompts now include detailed step-by-step workflows
- **Practical Examples**: Code samples and configuration examples throughout
- **Modern Tooling**: Focus on Vitest, Playwright, MSW, and Chromatic
- **Monorepo Support**: pnpm workspace and package filtering support
- **CI/CD Integration**: GitHub Actions workflows and automation

---

## 🚀 **Usage Guidelines**

### **Quick Reference by Scenario**
- **Starting new project?** → `creation/setup-test-environment.prompt.md`
- **Need test data?** → `creation/generate-test-data.prompt.md`
- **Test failing unexpectedly?** → `debugging/investigate-test-failure.prompt.md`
- **Tests running slow?** → `debugging/debug-test-performance.prompt.md`
- **Flaky test issues?** → `debugging/analyze-flaky-tests.prompt.md`
- **Want to assess test quality?** → `analysis/test-suite-quality-assessment-agent.prompt.md`
- **🤖 Optimizing for AI development?** → `analysis/prioritize-ai-verification-tests.prompt.md`
- **🤖 Writing tests for AI verification?** → `creation/write-ai-verification-tests.prompt.md`
- **Setting up visual testing?** → `visual/setup-visual-testing.prompt.md`
- **Running comprehensive tests?** → `execution/run-test-suite.prompt.md`

### **Quality Assurance**
All prompts now include:
- **Clear use cases** and when to apply them
- **Detailed instructions** with step-by-step workflows  
- **Expected inputs** and **outputs** for clarity
- **Modern tooling examples** (2024 best practices)
- **Practical code samples** and configurations

