# 🚨 Current TypeScript Errors

[✓ Date compliance: All dates generated via command] **Last Updated:** Tuesday, July 1, 2025 at 3:07:29 PM
**Run:** #104 | **Branch:** main | **Commit:** 163ebf5
**Status:** 35 errors in 0 packages

## 🔄 Batch-Fixing Opportunities

### 🎯 **HIGH PRIORITY:** Undefined/Null Checks (13 instances)

- **TS2532/TS18048**: Add null/undefined guards (`if (obj?.property)` or `obj && obj.property`)

### 🔄 **TYPE FIXES:** Assignment Issues (15 instances)

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

### 🎯 Current Strategy for 35 errors:

**Group by error type** (`fix: add undefined checks for TS2532 errors`)

## 📊 Quick Summary

- **Errors:** 35 TypeScript issues
- **Failed Packages:** 0
- **Exit Code:** 2

## 🎯 Fix These Errors (Checkboxes)

- [ ] **TS2322** in `monitor.ts` (Line 84)

  - **Path:** `src/log/monitor.ts`
  - **Error:** Type 'string | undefined' is not assignable to type 'string'.

- [ ] **TS2345** in `orchestrator.ts` (Line 138)

  - **Path:** `src/orchestrator.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS2345** in `orchestrator.ts` (Line 141)

  - **Path:** `src/orchestrator.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS2345** in `orchestrator.ts` (Line 145)

  - **Path:** `src/orchestrator.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS2345** in `orchestrator.ts` (Line 146)

  - **Path:** `src/orchestrator.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS2345** in `orchestrator.ts` (Line 150)

  - **Path:** `src/orchestrator.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS2322** in `collect-errors.ts` (Line 79)

  - **Path:** `src/tasks/collect-errors.ts`
  - **Error:** Type 'string | undefined' is not assignable to type 'string'.

- [ ] **TS2532** in `collect-errors.ts` (Line 80)

  - **Path:** `src/tasks/collect-errors.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2345** in `collect-errors.ts` (Line 81)

  - **Path:** `src/tasks/collect-errors.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS2345** in `collect-errors.ts` (Line 82)

  - **Path:** `src/tasks/collect-errors.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS2322** in `collect-errors.ts` (Line 83)

  - **Path:** `src/tasks/collect-errors.ts`
  - **Error:** Type 'string | undefined' is not assignable to type 'string'.

- [ ] **TS2322** in `collect-errors.ts` (Line 84)

  - **Path:** `src/tasks/collect-errors.ts`
  - **Error:** Type 'string | undefined' is not assignable to type 'string'.

- [ ] **TS2532** in `collect-errors.ts` (Line 93)

  - **Path:** `src/tasks/collect-errors.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2322** in `collect-format.ts` (Line 73)

  - **Path:** `src/tasks/collect-format.ts`
  - **Error:** Type 'string | undefined' is not assignable to type 'string'.

- [ ] **TS2532** in `collect-generic-test-failures.ts` (Line 260)

  - **Path:** `src/tasks/collect-generic-test-failures.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS7006** in `collect-integration-test-failures.ts` (Line 133)

  - **Path:** `src/tasks/collect-integration-test-failures.ts`
  - **Error:** Parameter 'p' implicitly has an 'any' type.

- [ ] **TS2532** in `collect-integration-test-failures.ts` (Line 341)

  - **Path:** `src/tasks/collect-integration-test-failures.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2322** in `collect-lint.ts` (Line 83)

  - **Path:** `src/tasks/collect-lint.ts`
  - **Error:** Type 'string | undefined' is not assignable to type 'string'.

- [ ] **TS18048** in `collect-lint.ts` (Line 91)

  - **Path:** `src/tasks/collect-lint.ts`
  - **Error:** 'file' is possibly 'undefined'.

- [ ] **TS2345** in `collect-lint.ts` (Line 92)

  - **Path:** `src/tasks/collect-lint.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS2345** in `collect-lint.ts` (Line 93)

  - **Path:** `src/tasks/collect-lint.ts`
  - **Error:** Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

- [ ] **TS18048** in `collect-lint.ts` (Line 95)

  - **Path:** `src/tasks/collect-lint.ts`
  - **Error:** 'message' is possibly 'undefined'.

- [ ] **TS18048** in `collect-lint.ts` (Line 96)

  - **Path:** `src/tasks/collect-lint.ts`
  - **Error:** 'rule' is possibly 'undefined'.

- [ ] **TS2532** in `collect-lint.ts` (Line 142)

  - **Path:** `src/tasks/collect-lint.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `collect-lint.ts` (Line 143)

  - **Path:** `src/tasks/collect-lint.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2532** in `collect-lint.ts` (Line 143)

  - **Path:** `src/tasks/collect-lint.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS2834** in `collect-test-failures-generic.ts` (Line 9)

  - **Path:** `src/tasks/collect-test-failures-generic.ts`
  - **Error:** Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Consider adding an extension to the import path.

- [ ] **TS7006** in `collect-test-failures-generic.ts` (Line 47)

  - **Path:** `src/tasks/collect-test-failures-generic.ts`
  - **Error:** Parameter 'p' implicitly has an 'any' type.

- [ ] **TS7006** in `collect-test-failures-generic.ts` (Line 78)

  - **Path:** `src/tasks/collect-test-failures-generic.ts`
  - **Error:** Parameter 'p' implicitly has an 'any' type.

- [ ] **TS7006** in `collect-test-failures-generic.ts` (Line 159)

  - **Path:** `src/tasks/collect-test-failures-generic.ts`
  - **Error:** Parameter 'p' implicitly has an 'any' type.

- [ ] **TS2532** in `collect-test-failures-generic.ts` (Line 375)

  - **Path:** `src/tasks/collect-test-failures-generic.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS7006** in `collect-test-failures.ts` (Line 139)

  - **Path:** `src/tasks/collect-test-failures.ts`
  - **Error:** Parameter 'p' implicitly has an 'any' type.

- [ ] **TS2532** in `collect-test-failures.ts` (Line 368)

  - **Path:** `src/tasks/collect-test-failures.ts`
  - **Error:** Object is possibly 'undefined'.

- [ ] **TS7006** in `collect-unit-test-failures.ts` (Line 130)

  - **Path:** `src/tasks/collect-unit-test-failures.ts`
  - **Error:** Parameter 'p' implicitly has an 'any' type.

- [ ] **TS2532** in `collect-unit-test-failures.ts` (Line 354)
  - **Path:** `src/tasks/collect-unit-test-failures.ts`
  - **Error:** Object is possibly 'undefined'.

## 📦 Failed Packages

🎉 All packages passed TypeScript checking!

## ⚡ Quick Actions

- **Rerun after fixes:** `pnpm brain:errors`
- **Check specific package:** `cd [package-dir] && pnpm typecheck`
- **Full rebuild:** `pnpm turbo run typecheck --no-cache`

## 📊 Package Error Analysis

### 🎯 Errors by Package

- **@kit/brain-monitor**: 35 errors

### 🚨 Severity Breakdown by Package

#### @kit/brain-monitor (35 errors, severity score: 77)

- 🔴 **High Severity**: 15 errors (syntax, missing declarations, type assignments)
- 🟡 **Medium Severity**: 13 errors (property issues, undefined checks)
- 🟢 **Low Severity**: 6 errors (parameter issues, implicit any)

### 🎯 **Recommended Package Priority:**

1. **Focus on high severity scores first** (syntax errors block compilation)
2. **Target packages with many medium severity errors** (undefined checks are often batch-fixable)
3. **Tackle remaining packages by total error count**

---

_Updated automatically by error collection script_
