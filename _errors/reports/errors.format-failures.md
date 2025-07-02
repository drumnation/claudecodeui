# 🎨 Current Format Issues

[✓ Date compliance: All dates generated via command] **Last Updated:** Wednesday, July 02, 2025 at 11:25:08 AM
**Run:** #3 | **Branch:** refactor/backend-typescript | **Commit:** ae0d37b
**Status:** 7 unformatted files
**✅ Auto-format was applied!** Issues shown are files that could not be auto-formatted.

## 🔄 Quick Fix

### One-Command Fix:
```bash
pnpm turbo run format -- --write
```

This will automatically format all 7 files listed below.


## 🤖 Agent Workflow Instructions

**FOR CLAUDE SUB-AGENTS:** Auto-formatting was already applied. These files may have syntax errors preventing formatting.

### 🚀 Parallel Agent Strategy (Up to 6 Agents)
- **For syntax errors preventing formatting:**
  - Agent 1-2: TypeScript/TSX files with syntax errors
  - Agent 3-4: JavaScript/JSX files with syntax errors  
  - Agent 5-6: JSON/Configuration files with syntax errors
- **Coordination:** Each agent should claim specific file types or directories

### 📋 Individual Agent Workflow:
1. **Run the fix command** above if not already done
2. **If files remain**, they likely have syntax errors - fix those first
3. **Run:** `pnpm brain:format-failures` to verify all issues resolved
4. **Commit** with message: `style: apply prettier formatting`

## 📊 Quick Summary
- **Unformatted Files:** 7
- **Exit Code:** 1
- **Auto-format:** Applied successfully

## 🎯 Files Needing Format (By Extension)

### .js Files (6)

- [ ] `[warn] coverage/block-navigation.js`
- [ ] `[warn] coverage/lcov-report/block-navigation.js`
- [ ] `[warn] coverage/lcov-report/prettify.js`
- [ ] `[warn] coverage/lcov-report/sorter.js`
- [ ] `[warn] coverage/prettify.js`
- [ ] `[warn] coverage/sorter.js`

### .ts Files (1)

- [ ] `[warn] src/modules/sessions/sessions.controller.ts`

## 📦 Files by Package

### @claude-code-ui/backend
- **Unformatted files:** 7

## ⚡ Quick Actions

- **Auto-format all:** `pnpm turbo run format -- --write`
- **Re-check formatting:** `pnpm brain:format-failures`
- **Check specific package:** `cd [package-dir] && pnpm format`
- **Update prettier config:** Review `.prettierrc` settings

---
*Updated automatically by format collection script with turbo caching*
