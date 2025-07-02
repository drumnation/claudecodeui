/* eslint-disable no-console */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import chalk from "chalk";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function init(): Promise<void> {
  console.log(chalk.blue("🧠 Initializing brain-monitor..."));

  const rootPkgPath = join(process.cwd(), "package.json");

  // Check if package.json exists
  if (!existsSync(rootPkgPath)) {
    console.error(chalk.red("❌ No package.json found in current directory"));
    process.exit(1);
  }

  const pkg = JSON.parse(readFileSync(rootPkgPath, "utf8"));

  // 1. Merge scripts into package.json
  console.log(chalk.gray("• Adding brain:* scripts to package.json..."));
  const scriptsToAdd = {
    "brain:validate": "brain-monitor validate",
    "brain:watch": "brain-monitor watch",
    "brain:typecheck-failures": "brain-monitor typecheck",
    "brain:lint-failures": "brain-monitor lint",
    "brain:format-failures": "brain-monitor format",
    "brain:logs": "brain-monitor logs",
    "brain:dev": "brain-monitor dev",
    "brain:test-failures-unit": "brain-monitor test unit",
    "brain:test-failures-integration": "brain-monitor test integration",
    "brain:test-failures-e2e": "brain-monitor test e2e",
  };

  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  Object.entries(scriptsToAdd).forEach(([key, value]) => {
    if (!pkg.scripts[key]) {
      pkg.scripts[key] = value;
    }
  });

  // Add workflow integration - replace dev script if it's just "turbo run dev"
  if (pkg.scripts.dev === "turbo run dev") {
    pkg.scripts["dev:original"] = "turbo run dev";
    pkg.scripts.dev = "brain-monitor dev";
    console.log(chalk.green("✅ Enhanced 'pnpm dev' with automatic logging"));
  }

  writeFileSync(rootPkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(chalk.green("✅ Package.json scripts updated"));

  // 2. Create automation docs directory
  const automationDir = join(process.cwd(), "docs", "automation");
  mkdirSync(automationDir, { recursive: true });

  // 3. Check for .cursor/rules directory and copy rule if it exists
  const cursorRulesDir = join(process.cwd(), ".cursor", "rules");
  if (existsSync(cursorRulesDir)) {
    console.log(
      chalk.gray(
        "• Detected .cursor/rules directory, copying brain-monitor rule...",
      ),
    );
    const brainMonitorRuleContent = `# Brain Monitor Error Checking Rules

## 🧠 MANDATORY: Check Brain Monitor Reports First

Before running ANY validation commands, ALWAYS check the brain-monitor reports:

\`\`\`bash
# 1. Check overall validation status FIRST
cat _errors/validation-summary.md

# 2. Check specific error reports if needed
cat _errors/reports/errors.typecheck-failures.md
cat _errors/reports/errors.test-failures-*.md
cat _errors/reports/errors.lint-failures.md
cat _errors/reports/errors.format-failures.md
\`\`\`

## 📁 Brain Monitor Directory Structure

\`\`\`
_errors/
├── validation-summary.md      # Overall status - check this FIRST
├── reports/                   # Detailed error reports
│   ├── errors.typecheck-failures.md
│   ├── errors.lint-failures.md
│   ├── errors.format-failures.md
│   └── errors.test-failures-*.md
└── .counts/                   # Hidden run count tracking

_logs/                         # Real-time server logs
└── [app-name].log
\`\`\`

## 🚀 Brain Monitor Commands

| Task | Command | Output Location |
|------|---------|-----------------|
| All Validations | \`pnpm brain:validate\` | \`_errors/validation-summary.md\` |
| Watch Mode (Fast) | \`pnpm brain:watch\` | \`_errors/watch-summary.md\` + individual reports |
| Watch Mode (All) | \`pnpm brain:watch --all\` | \`_errors/watch-summary.md\` + individual reports |
| TypeScript Only | \`pnpm brain:typecheck-failures\` | \`_errors/reports/errors.typecheck-failures.md\` |
| Lint Only | \`pnpm brain:lint-failures\` | \`_errors/reports/errors.lint-failures.md\` |
| Format Only | \`pnpm brain:format-failures\` | \`_errors/reports/errors.format-failures.md\` |
| Unit Tests | \`pnpm brain:test-failures-unit\` | \`_errors/reports/errors.test-failures-unit.md\` |
| Integration Tests | \`pnpm brain:test-failures-integration\` | \`_errors/reports/errors.test-failures-integration.md\` |
| E2E Tests | \`pnpm brain:test-failures-e2e\` | \`_errors/reports/errors.test-failures-e2e.md\` |
| Server Logs | \`pnpm brain:logs [app]?\` | Real-time log monitoring |

## ⚡ Efficiency Rules

1. **ALWAYS** check \`validation-summary.md\` first - it has error counts for all validations
2. **ONLY** run validations if reports are stale (>10 minutes old)
3. **NEVER** run \`pnpm brain:validate\` if you only need to check one type of error
4. **USE** specific commands (\`brain:typecheck-failures\`, etc.) for targeted validation
5. **PREFER** \`pnpm brain:watch\` for continuous feedback during development
6. **CHECK** \`watch-summary.md\` when watch mode is active

## 🔄 Workflow

1. Check summary: \`cat _errors/validation-summary.md\`
2. If errors exist, check specific report: \`cat _errors/reports/errors.[type]-failures.md\`
3. Fix errors based on the report
4. Run ONLY the specific validation: \`pnpm brain:[type]-failures\`
5. Repeat until clean

Remember: The reports are your task lists - read them first, run commands second!
`;

    const brainMonitorRulePath = join(
      cursorRulesDir,
      "brain-monitor-validation.rules.mdc",
    );
    writeFileSync(brainMonitorRulePath, brainMonitorRuleContent);
    console.log(
      chalk.green(
        "✅ Created .cursor/rules/brain-monitor-validation.rules.mdc",
      ),
    );
  }

  // 4. Copy automation documentation
  console.log(chalk.gray("• Copying automation rules..."));
  const cursorRuleContent = `# CRITICAL: Error Task Lists and Shared Dev Servers

## 🚨 CRITICAL: Check Error Reports FIRST

Before running ANY validation commands, ALWAYS check existing error reports:

\`\`\`bash
# Check these FIRST (saves 2-5 minutes):
cat _errors/validation-summary.md                    # Overall status
cat _errors/reports/errors.typecheck-failures.md     # TypeScript errors
cat _errors/reports/errors.test-failures-*.md        # Test failures
cat _errors/reports/errors.lint-failures.md          # Lint issues
\`\`\`

Only run \`pnpm brain:validate\` if the data is stale (>10 minutes old).

## 🔥 CRITICAL: Development Server Management

### The Golden Rule: ONE SHARED DEV SERVER

- **NEVER** start a new dev server if one is already running
- **ALWAYS** check \`_logs/\` for existing server logs first
- Multiple agents MUST share the same dev server instance

### Check Before Starting:

\`\`\`bash
# 1. Simply start the dev servers (logs are automatic now!):
pnpm dev

# 2. View logs in real-time:
tail -f _logs/financial-api.log      # Backend logs
tail -f _logs/financial-ui.log       # Frontend logs
tail -f _logs/financial-lead-agent.log    # Lead agent logs
tail -f _logs/financial-simulation-agent.log  # Simulation agent logs
\`\`\`

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
| TypeScript | \`pnpm brain:typecheck-failures\` | \`_errors/reports/errors.typecheck-failures.md\` |
| Tests | \`pnpm brain:test-failures-*\` | \`_errors/reports/errors.test-failures-*.md\` |
| Lint | \`pnpm brain:lint-failures\` | \`_errors/reports/errors.lint-failures.md\` |
| All Checks | \`pnpm brain:validate\` | \`_errors/validation-summary.md\` |
| Dev Server | \`pnpm dev\` | \`_logs/*.log\` (automatic!) |

Remember: **Efficiency > Redundancy**. Check first, run second!
`;

  const cursorRulePath = join(automationDir, "CRITICAL-Error-Task-Lists.md");
  writeFileSync(cursorRulePath, cursorRuleContent);
  console.log(chalk.green("✅ Automation rules created"));

  // 4. Update agent instruction files
  console.log(chalk.gray("• Updating agent instruction files..."));
  const includeRef = `\n> include docs/automation/CRITICAL-Error-Task-Lists.md\n`;
  const agentFiles = ["CLAUDE.md", "GEMINI.md", ".clinerules"];

  agentFiles.forEach((file) => {
    const filePath = join(process.cwd(), file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, "utf8");
      if (!content.includes("docs/automation/CRITICAL-Error-Task-Lists.md")) {
        writeFileSync(filePath, content + includeRef);
        console.log(chalk.green(`✅ Updated ${file}`));
      }
    }
  });

  // 5. Ensure _errors and _logs are tracked in git
  console.log(chalk.gray("• Checking .gitignore..."));
  const gitignorePath = join(process.cwd(), ".gitignore");
  if (existsSync(gitignorePath)) {
    const gitignoreContent = readFileSync(gitignorePath, "utf8");
    const lines = gitignoreContent.split("\n");

    // Remove any ignores for _errors and _logs
    const filteredLines = lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed !== "_errors/" &&
        trimmed !== "_logs/" &&
        trimmed !== "_errors" &&
        trimmed !== "_logs"
      );
    });

    if (filteredLines.length !== lines.length) {
      writeFileSync(gitignorePath, filteredLines.join("\n"));
      console.log(
        chalk.green("✅ Updated .gitignore to track _errors/ and _logs/"),
      );
    }
  }

  // 6. Create initial directories
  mkdirSync("_errors", { recursive: true });
  mkdirSync("_logs", { recursive: true });

  // 7. Inject browser console capture into React apps
  console.log(chalk.gray("\n• Setting up browser console capture..."));
  try {
    const {
      injectBrowserCapture,
      generateExpressMiddleware,
      ensureLoggerAsDevDependency,
    } = await import("./init/inject-browser-capture.js");

    // Ensure @kit/logger is in devDependencies
    await ensureLoggerAsDevDependency(process.cwd());
    const results = await injectBrowserCapture(process.cwd());

    let successCount = 0;
    let alreadyInjectedCount = 0;

    for (const result of results) {
      if (result.success) {
        if (result.alreadyInjected) {
          alreadyInjectedCount++;
          console.log(chalk.gray(`  - ${result.file} (already configured)`));
        } else {
          successCount++;
          console.log(
            chalk.green(`  ✅ Injected console capture into ${result.file}`),
          );
        }
      } else {
        console.log(
          chalk.yellow(
            `  ⚠️  Failed to inject into ${result.file}: ${result.error}`,
          ),
        );
      }
    }

    if (successCount > 0) {
      console.log(
        chalk.green(
          `✅ Browser console capture injected into ${successCount} file(s)`,
        ),
      );

      // Generate middleware snippet
      const middlewareSnippet = await generateExpressMiddleware();
      const middlewarePath = join(
        process.cwd(),
        "docs",
        "automation",
        "brain-monitor-express-setup.md",
      );
      writeFileSync(
        middlewarePath,
        `# Brain-Monitor Express Setup\n\n${middlewareSnippet}`,
      );

      console.log(
        chalk.yellow(
          "\n⚠️  Important: Add the Brain-Monitor Express middleware to your backend:",
        ),
      );
      console.log(
        chalk.gray("   See: docs/automation/brain-monitor-express-setup.md"),
      );
    } else if (alreadyInjectedCount > 0) {
      console.log(chalk.gray("✅ Browser console capture already configured"));
    }
  } catch (error) {
    console.log(chalk.yellow("⚠️  Browser console capture setup skipped"));
  }

  // 8. Ask about CI setup
  console.log(chalk.gray("\n• Setting up CI/CD..."));
  try {
    const { initCI } = await import("./ci/init.js");
    await initCI();
  } catch (error) {
    console.log(chalk.yellow("⚠️  CI setup skipped (optional)"));
  }

  console.log(chalk.green("\n✅ brain-monitor initialized successfully!"));
  console.log(chalk.yellow("\nNext steps:"));
  console.log("  1. Run `pnpm brain:validate` to generate initial reports");
  console.log(
    "  2. Run `pnpm dev` to start dev servers with automatic logging",
  );
  console.log("  3. Check `_errors/` for validation reports");
  console.log("  4. Check `_logs/` for server logs");
  console.log("  5. Browser logs will appear in `_logs/browser-console.log`");
  console.log("  6. Test CI locally: `pnpm ci:test` (requires act)");

  if (pkg.scripts.dev === "brain-monitor dev") {
    console.log(chalk.green("\n🎉 Your dev workflow has been enhanced!"));
    console.log(
      chalk.gray("   'pnpm dev' now includes automatic logging and monitoring"),
    );
    console.log(
      chalk.gray("   To use the original dev command: pnpm dev:original"),
    );
  }
}
