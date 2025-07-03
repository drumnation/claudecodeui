# 🚨 Current TypeScript Errors

[✓ Date compliance: All dates generated via command] **Last Updated:** Wednesday, July 2, 2025 at 9:24:17 PM
**Run:** #11 | **Branch:** refactor/frontend-typescript | **Commit:** ea6e5b4
**Status:** 88 errors in 0 packages

## 🔄 Batch-Fixing Opportunities

### 🎯 **HIGH PRIORITY:** Undefined/Null Checks (50 instances)
- **TS2532/TS18048**: Add null/undefined guards (`if (obj?.property)` or `obj && obj.property`)

### 🏗️ **STRUCTURAL:** Interface/Property Issues (15 instances)
- **TS2339/TS2551**: Update interfaces or use optional chaining

### 🔄 **TYPE FIXES:** Assignment Issues (6 instances)
- **TS2322**: Fix type mismatches (Date vs string, etc.)

💡 **Recommended Approach:** Focus on batch patterns above for maximum efficiency

### 🤖 **Claude Integration Tip:**

Copy this error list and prompt Claude in Cursor:
```
Fix these TypeScript errors in batch, prioritizing the high-impact patterns above:
[paste the checkbox list below]
```

## 🤖 Agent Workflow Instructions

**FOR CLAUDE SUB-AGENTS:** Use this file as your task list. Follow this workflow:

### 🚀 Parallel Agent Strategy (Up to 6 Agents)
- **Divide and conquer:** Have up to 6 agents work on different error groups simultaneously
- **Assignment suggestions:**
  - Agent 1-2: High severity errors (TS2345, TS2322, TS2741)
  - Agent 3-4: Import/module errors (TS2307, TS2305)
  - Agent 5-6: Property/undefined errors (TS2339, TS2532, TS18048)
- **Coordination:** Each agent should claim specific files or packages to avoid conflicts

### 📋 Individual Agent Workflow:
1. **Check batch opportunities above** - Prioritize high-impact batch fixes
2. **Pick errors to fix** (use smart grouping strategy below)
3. **Fix the errors** in the codebase
4. **Run:** `pnpm brain:typecheck-failures` to refresh this file
5. **Verify** your fixes removed the errors from the list
6. **Commit** with appropriate messages using `pnpm brain:commit --include-fixes`

### 📋 Commit Strategy (Based on Error Count):
- **≤5 errors:** Individual commits per error (`fix: TS2532 undefined check in pattern-extraction.node.ts:113`)
- **6-15 errors:** Group by file (`fix: resolve TypeScript errors in pattern-extraction.node.ts`)
- **16+ errors:** Group by error type (`fix: add undefined checks for TS2532 errors`)

### 🎯 Current Strategy for 88 errors:
**Group by error type** (`fix: add undefined checks for TS2532 errors`)

## 📊 Quick Summary
- **Errors:** 88 TypeScript issues
- **Failed Packages:** 0
- **Exit Code:** 2

## 🎯 Fix These Errors (Checkboxes)

- [ ] **TS2532** in `init.test.ts` (Line 333)
  - **Path:** `src/init.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 93)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 125)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 150)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 170)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS18048** in `orchestrator.test.ts` (Line 172)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** 'command' is possibly 'undefined'.

- [ ] **TS18048** in `orchestrator.test.ts` (Line 178)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** 'command' is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 200)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS18048** in `orchestrator.test.ts` (Line 202)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** 'command' is possibly 'undefined'.

- [ ] **TS18048** in `orchestrator.test.ts` (Line 205)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** 'command' is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 226)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS18048** in `orchestrator.test.ts` (Line 228)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** 'command' is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 256)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 276)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 297)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS18048** in `orchestrator.test.ts` (Line 298)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** 'command' is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 321)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 345)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 366)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `orchestrator.test.ts` (Line 383)
  - **Path:** `src/orchestrator.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 143)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 144)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 145)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 146)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 163)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 164)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 165)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 181)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 182)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 199)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 200)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 201)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 202)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 216)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 217)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 218)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 258)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 269)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 283)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 284)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 300)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 301)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 302)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 303)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS18048** in `collect-generic.test.ts` (Line 313)
  - **Path:** `src/tasks/collect-generic.test.ts`
  - **Error:** 'reportCall' is possibly 'undefined'.

- [ ] **TS2339** in `detect-tests.test.ts` (Line 32)
  - **Path:** `src/tasks/detect-tests.test.ts`
  - **Error:** Property 'includes' does not exist on type 'PathLike'.

- [ ] **TS2339** in `detect-tests.test.ts` (Line 39)
  - **Path:** `src/tasks/detect-tests.test.ts`
  - **Error:** Property 'includes' does not exist on type 'PathOrFileDescriptor'.

- [ ] **TS2339** in `detect-tests.test.ts` (Line 48)
  - **Path:** `src/tasks/detect-tests.test.ts`
  - **Error:** Property 'includes' does not exist on type 'PathOrFileDescriptor'.

- [ ] **TS2339** in `detect-tests.test.ts` (Line 76)
  - **Path:** `src/tasks/detect-tests.test.ts`
  - **Error:** Property 'includes' does not exist on type 'PathLike'.

- [ ] **TS2339** in `detect-tests.test.ts` (Line 83)
  - **Path:** `src/tasks/detect-tests.test.ts`
  - **Error:** Property 'includes' does not exist on type 'PathOrFileDescriptor'.

- [ ] **TS2339** in `detect-tests.test.ts` (Line 107)
  - **Path:** `src/tasks/detect-tests.test.ts`
  - **Error:** Property 'includes' does not exist on type 'PathLike'.

- [ ] **TS2532** in `detect-tests.test.ts` (Line 126)
  - **Path:** `src/tasks/detect-tests.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `detect-tests.test.ts` (Line 162)
  - **Path:** `src/tasks/detect-tests.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2339** in `detect-tests.test.ts` (Line 222)
  - **Path:** `src/tasks/detect-tests.test.ts`
  - **Error:** Property 'includes' does not exist on type 'PathLike'.

- [ ] **TS2339** in `detect-tests.test.ts` (Line 225)
  - **Path:** `src/tasks/detect-tests.test.ts`
  - **Error:** Property 'includes' does not exist on type 'PathLike'.

- [ ] **TS2532** in `package-discovery.test.ts` (Line 202)
  - **Path:** `src/utils/package-discovery.test.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2339** in `package-discovery.test.ts` (Line 222)
  - **Path:** `src/utils/package-discovery.test.ts`
  - **Error:** Property 'match' does not exist on type 'PathLike | FileHandle'.

- [ ] **TS2345** in `prompt-templates.ts` (Line 46)
  - **Path:** `src/ai-generation/prompt-templates.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS2538** in `prompt-templates.ts` (Line 264)
  - **Path:** `src/ai-generation/prompt-templates.ts`
  - **Error:** Type 'undefined' cannot be used as an index type.

- [ ] **TS2322** in `test-generator.ts` (Line 217)
  - **Path:** `src/ai-generation/test-generator.ts`
  - **Error:** Type 'string | undefined' is not assignable to type 'string'.

- [ ] **TS2322** in `test-generator.ts` (Line 246)
  - **Path:** `src/ai-generation/test-generator.ts`
  - **Error:** Type 'string | undefined' is not assignable to type 'string'.

- [ ] **TS2345** in `test-generator.ts` (Line 355)
  - **Path:** `src/ai-generation/test-generator.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS18048** in `test-generator.ts` (Line 358)
  - **Path:** `src/ai-generation/test-generator.ts`
  - **Error:** 'failingSelector' is possibly 'undefined'.

- [ ] **TS2322** in `test-generator.ts` (Line 460)
  - **Path:** `src/ai-generation/test-generator.ts`
  - **Error:** Type 'UserStory | undefined' is not assignable to type 'UserStory'.

- [ ] **TS2532** in `test-generator.ts` (Line 472)
  - **Path:** `src/ai-generation/test-generator.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2345** in `recursive.ts` (Line 406)
  - **Path:** `src/runners/recursive.ts`
  - **Error:** Argument of type '{ id: string; goal: string; acceptance: never[]; tags: never[]; }' is not assignable to parameter of type 'UserStory'.

- [ ] **TS2554** in `projects.service.ts` (Line 95)
  - **Path:** `src/modules/projects/projects.service.ts`
  - **Error:** Expected 2 arguments, but got 1.

- [ ] **TS2554** in `projects.service.ts` (Line 160)
  - **Path:** `src/modules/projects/projects.service.ts`
  - **Error:** Expected 2 arguments, but got 1.

- [ ] **TS2554** in `projects.service.ts` (Line 268)
  - **Path:** `src/modules/projects/projects.service.ts`
  - **Error:** Expected 2 arguments, but got 1.

- [ ] **TS2554** in `sessions.controller.ts` (Line 77)
  - **Path:** `src/modules/sessions/sessions.controller.ts`
  - **Error:** Expected 4 arguments, but got 3.

- [ ] **TS2339** in `browser.ts` (Line 19)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Property 'env' does not exist on type 'ImportMeta'.

- [ ] **TS2339** in `browser.ts` (Line 20)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Property 'env' does not exist on type 'ImportMeta'.

- [ ] **TS2304** in `browser.ts` (Line 31)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2304** in `browser.ts` (Line 31)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2304** in `browser.ts` (Line 32)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2339** in `browser.ts` (Line 93)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Property 'env' does not exist on type 'ImportMeta'.

- [ ] **TS2339** in `browser.ts` (Line 94)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Property 'env' does not exist on type 'ImportMeta'.

- [ ] **TS2304** in `browser.ts` (Line 111)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2304** in `browser.ts` (Line 111)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2304** in `browser.ts` (Line 112)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2304** in `browser.ts` (Line 136)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2304** in `browser.ts` (Line 136)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2304** in `browser.ts` (Line 137)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2304** in `browser.ts` (Line 137)
  - **Path:** `../../tooling/env-loader/src/browser.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2339** in `browser.ts` (Line 16)
  - **Path:** `../../tooling/logger/src/browser.ts`
  - **Error:** Property 'env' does not exist on type 'ImportMeta'.

- [ ] **TS2339** in `browser.ts` (Line 67)
  - **Path:** `../../tooling/logger/src/browser.ts`
  - **Error:** Property 'env' does not exist on type 'ImportMeta'.

- [ ] **TS2304** in `index.ts` (Line 12)
  - **Path:** `../../tooling/logger/src/index.ts`
  - **Error:** Cannot find name 'window'.

- [ ] **TS2304** in `index.ts` (Line 12)
  - **Path:** `../../tooling/logger/src/index.ts`
  - **Error:** Cannot find name 'window'.

## 📦 Failed Packages

🎉 All packages passed TypeScript checking!

## ⚡ Quick Actions

- **Rerun after fixes:** `pnpm brain:errors`
- **Check specific package:** `cd [package-dir] && pnpm typecheck`
- **Full rebuild:** `pnpm turbo run typecheck --no-cache`

## 📊 Package Error Analysis

### 🎯 Errors by Package

- **@kit/brain-monitor**: 57 errors
- **@claude-code-ui/backend**: 22 errors
- **@kit/testing**: 9 errors

### 🚨 Severity Breakdown by Package

#### @kit/brain-monitor (57 errors, severity score: 114)
- 🟡 **Medium Severity**: 57 errors (property issues, undefined checks)

#### @claude-code-ui/backend (22 errors, severity score: 52)
- 🔴 **High Severity**: 12 errors (syntax, missing declarations, type assignments)
- 🟡 **Medium Severity**: 6 errors (property issues, undefined checks)
- 🟢 **Low Severity**: 4 errors (parameter issues, implicit any)

#### @kit/testing (9 errors, severity score: 22)
- 🔴 **High Severity**: 6 errors (syntax, missing declarations, type assignments)
- 🟡 **Medium Severity**: 2 errors (property issues, undefined checks)

### 🎯 **Recommended Package Priority:**

1. **Focus on high severity scores first** (syntax errors block compilation)
2. **Target packages with many medium severity errors** (undefined checks are often batch-fixable)
3. **Tackle remaining packages by total error count**

---
*Updated automatically by error collection script*
