# 🔍 Code Style Review Checklist 

## 📋 Required Style Fixes

1. Indentation and Spacing (format):
   - ⇥ Verify consistent indentation levels
   - 📏 Fix irregular line spacing between blocks
   - ↔️ Correct horizontal spacing around operators
   - 🔍 Address any mixed tabs/spaces
   - ⚡ Break up overly long lines (>80 characters)

2. Code Cleanliness (cleanup):
   - 🗑️ Remove unused imports and dependencies
   - ⚰️ Delete dead/commented-out code
   - 🧹 Clean up unused variables and functions
   - 💨 Remove redundant or duplicate code
   - 🎯 Delete debugging statements and console logs

3. Naming Conventions (naming):
   - 🏷️ Fix inconsistent variable naming patterns
   - 📝 Correct function/method naming styles
   - 📂 Address file naming issues
   - 🔤 Update constant and enum naming
   - 📚 Revise class/interface names if needed

4. Syntax Standards (syntax):
   - ⚙️ Fix missing or incorrect semicolons
   - 🔧 Correct bracket placement and style
   - 📐 Address parentheses spacing
   - 🎨 Fix string quote consistency
   - ✨ Correct operator spacing

## 📝 Documentation Requirements

1. Change Documentation:
   - 📄 Add inline comments for complex logic
   - 💬 Explain non-obvious fixes made
   - ❓ Note any uncertain changes needing review
   - 🔍 Document any performance implications
   - 🎯 Highlight areas needing future attention

2. Style Guide Compliance:
   - 📘 Note which style guide rules were applied
   - ⚠️ Document any intentional style exceptions
   - 🔄 Reference relevant linting rules
   - ✅ Confirm compliance with project standards

## 🚀 General Guidelines

- 🔍 Use automated linting tools when possible
- 📊 Group similar changes together
- 🏷️ Label changes by type (formatting/cleanup/naming)
- 📝 Include before/after examples for significant changes
- 🤝 Consider team coding conventions
- 🎯 Focus on maintainability and readability

## ✅ Final Step

- 🔍 Run `pnpm run typecheck` in your terminal to ascertain if typeerrors are fixed.
- ⚠️ IF there are errors, fix them, and run this command again until all suites pass.