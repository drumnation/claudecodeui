# 🔍 Current Lint Issues

[✓ Date compliance: All dates generated via command] **Last Updated:** Tuesday, July 01, 2025 at 03:07:25 PM
**Run:** #102 | **Branch:** main | **Commit:** 163ebf5
**Status:** 0 errors, 0 warnings
**✅ Auto-fix was applied!** Issues shown are those that require manual intervention.

## 🔄 Batch-Fixing Opportunities

💡 **Tip:** Many ESLint rules can be auto-fixed. This script already ran auto-fix, so these require manual attention.

## 🤖 Agent Workflow Instructions

**FOR CLAUDE SUB-AGENTS:** These lint issues need manual fixes. Follow this workflow:

### 🚀 Parallel Agent Strategy (Up to 6 Agents)

- **Divide and conquer:** Have up to 6 agents work on different lint rules simultaneously
- **Assignment suggestions:**
  - Agent 1: @typescript-eslint errors
  - Agent 2: react-hooks and react related rules
  - Agent 3: import/export and module rules
  - Agent 4: Code style and formatting issues
  - Agent 5-6: Package-specific issues or warnings
- **Coordination:** Each agent should claim specific rules or packages to avoid conflicts

### 📋 Individual Agent Workflow:

1. **Auto-fix already applied** - These are the remaining manual fixes needed
2. **Pick issues to fix** (group by rule for efficiency)
3. **Fix the issues** in the codebase
4. **Run:** `pnpm brain:lint-failures` to refresh this file
5. **Verify** your fixes resolved the issues
6. **Commit** with message format: `fix: resolve [rule-name] lint issues`

### 📋 Commit Strategy:

- **Few issues (<10):** One commit per rule type
- **Many issues:** Group by severity (errors first, then warnings)

## 📊 Quick Summary

- **Errors:** 0
- **Warnings:** 0
- **Exit Code:** 2
- **Auto-fix:** Applied successfully

## 🎯 Fix These Issues (Checkboxes)

## 📦 Issues by Package

## ⚡ Quick Actions

- **Re-run lint check:** `pnpm brain:lint-failures`
- **Run lint with auto-fix:** `pnpm turbo run lint -- --fix`
- **Check specific package:** `cd [package-dir] && pnpm lint`

---

_Updated automatically by lint collection script with turbo caching_
