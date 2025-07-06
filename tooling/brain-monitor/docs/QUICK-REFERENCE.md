# Brain Monitor Quick Reference

## 🚀 Common Commands

### For Development

```bash
# Start watch mode (recommended for development)
pnpm brain:watch              # TypeScript + Lint only (fast)
pnpm brain:watch --all        # All validations

# Check current status
cat _errors/validation-summary.md    # Overall status
cat _errors/watch-summary.md          # If watch mode is active

# Run specific validation
pnpm brain:typecheck-failures         # Just TypeScript
pnpm brain:lint-failures              # Just Lint
```

### For Debugging

```bash
# Start dev servers WITH logging (recommended)
pnpm brain:dev                # Starts servers + captures logs
pnpm dev:with-logs            # Same as above

# Monitor existing server logs (if servers running elsewhere)
pnpm brain:logs               # Only works if log files exist
tail -f _logs/financial-api.log      # Follow specific log

# Run all validations
pnpm brain:validate           # Full validation suite
```

### For CI/CD

```bash
# Set up GitHub Actions
npx brain-monitor ci:init     # Generate workflows
npx brain-monitor ci:test     # Test locally with act
```

## 📁 Directory Structure

```
_errors/
├── validation-summary.md     # CHECK THIS FIRST
├── watch-summary.md         # Live status (if watching)
└── reports/                 # Detailed error reports
    ├── errors.typecheck-failures.md
    ├── errors.lint-failures.md
    └── errors.test-failures-*.md

_logs/
├── index.md                 # Log directory overview
├── financial-api.log        # Server logs (auto-discovered)
└── [app-name].log          # Other app logs
```

## 🔄 Workflow Tips

### Starting a Dev Session

1. Start watch mode: `pnpm brain:watch`
2. Start dev servers: `pnpm dev` (automatically includes logging!)
3. View logs: Check `_logs/` directory or tail specific files

### Before Committing

1. Stop watch mode (Ctrl+C)
2. Run full validation: `pnpm brain:validate`
3. Fix any issues in `_errors/reports/`
4. Commit when all pass

### Multi-Agent Coordination

```bash
# Agent 1: Check before starting
cat _errors/validation-summary.md

# Agent 2: Use watch mode
pnpm brain:watch

# Both: Check specific reports
cat _errors/reports/errors.typecheck-failures.md
```

## ⚡ Performance Tips

1. **Use watch mode** instead of repeatedly running `brain:validate`
2. **Check summaries first** before diving into detailed reports
3. **Run specific validations** when you only need one type
4. **Don't run validations** if reports are < 10 minutes old

## 🎯 Command Comparison

| Need                | Command                    | Speed     |
| ------------------- | -------------------------- | --------- |
| Continuous feedback | `brain:watch`              | ⚡ Fast   |
| Full validation     | `brain:validate`           | 🐢 Slow   |
| Just TypeScript     | `brain:typecheck-failures` | ⚡ Fast   |
| Just tests          | `brain:test-failures-unit` | 🐌 Medium |
| Everything + watch  | `brain:watch --all`        | 🐢 Slow   |

## 🆘 Troubleshooting

### Watch mode not updating?

- Check the throttle interval: `brain:watch --interval 2`
- Make sure you saved the file
- Try restarting watch mode

### Logs not appearing?

- Ensure dev servers are running
- Check `_logs/index.md` for server status
- Restart `pnpm brain:logs`

### CI failing locally?

- Install Docker Desktop
- Run `docker ps` to verify Docker is running
- Use `npx brain-monitor ci:test --help` for options
