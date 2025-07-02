# CRITICAL: Error Task Lists and Shared Dev Servers

## 🚨 CRITICAL: Check Error Reports FIRST

Before running ANY validation commands, ALWAYS check existing error reports:

```bash
# Check these FIRST (saves 2-5 minutes):
cat _errors/validation-summary.md                    # Overall status
cat _errors/reports/errors.typecheck-failures.md     # TypeScript errors
cat _errors/reports/errors.test-failures-*.md        # Test failures
cat _errors/reports/errors.lint-failures.md          # Lint issues
```

Only run `pnpm brain:validate` if the data is stale (>10 minutes old).

## 🔥 CRITICAL: Development Server Management

### The Golden Rule: ONE SHARED DEV SERVER

- **NEVER** start a new dev server if one is already running
- **ALWAYS** check `_logs/` for existing server logs first
- Multiple agents MUST share the same dev server instance

### Check Before Starting:

```bash
# 1. Simply start the dev servers (logs are automatic now!):
pnpm dev

# 2. View logs in real-time:
tail -f _logs/financial-api.log      # Backend logs
tail -f _logs/financial-ui.log       # Frontend logs
tail -f _logs/financial-lead-agent.log    # Lead agent logs
tail -f _logs/financial-simulation-agent.log  # Simulation agent logs
```

### Why This Matters:

- Starting duplicate servers = port conflicts + wasted resources
- Log monitoring lets ALL agents see server output
- Shared servers = faster development for everyone

## 📋 Task Execution Rules

1. **Read existing reports** → Only re-run if needed
2. **Check server logs** → Reuse existing servers  
3. **One validator at a time** → Prevents conflicts
4. **Update task status immediately** → Keeps team in sync

## 🎯 Quick Reference

| Task | Command | Check First |
|------|---------|-------------|
| TypeScript | `pnpm brain:typecheck-failures` | `_errors/reports/errors.typecheck-failures.md` |
| Tests | `pnpm brain:test-failures-*` | `_errors/reports/errors.test-failures-*.md` |
| Lint | `pnpm brain:lint-failures` | `_errors/reports/errors.lint-failures.md` |
| All Checks | `pnpm brain:validate` | `_errors/validation-summary.md` |
| Dev Server | `pnpm dev` | `_logs/*.log` (automatic!) |

Remember: **Efficiency > Redundancy**. Check first, run second!
