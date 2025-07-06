# Brain Monitor - Migration Guide

## Overview

Brain Monitor is a monorepo validation orchestrator that provides:

- Centralized error reporting in `_errors/` directory
- Automatic server log capture in `_logs/` directory
- Watch mode for continuous validation
- GitHub Actions integration
- Multi-agent collaboration support

## Key Features Added in This Session

### 1. **Automatic Server Logging**

- `pnpm dev` now includes automatic log capture
- All 4 servers (frontend, backend, lead-agent, sim-agent) logs are captured
- Logs are written to `_logs/[server-name].log` files
- No separate log monitoring command needed

### 2. **Improved Directory Structure**

```
_errors/
├── validation-summary.md      # Overall status - check this FIRST
├── watch-summary.md          # Live status when watch mode is active
├── reports/                  # Detailed error reports
│   ├── errors.typecheck-failures.md
│   ├── errors.lint-failures.md
│   └── errors.test-failures-*.md
└── .counts/                  # Hidden run count tracking

_logs/
├── index.md                  # Log directory overview
├── financial-api.log         # Backend server logs
├── financial-ui.log          # Frontend server logs
├── financial-lead-agent.log  # Lead agent logs
└── financial-simulation-agent.log # Simulation agent logs
```

### 3. **Watch Mode**

- `pnpm brain:watch` for continuous validation
- Default: TypeScript + Lint only (fast)
- `--all` flag for all validations
- Updates reports in real-time

### 4. **CI/CD Integration**

- `brain-monitor ci:init` generates GitHub Actions workflows
- `brain-monitor ci:test` tests workflows locally with act
- Automatic PR comments with validation results

## Copying to Another Project

### Step 1: Copy the Package

```bash
# From your source project
cp -r tooling/brain-monitor /path/to/target/project/tooling/

# Or if using a packages directory
cp -r tooling/brain-monitor /path/to/target/project/packages/
```

### Step 2: Update package.json Dependencies

Add to your target project's root `package.json`:

```json
{
  "devDependencies": {
    "@kit/brain-monitor": "workspace:*"
  }
}
```

### Step 3: Initialize Brain Monitor

```bash
# In the target project root
pnpm install
npx brain-monitor init
```

This will:

- Add all `brain:*` scripts to package.json
- Create automation documentation
- Set up Cursor IDE rules (if .cursor/rules exists)
- Create \_errors and \_logs directories
- Optionally set up GitHub Actions

### Step 4: Update Dev Command

Replace your existing dev command in `package.json`:

```json
{
  "scripts": {
    "dev": "brain-monitor dev"
  }
}
```

### Step 5: Configure Server List (if different)

Edit `tooling/brain-monitor/src/log/dev-with-logs.ts` to match your servers:

```typescript
const servers: ServerInfo[] = [
  {
    name: "your-frontend",
    command: "pnpm",
    args: ["--filter", "@your-scope/frontend", "dev"],
    color: "cyan",
    logFile: "_logs/your-frontend.log",
  },
  // Add your other servers...
];
```

## Usage in the New Project

### Development Workflow

```bash
# Start development with automatic logging
pnpm dev

# Run validations
pnpm brain:validate      # All validations
pnpm brain:watch        # Watch mode

# Check errors
cat _errors/validation-summary.md
cat _errors/reports/errors.typecheck-failures.md

# View logs
tail -f _logs/your-frontend.log
```

### Multi-Agent Collaboration

Agents should:

1. Check `_errors/validation-summary.md` before running validations
2. Only run validations if reports are >10 minutes old
3. Use specific commands for targeted validation
4. Monitor logs with `tail -f _logs/*.log`

## Customization

### Adding New Validation Types

1. Create a new collector in `src/tasks/`
2. Add to the orchestrator in `src/orchestrator.ts`
3. Add a new script in the init process

### Changing Report Format

Edit the markdown generation in each collector file in `src/tasks/`

### Adjusting Watch Mode

Edit `src/watch.ts` to change:

- Default validations
- Throttle interval
- File change detection patterns

## Troubleshooting

### Servers Not Starting

- Check port conflicts
- Ensure all server packages exist
- Verify filter names match package.json names

### Logs Not Appearing

- Check server output goes to stdout/stderr
- Verify log file paths in dev-with-logs.ts
- Ensure \_logs directory exists

### Validation Errors

- Run `pnpm install` to ensure dependencies
- Check that all config files exist
- Verify TypeScript/ESLint/Prettier configs

## Important Notes

1. **TypeScript Configuration**: Uses `moduleResolution: "NodeNext"` requiring `.js` extensions
2. **ESM Only**: All imports must use `.js` extensions
3. **No Build Step**: Package exports TypeScript directly
4. **Functional Style**: No classes, only functions
5. **Automatic Cleanup**: Dev command kills existing processes before starting

## Support

For issues or improvements:

1. Check existing error reports in `_errors/`
2. Review server logs in `_logs/`
3. Run with `--verbose` flag for debugging
4. Create an issue in the source repository
