# 🧪 Current Unit Tests Failures
  
  [✓ Date compliance: All dates generated via command] **Last Updated:** Wednesday, July 02, 2025 at 09:23:48 PM
  **Run:** #6 | **Branch:** refactor/frontend-typescript | **Commit:** ea6e5b4
  **Status:** 13 test:unit failures
  
  ## 🔄 Batch-Fixing Opportunities
  
  ### 🎯 **Assertion Failures** (9 tests)
  - **Common issue:** Expected values not matching actual
  - **First occurrence:** `unit  src/modules/projects/projects.controller.test.ts`

### 💥 **Runtime Failures** (4 tests)
  - **Common issue:** Runtime errors (null/undefined/type errors)
  - **First occurrence:** `unit  src/modules/projects/projects.service.test.ts`
  
  💡 **Tip:** Group similar test failures together for efficient fixing.
  
  ## 🤖 Agent Workflow Instructions
  
  **FOR CLAUDE SUB-AGENTS:** Use this file as your task list. Follow this workflow:
  
  ### 🚀 Parallel Agent Strategy (Up to 6 Agents)
  - **Divide and conquer:** Have up to 6 agents work on different test failure groups simultaneously
  - **Assignment suggestions:**
    - Agent 1-2: Assertion failures (expected vs actual mismatches)
    - Agent 3-4: Setup/configuration failures
    - Agent 5-6: Build failures or test-specific issues
  - **Package division:** Alternatively, assign agents to different packages
  - **Coordination:** Each agent should claim specific test files or failure types
  
  ### 📋 Individual Agent Workflow:
  1. **Check batch opportunities above** - Fix similar failures together
  2. **Pick failures to fix** (group by type or file)
  3. **Fix the test failures** in the codebase
  4. **CRITICAL: Run TypeScript check** - `pnpm brain:typecheck-failures` to ensure no new TS errors
  5. **If TypeScript errors created:** Fix them IMMEDIATELY before proceeding (avoid whack-a-mole!)
  6. **Run:** `pnpm brain:unit-failures` to refresh this file
  7. **Verify** your fixes resolved the failures AND no new TypeScript errors
  8. **Commit** with message format: `fix: resolve [type] test:unit failures`
  
  ⚠️ **IMPORTANT: TypeScript Whack-a-Mole Prevention**
  - ALWAYS check for TypeScript errors after fixing tests
  - DO NOT move to the next test if you created TypeScript errors
  - Fix BOTH the test AND any TypeScript errors before proceeding
  - This prevents backsliding and accumulating technical debt
  
  ### 📋 Commit Strategy:
  - **Few failures (<5):** Individual commits per test
  - **Many failures:** Group by failure type or test file
  
  ## 📊 Quick Summary
  - **Test Type:** Unit Tests
  - **Test Failures:** 13
  - **Packages Tested:** 2
  - **Exit Code:** 1
  
  ## 🎯 Fix These Test Failures (Checkboxes)
  
  - [ ] **💥 runtime** in `unit  src/modules/projects/projects.service.test.ts`
    - **Suite:** projects.service > getSessions
    - **Test:** should handle errors gracefully 12ms (retry x2)
    - **Error:** Cannot read properties of undefined (reading 'error') Cannot read properties of undefined (reading 'error') Cannot read properties of undefined (reading 'error')
    - **Package:** @claude-code-ui/backend

- [ ] **💥 runtime** in `unit  src/modules/projects/projects.service.test.ts`
    - **Suite:** projects.service > getSessionMessages
    - **Test:** should handle errors gracefully 2ms (retry x2)
    - **Error:** Cannot read properties of undefined (reading 'error') Cannot read properties of undefined (reading 'error') Cannot read properties of undefined (reading 'error')
    - **Package:** @claude-code-ui/backend

- [ ] **💥 runtime** in `unit  src/modules/projects/projects.service.test.ts`
    - **Suite:** projects.service > buildProject
    - **Test:** should handle session loading errors 9ms (retry x2)
    - **Error:** Cannot read properties of undefined (reading 'warn')
    - **Package:** @claude-code-ui/backend

- [ ] **💥 runtime** in `unit  src/modules/projects/projects.service.test.ts`
    - **Suite:** projects.service > isProjectEmpty
    - **Test:** should return true when getSessions has error (treats as empty) 4ms (retry x2)
    - **Error:** Cannot read properties of undefined (reading 'error') Cannot read properties of undefined (reading 'error') Cannot read properties of undefined (reading 'error')
    - **Package:** @claude-code-ui/backend

- [ ] **🎯 assertion** in `unit  src/modules/projects/projects.controller.test.ts`
    - **Suite:** projects.controller > getProjects
    - **Test:** should return projects list 428ms (retry x2)
    - **Error:** expected "readProjectDirectories" to be called with arguments: [ '/home/user/.claude/projects' ] Received: 1st readProjectDirectories call:
    - **Package:** @claude-code-ui/backend

- [ ] **🎯 assertion** in `unit  src/modules/projects/projects.controller.test.ts`
    - **Suite:** projects.controller > getSessions
    - **Test:** should return sessions with pagination 10ms (retry x2)
    - **Error:** expected "getSessions" to be called with arguments: [ '/home/user', 'project1', 10, 5 ] Received: 1st getSessions call:
    - **Package:** @claude-code-ui/backend

- [ ] **🎯 assertion** in `unit  src/modules/projects/projects.controller.test.ts`
    - **Suite:** projects.controller > getSessions
    - **Test:** should use default pagination values 6ms (retry x2)
    - **Error:** expected "getSessions" to be called with arguments: [ '/home/user', 'project1', 5, +0 ] Received: 1st getSessions call:
    - **Package:** @claude-code-ui/backend

- [ ] **🎯 assertion** in `unit  src/modules/projects/projects.controller.test.ts`
    - **Suite:** projects.controller > getSessionMessages
    - **Test:** should return session messages 5ms (retry x2)
    - **Error:** expected "getSessionMessages" to be called with arguments: [ Array(3) ] Received: 1st getSessionMessages call:
    - **Package:** @claude-code-ui/backend

- [ ] **🎯 assertion** in `unit  src/modules/projects/projects.watcher.test.ts`
    - **Suite:** projects.watcher > createProjectsWatcher
    - **Test:** should skip closed WebSocket connections 31ms (retry x2)
    - **Error:** expected "spy" to be called 1 times, but got 0 times expected "spy" to be called 1 times, but got 0 times expected "spy" to be called 1 times, but got 0 times
    - **Package:** @claude-code-ui/backend

- [ ] **🎯 assertion** in `unit  src/modules/projects/projects.watcher.test.ts`
    - **Suite:** projects.watcher > createProjectsWatcher
    - **Test:** should handle errors in project list retrieval 166ms (retry x2)
    - **Error:** expected "error" to be called with arguments: [ …(2) ] Number of calls: 0 expected "error" to be called with arguments: [ …(2) ]
    - **Package:** @claude-code-ui/backend

- [ ] **🎯 assertion** in `unit  src/modules/projects/projects.watcher.test.ts`
    - **Suite:** projects.watcher > createProjectsWatcher
    - **Test:** should handle watcher errors 27ms (retry x2)
    - **Error:** expected "error" to be called with arguments: [ '❌ Chokidar watcher error:', …(1) ] Number of calls: 0 expected "error" to be called with arguments: [ '❌ Chokidar watcher error:', …(1) ]
    - **Package:** @claude-code-ui/backend

- [ ] **🎯 assertion** in `unit  src/modules/projects/projects.watcher.test.ts`
    - **Suite:** projects.watcher > createProjectsWatcher
    - **Test:** should log when ready 8ms (retry x2)
    - **Error:** expected "log" to be called with arguments: [ '✅ File watcher ready' ] Number of calls: 0 expected "log" to be called with arguments: [ '✅ File watcher ready' ]
    - **Package:** @claude-code-ui/backend

- [ ] **🎯 assertion** in `unit  src/modules/projects/projects.watcher.test.ts`
    - **Suite:** projects.watcher > createProjectsWatcher
    - **Test:** should handle setup errors 14ms (retry x2)
    - **Error:** expected "error" to be called with arguments: [ …(2) ] Number of calls: 0 expected "error" to be called with arguments: [ …(2) ]
    - **Package:** @claude-code-ui/backend
  
  ## 📦 Failures by Package
  
  ### @claude-code-ui/backend
  - **Test failures:** 13
  - **Types:** runtime, assertion
  
  ## ⚡ Quick Actions
  
  - **Re-run test:unit:** `pnpm brain:unit-failures`
  - **Run with watch:** `pnpm turbo run test:unit -- --watch`
  - **Check specific package:** `cd [package-dir] && pnpm test:unit`
  - **Run with coverage:** `pnpm turbo run test:unit -- --coverage`
  
  ---
  *Updated automatically by test collection script with turbo caching and real-time feedback*
  