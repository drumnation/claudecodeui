import { execSync, spawn } from "child_process";
import { writeFileSync } from "fs";
import {
  findPackagesWithTests,
  getTestDisplayName,
  getTestFileName,
  type TestType,
} from "./tasks/detect-tests.js";
import { ensureDirectories, getErrorReportPath } from "./utils/paths.js";
import type { ValidationTask, TaskResult, TestPackage } from "./types.js";

// Build validation tasks dynamically
function buildValidationTasks(): ValidationTask[] {
  // Ensure directories exist
  ensureDirectories();

  // Find all available test types
  const packages = findPackagesWithTests();
  const usedTestTypes = new Set(
    packages.flatMap((p: TestPackage) => p.availableTests),
  );

  // Create test collectors for each used test type
  const testCollectors: ValidationTask[] = Array.from(usedTestTypes).map(
    (testType) => ({
      name: getTestDisplayName(testType as TestType),
      script: `brain-monitor test ${testType}`,
      emoji: "🧪",
      outputFile: getErrorReportPath(
        `errors.test-failures-${getTestFileName(testType as TestType)}.md`,
      ),
    }),
  );

  // Add static validation tasks
  const staticTasks: ValidationTask[] = [
    {
      name: "TypeScript",
      script: "brain-monitor typecheck",
      emoji: "🔍",
      outputFile: getErrorReportPath("errors.typecheck-failures.md"),
    },
    {
      name: "Linting",
      script: "brain-monitor lint",
      emoji: "📋",
      outputFile: getErrorReportPath("errors.lint-failures.md"),
    },
    {
      name: "Formatting",
      script: "brain-monitor format",
      emoji: "🎨",
      outputFile: getErrorReportPath("errors.format-failures.md"),
    },
  ];

  return [...staticTasks, ...testCollectors];
}

// Define validation tasks
const VALIDATION_TASKS: ValidationTask[] = buildValidationTasks();

// ANSI color codes
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

const results: TaskResult[] = [];

// Get current date/time
const startTime = Date.now();
const currentDate = execSync('date +"%A, %B %d, %Y at %I:%M:%S %p"', {
  encoding: "utf-8",
}).trim();

console.log(
  `${COLORS.cyan}${COLORS.bold}🚀 Running All Validations in Parallel${COLORS.reset}`,
);
console.log(`${COLORS.gray}Started at: ${currentDate}${COLORS.reset}`);
console.log(
  `${COLORS.yellow}📝 Note: Lint and Format will attempt auto-fix first${COLORS.reset}\n`,
);

// Progress bar function
const updateProgress = (completed: number, total: number) => {
  const percentage = Math.round((completed / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((completed / total) * barLength);
  const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);

  // Check if stdout is a TTY before using TTY-specific methods
  if (process.stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(
      `Progress: ${COLORS.cyan}${bar}${COLORS.reset} ${percentage}% (${completed}/${total})`,
    );
  } else {
    console.log(`Progress: ${bar} ${percentage}% (${completed}/${total})`);
  }
};

// Run a single validation task
const runValidation = (task: ValidationTask): Promise<TaskResult> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    console.log(
      `${task.emoji} Starting ${task.name} validation${
        task.name === "Linting" || task.name === "Formatting"
          ? " (with auto-fix)"
          : ""
      }...`,
    );

    // For brain-monitor commands, run through npx
    const command = task.script.startsWith("brain-monitor")
      ? `npx ${task.script}`
      : task.script;

    const child = spawn("sh", ["-c", command], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    });

    let output = "";
    let errorOutput = "";

    child.stdout?.on("data", (data: Buffer) => {
      output += data.toString();
    });

    child.stderr?.on("data", (data: Buffer) => {
      errorOutput += data.toString();
    });

    child.on("close", (code: number | null) => {
      const duration = Date.now() - startTime;
      const success = code === 0;

      // Try to extract error count from output
      let errorCount = 0;
      let autoFixed = false;

      if (task.name === "TypeScript") {
        const match = /(\d+) errors in \d+ packages/.exec(output);
        if (match?.[1]) errorCount = parseInt(match[1], 10);
      } else if (task.name.includes("Tests")) {
        const match = /Test failures: (\d+)/.exec(output);
        if (match?.[1]) errorCount = parseInt(match[1], 10);
      } else if (task.name === "Linting") {
        const errorMatch = /Errors: (\d+)/.exec(output);
        const warningMatch = /Warnings: (\d+)/.exec(output);
        if (errorMatch?.[1]) errorCount = parseInt(errorMatch[1], 10);
        if (warningMatch?.[1]) errorCount += parseInt(warningMatch[1], 10);
        autoFixed = output.includes("Auto-fix: Applied");
      } else if (task.name === "Formatting") {
        const match = /Unformatted files: (\d+)/.exec(output);
        if (match?.[1]) errorCount = parseInt(match[1], 10);
        autoFixed = output.includes("Auto-format: Applied");
      }

      resolve({
        task,
        success,
        duration,
        errorCount,
        autoFixed,
      });
    });
  });
};

// Run all validations in parallel
const runAllValidations = async () => {
  const promises = VALIDATION_TASKS.map((task) => runValidation(task));

  // Track progress
  let completed = 0;
  const progressInterval = setInterval(() => {
    updateProgress(completed, VALIDATION_TASKS.length);
  }, 100);

  // Wait for all tasks to complete
  for (const promise of promises) {
    const result = await promise;
    results.push(result);
    completed++;

    // Log completion
    const statusEmoji = result.success ? "✅" : "❌";
    const statusColor = result.success ? COLORS.green : COLORS.red;
    const timeStr = `${(result.duration / 1000).toFixed(1)}s`;

    if (process.stdout.isTTY) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
    }
    console.log(
      `${statusEmoji} ${result.task.name}: ${statusColor}${result.success ? "PASSED" : "FAILED"}${
        COLORS.reset
      } ` +
        `(${timeStr})` +
        (result.errorCount
          ? ` - ${COLORS.yellow}${result.errorCount} issues${COLORS.reset}`
          : "") +
        (result.autoFixed ? ` ${COLORS.blue}[auto-fixed]${COLORS.reset}` : ""),
    );
  }

  clearInterval(progressInterval);
  updateProgress(VALIDATION_TASKS.length, VALIDATION_TASKS.length);
  console.log("\n");
};

// Generate summary report
const generateSummary = () => {
  const totalDuration = Date.now() - startTime;
  const failedTasks = results.filter((r) => !r.success);
  const totalIssues = results.reduce((sum, r) => sum + (r.errorCount || 0), 0);
  const autoFixedTasks = results.filter((r) => r.autoFixed);

  // Generate summary markdown
  const summaryFile = getErrorReportPath("validation-summary.md");
  const summaryContent = `# 🔍 Validation Summary Report

[✓ Date compliance: All dates generated via command] **Generated:** ${currentDate}
**Total Duration:** ${(totalDuration / 1000).toFixed(1)}s
**Overall Status:** ${
    failedTasks.length === 0
      ? "✅ All validations passed!"
      : `❌ ${failedTasks.length} validation(s) failed`
  }
**Total Issues Found:** ${totalIssues}
**Auto-fix Applied:** ${autoFixedTasks.map((t) => t.task.name).join(", ") || "None"}

## 🚦 Quick Status
${results
  .map((r) => {
    const emoji = r.success ? "🟢" : "🔴";
    const status = r.success ? "Passed ✓" : `${r.errorCount || 0} errors`;
    return `- ${emoji} **${r.task.name}**: ${status}`;
  })
  .join("\n")}

## 📊 Validation Results

| Validation | Status | Duration | Issues | Auto-Fixed | Report |
|------------|--------|----------|--------|------------|---------|
${results
  .map((r) => {
    const status = r.success ? "✅ Passed" : "❌ Failed";
    const duration = `${(r.duration / 1000).toFixed(1)}s`;
    const issues = r.errorCount || 0;
    const autoFixed = r.autoFixed ? "✅ Yes" : "-";
    const reportLink = `[View Report](${r.task.outputFile})`;
    return `| ${r.task.emoji} ${r.task.name} | ${status} | ${duration} | ${issues} | ${autoFixed} | ${reportLink} |`;
  })
  .join("\n")}

## 🎯 Quick Actions

${
  failedTasks.length > 0
    ? `### Priority Fixes Required

${failedTasks
  .map((t) => {
    if (t.task.name === "Formatting" && !t.success) {
      return `- Fix ${t.task.name} issues: Manual intervention needed - [View ${t.task.outputFile}](${t.task.outputFile})`;
    } else if (t.task.name === "Linting" && !t.success) {
      return `- Fix ${t.task.name} issues: Manual fixes required - [View ${t.task.outputFile}](${t.task.outputFile})`;
    }
    return `- Fix ${t.task.name} issues: [View ${t.task.outputFile}](${t.task.outputFile})`;
  })
  .join("\n")}

### Recommended Order:
1. **TypeScript errors** - Must be fixed manually for compilation
2. **Lint issues** - Remaining issues after auto-fix
3. **Format issues** - Files that couldn't be auto-formatted
4. **Test failures** - Fix broken functionality
`
    : `### Next Steps:
- Consider adding more tests
- Review code coverage
- Update documentation
`
}

## ⚡ Quick Commands

- **Re-run all validations:** \`pnpm brain:validate\`
- **Individual validations:**
  - TypeScript: \`pnpm brain:typecheck-failures\`
  - Unit Tests: \`pnpm brain:test-failures-unit\`
  - Integration Tests: \`pnpm brain:test-failures-integration\`
  - E2E Tests: \`pnpm brain:test-failures-e2e\`
  - Linting: \`pnpm brain:lint-failures\`
  - Formatting: \`pnpm brain:format-failures\`

## 📈 Performance

- **Parallel Execution:** All ${VALIDATION_TASKS.length} validations ran simultaneously
- **Total Time:** ${(totalDuration / 1000).toFixed(1)}s
- **Average Time per Task:** ${(totalDuration / 1000 / VALIDATION_TASKS.length).toFixed(1)}s
- **Turbo Caching:** Enabled for all validations

---

_Generated by validation orchestrator with turbo caching and auto-fix_
`;

  writeFileSync(summaryFile, summaryContent);
  console.log(
    `${COLORS.blue}📄 Summary report generated: ${summaryFile}${COLORS.reset}\n`,
  );
};

// Export the main run function
export async function run(): Promise<void> {
  try {
    await runAllValidations();
    generateSummary();

    // Final summary
    const failedCount = results.filter((r) => !r.success).length;
    const totalIssues = results.reduce(
      (sum, r) => sum + (r.errorCount || 0),
      0,
    );
    const autoFixedCount = results.filter((r) => r.autoFixed).length;

    console.log(`${COLORS.bold}📊 Final Summary:${COLORS.reset}`);
    console.log(`${COLORS.gray}────────────────${COLORS.reset}`);

    results.forEach((r) => {
      const statusEmoji = r.success ? "✅" : "❌";
      const issueText = r.errorCount ? ` (${r.errorCount} issues)` : "";
      const autoFixText = r.autoFixed ? " [auto-fixed]" : "";
      console.log(`${statusEmoji} ${r.task.name}${issueText}${autoFixText}`);
    });

    console.log(`${COLORS.gray}────────────────${COLORS.reset}`);

    if (autoFixedCount > 0) {
      console.log(
        `\n${COLORS.blue}🔧 Auto-fix was applied to ${autoFixedCount} validation(s)${COLORS.reset}`,
      );
    }

    if (failedCount === 0) {
      console.log(
        `\n${COLORS.green}${COLORS.bold}🎉 All validations passed!${COLORS.reset}`,
      );
    } else {
      console.log(
        `\n${COLORS.red}${COLORS.bold}❌ ${failedCount} validation(s) failed with ${totalIssues} total issues${COLORS.reset}`,
      );
      console.log(
        `${COLORS.yellow}Check the individual reports in _errors/ for details${COLORS.reset}`,
      );
    }

    // Exit with appropriate code
    process.exit(failedCount > 0 ? 1 : 0);
  } catch (error) {
    console.error(
      `\n${COLORS.red}Error running validations:${COLORS.reset}`,
      error,
    );
    process.exit(1);
  }
}

// If run directly (for backwards compatibility)
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
