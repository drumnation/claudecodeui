#!/usr/bin/env tsx

import { execSync, spawn } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import {
  ensureDirectories,
  getCountFilePath,
  getErrorReportPath,
} from "../utils/paths.js";

// Ensure directories exist
ensureDirectories();

// Run count tracking
const RUN_COUNT_FILE = getCountFilePath("test");
let runCount = 1;
try {
  runCount = parseInt(readFileSync(RUN_COUNT_FILE, "utf-8"), 10) + 1;
} catch {
  // File doesn't exist, start at 1
}
writeFileSync(RUN_COUNT_FILE, runCount.toString());

// Get current git info
let branchName = "unknown";
let commitHash = "unknown";
try {
  branchName = execSync("git branch --show-current", {
    encoding: "utf-8",
  }).trim();
  commitHash = execSync("git rev-parse --short HEAD", {
    encoding: "utf-8",
  }).trim();
} catch {
  // Git commands failed
}

// Get current date/time using date command
const currentDate = execSync('date +"%A, %B %d, %Y at %I:%M:%S %p"', {
  encoding: "utf-8",
}).trim();

console.log("🧪 Running tests with turbo (streaming output)...");
console.log(
  "⏱️  This may take a while. Watch for currently running tests below:\n",
);

// Track test failures
interface TestFailure {
  package: string;
  file: string;
  suite: string;
  test: string;
  error: string;
  type: "assertion" | "timeout" | "setup" | "build" | "runtime" | "unknown";
}

const failures: TestFailure[] = [];
const packageFailures = new Map<string, TestFailure[]>();
let testOutput = "";
let currentPackage = "";
let currentFile = "";
let currentSuite = "";
let lastTestTime = Date.now();
let currentTest = "";

// Run tests with turbo, streaming output with --continue to run all tests even if some fail
const testProcess = spawn(
  "pnpm",
  ["turbo", "run", "test:unit", "--filter=*", "--continue"],
  {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, CI: "true" }, // Force non-interactive mode
  },
);

// Function to show current test status
const showCurrentTest = () => {
  if (currentTest) {
    const elapsed = ((Date.now() - lastTestTime) / 1000).toFixed(1);
    process.stdout.write(
      `\r⏳ Running: ${currentTest} (${elapsed}s)          `,
    );
  }
};

// Update test status every 500ms
const statusInterval = setInterval(showCurrentTest, 500);

// Function to strip ANSI escape codes
const stripAnsi = (str: string): string => {
  // Remove all ANSI escape sequences
  return str.replace(/\x1b\[[0-9;]*m/g, "").replace(/\[[0-9;]*m/g, "");
};

// Process stdout
testProcess.stdout?.on("data", (data: Buffer) => {
  const output = data.toString();
  testOutput += output;

  // Parse output for current test info
  const lines = output.split("\n");

  for (let line of lines) {
    if (!line) continue;
    // Strip ANSI codes before processing
    line = stripAnsi(line);
    // Detect package context from turbo output and strip prefix
    // Match pattern: @package:command: content
    const packageMatch = /^(@[^:]+):(\S+):\s*(.*)$/.exec(line);
    if (packageMatch?.[1]) {
      currentPackage = packageMatch[1];
      // Strip the turbo prefix from the line for further parsing
      line = packageMatch[3] || "";
    }

    // Detect TypeScript compilation errors
    const tsErrorMatch =
      /^(.+\.ts)\((\d+),(\d+)\):\s*error\s+TS\d+:\s*(.+)$/.exec(line);
    if (
      tsErrorMatch?.[1] &&
      tsErrorMatch[2] &&
      tsErrorMatch[3] &&
      tsErrorMatch[4] &&
      currentPackage
    ) {
      const failure: TestFailure = {
        package: currentPackage,
        file: tsErrorMatch[1],
        suite: "TypeScript Compilation",
        test: `Line ${tsErrorMatch[2]}, Column ${tsErrorMatch[3]}`,
        error: tsErrorMatch[4],
        type: "build",
      };
      failures.push(failure);
      if (!packageFailures.has(currentPackage)) {
        packageFailures.set(currentPackage, []);
      }
      packageFailures.get(currentPackage)!.push(failure);
    }

    // Detect current test file from vitest output (❯ prefix indicates file)
    const fileMatch = /^\s*❯\s*(.+\.(test|spec)\.(ts|tsx|js|jsx))/.exec(line);
    if (fileMatch?.[1]) {
      currentFile = fileMatch[1];
    }

    // Detect test running (vitest format)
    const runningMatch = /^\s*(?:RUN|RUNS)\s+(.+)/.exec(line);
    if (runningMatch?.[1]) {
      currentTest = runningMatch[1];
      lastTestTime = Date.now();
    }

    // Detect test suite
    const suiteMatch = /^\s*(?:describe|it|test)\s*\(\s*['"`](.+?)['"`]/.exec(
      line,
    );
    if (suiteMatch?.[1]) {
      currentSuite = suiteMatch[1];
    }

    // Parse test failures (vitest format - × or ✕)
    const failMatch = /^\s*(?:✕|×)\s+(.+?)(?:\s+\[.*\])?(?:\s+\d+ms)?$/.exec(
      line,
    );
    if (failMatch?.[1]) {
      const testFullName = failMatch[1].trim();
      // Extract suite and test name from patterns like "Suite > test name"
      const parts = testFullName.split(">").map((p: string) => p.trim());
      const testName =
        parts.length > 1 ? parts[parts.length - 1] : testFullName;
      const suiteName =
        parts.length > 1
          ? parts.slice(0, -1).join(" > ")
          : currentSuite || "Unknown Suite";

      // Check if the test name contains a file path
      let testFile = currentFile || "unknown";
      if (testFullName.includes(".test.") || testFullName.includes(".spec.")) {
        // Extract file from the test full name if it's there
        const fileFromTest = testFullName.split(" ")[0];
        if (
          fileFromTest &&
          (fileFromTest.includes(".test.") || fileFromTest.includes(".spec."))
        ) {
          testFile = fileFromTest;
        }
      }

      const failure: TestFailure = {
        package: currentPackage || "unknown",
        file: testFile || "unknown",
        suite: suiteName,
        test: testName || "unknown",
        error: "", // Will be filled from error output
        type: "unknown",
      };

      // Look for error details in next lines
      let errorCapture = false;
      const errorLines: string[] = [];
      for (let i = lines.indexOf(line) + 1; i < lines.length; i++) {
        let errorLine = lines[i];
        if (!errorLine) continue;

        // Strip ANSI codes from error line first
        errorLine = stripAnsi(errorLine);

        // Strip turbo prefix from error lines too
        const errorLinePackageMatch = /^(@[^:]+):(\S+):\s*(.*)$/.exec(
          errorLine,
        );
        if (errorLinePackageMatch) {
          errorLine = errorLinePackageMatch[3] || "";
        }

        // Stop at next test or file marker (but NOT at → which is an error detail marker)
        if (
          /^\s*(?:✓|✕|×|↓)/.exec(errorLine) ||
          /^\s*(?:describe|it|test)/.exec(errorLine) ||
          /^(@[^:]+:[^:]+:)/.exec(errorLine)
        ) {
          break;
        }

        // Check for error indicators (→ prefix is the main vitest error indicator)
        if (/^\s*→/.exec(errorLine)) {
          errorCapture = true;
          // Clean up the arrow prefix for classification
          const cleanedLine = errorLine.replace(/^\s*→\s*/, "");
          if (
            cleanedLine.includes("expected") ||
            cleanedLine.includes("to equal") ||
            cleanedLine.includes("to be") ||
            cleanedLine.includes("to have")
          ) {
            failure.type = "assertion";
          }
        } else if (
          errorLine.includes("Error:") ||
          errorLine.includes("error TS")
        ) {
          errorCapture = true;
        }

        // Improved error type classification
        if (
          errorLine.includes("AssertionError") ||
          errorLine.includes("expect") ||
          errorLine.includes("Expected") ||
          errorLine.includes("to equal") ||
          errorLine.includes("to be") ||
          errorLine.includes("to have")
        ) {
          failure.type = "assertion";
          errorCapture = true;
        } else if (
          errorLine.includes("timeout") ||
          errorLine.includes("Timeout")
        ) {
          failure.type = "timeout";
          errorCapture = true;
        } else if (
          errorLine.includes("beforeAll") ||
          errorLine.includes("beforeEach") ||
          errorLine.includes("afterAll") ||
          errorLine.includes("afterEach") ||
          errorLine.includes("setup")
        ) {
          failure.type = "setup";
          errorCapture = true;
        } else if (
          errorLine.includes("is not iterable") ||
          errorLine.includes("undefined") ||
          errorLine.includes("null") ||
          errorLine.includes("TypeError") ||
          errorLine.includes("ReferenceError")
        ) {
          failure.type = "runtime";
          errorCapture = true;
        }

        // Capture error lines, especially those with → prefix
        if (errorLine.trim() && !errorLine.includes("❯") && errorCapture) {
          // Clean up the error line
          const cleanError = errorLine.replace(/^\s*→\s*/, "").trim();
          if (cleanError) {
            errorLines.push(cleanError);
          }
        }
      }

      if (errorLines.length > 0) {
        failure.error = errorLines.slice(0, 3).join(" "); // Take first 3 lines
      }

      failures.push(failure);

      // Add to package failures
      if (!packageFailures.has(currentPackage)) {
        packageFailures.set(currentPackage, []);
      }
      packageFailures.get(currentPackage)!.push(failure);
    }

    // Detect vitest config errors
    const vitestConfigError = /Could not resolve.*@kit\/testing\/unit/.exec(
      line,
    );
    if (vitestConfigError && currentPackage) {
      const failure: TestFailure = {
        package: currentPackage,
        file: "vitest.config.ts",
        suite: "Test Configuration",
        test: "Vitest Config",
        error:
          "Vitest config file missing - need to create vitest.config.ts with proper setup",
        type: "setup",
      };
      failures.push(failure);
      if (!packageFailures.has(currentPackage)) {
        packageFailures.set(currentPackage, []);
      }
      packageFailures.get(currentPackage)!.push(failure);
    }

    // Detect build failures
    const buildFailMatch = /ELIFECYCLE\s+Command failed/.exec(line);
    if (buildFailMatch && currentPackage) {
      // Check if we already captured this as a TypeScript error or config error
      const hasSpecificError = failures.some(
        (f) =>
          f.package === currentPackage &&
          (f.type === "build" || f.type === "setup"),
      );
      if (!hasSpecificError) {
        const failure: TestFailure = {
          package: currentPackage,
          file: "package.json",
          suite: "Build Process",
          test: "Build/Test Setup",
          error: "Build failed - check output above for details",
          type: "build",
        };
        failures.push(failure);
        if (!packageFailures.has(currentPackage)) {
          packageFailures.set(currentPackage, []);
        }
        packageFailures.get(currentPackage)!.push(failure);
      }
    }
  }
});

// Process stderr
testProcess.stderr?.on("data", (data: Buffer) => {
  testOutput += data.toString();
});

// Wait for process to complete
testProcess.on("close", (code: number | null) => {
  clearInterval(statusInterval);
  process.stdout.write(
    "\r                                                           \r",
  );

  const exitCode = code || 0;

  // Group failures by type
  const failuresByType = new Map<string, TestFailure[]>();
  failures.forEach((failure: TestFailure) => {
    if (!failuresByType.has(failure.type)) {
      failuresByType.set(failure.type, []);
    }
    failuresByType.get(failure.type)!.push(failure);
  });

  // Generate markdown report
  const markdownContent = `# 🧪 Current Test Failures

[✓ Date compliance: All dates generated via command] **Last Updated:** ${currentDate}
**Run:** #${runCount} | **Branch:** ${branchName} | **Commit:** ${commitHash}
**Status:** ${failures.length} test failures

## 🔄 Batch-Fixing Opportunities

${
  failures.length > 0
    ? Array.from(failuresByType.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .map(([type, typeFailures]) => {
          const emoji =
            type === "assertion"
              ? "🎯"
              : type === "timeout"
                ? "⏱️"
                : type === "setup"
                  ? "🔧"
                  : type === "build"
                    ? "🏗️"
                    : type === "runtime"
                      ? "💥"
                      : "❓";
          return `### ${emoji} **${type.charAt(0).toUpperCase() + type.slice(1)} Failures** (${
            typeFailures.length
          } tests)
- **Common issue:** ${
            type === "assertion"
              ? "Expected values not matching actual"
              : type === "timeout"
                ? "Tests taking too long to complete"
                : type === "setup"
                  ? "Test setup/initialization failing"
                  : type === "build"
                    ? "TypeScript compilation errors preventing tests from running"
                    : type === "runtime"
                      ? "Runtime errors (null/undefined/type errors)"
                      : "Various test issues"
          }
- **First occurrence:** \`${typeFailures[0]?.file || "unknown"}\``;
        })
        .join("\n\n")
    : "### ✅ All tests passing!"
}

💡 **Tip:** Group similar test failures together for efficient fixing.

## 🤖 Agent Workflow Instructions

**FOR CLAUDE SUB-AGENTS:** Use this file as your task list. Follow this workflow:

### 🚀 Parallel Agent Strategy (Up to 6 Agents)
- **Divide and conquer:** Have up to 6 agents work on different test failure groups simultaneously
- **Assignment suggestions:**
  - Agent 1-2: Assertion failures (expected vs actual mismatches)
  - Agent 3-4: Setup/configuration failures
  - Agent 5-6: Build failures or timeout issues
- **Package division:** Alternatively, assign agents to different packages
- **Coordination:** Each agent should claim specific test files or failure types

### 📋 Individual Agent Workflow:
1. **Check batch opportunities above** - Fix similar failures together
2. **Pick failures to fix** (group by type or file)
3. **Fix the test failures** in the codebase
4. **Run:** \`pnpm brain:test-failures\` to refresh this file
5. **Verify** your fixes resolved the failures
6. **Commit** with message format: \`fix: resolve [type] test failures\`

### 📋 Commit Strategy:
- **Few failures (<5):** Individual commits per test
- **Many failures:** Group by failure type or test file

## 📊 Quick Summary
- **Test Failures:** ${failures.length}
- **Exit Code:** ${exitCode}

## 🎯 Fix These Test Failures (Checkboxes)

${
  failures.length > 0
    ? failures
        .map((failure: TestFailure, index: number) => {
          const icon =
            failure.type === "assertion"
              ? "🎯"
              : failure.type === "timeout"
                ? "⏱️"
                : failure.type === "setup"
                  ? "🔧"
                  : failure.type === "build"
                    ? "🏗️"
                    : failure.type === "runtime"
                      ? "💥"
                      : "❓";
          return `- [ ] **${icon} ${failure.type}** in \`${failure.file}\`
  - **Suite:** ${failure.suite}
  - **Test:** ${failure.test}
  - **Error:** ${failure.error || "Check test output for details"}
  - **Package:** ${failure.package}`;
        })
        .join("\n\n")
    : "✅ No test failures to fix!"
}

${
  failures.length > 0
    ? `## 📦 Failures by Package

${Array.from(packageFailures.entries())
  .map(
    ([pkg, pkgFailures]) => `### ${pkg}
- **Test failures:** ${pkgFailures.length}
- **Types:** ${[...new Set(pkgFailures.map((f) => f.type))].join(", ")}`,
  )
  .join("\n\n")}`
    : ""
}

## ⚡ Quick Actions

- **Re-run tests:** \`pnpm brain:test-failures\`
- **Run tests with watch:** \`pnpm turbo run test -- --watch\`
- **Check specific package:** \`cd [package-dir] && pnpm test\`
- **Run with coverage:** \`pnpm turbo run test -- --coverage\`

---
*Updated automatically by test collection script with turbo caching and real-time feedback*
`;

  // Write the markdown file
  writeFileSync(getErrorReportPath("errors.test-failures.md"), markdownContent);

  console.log(`\n📊 Test Summary:`);
  console.log(`- Test failures: ${failures.length}`);
  console.log(`- Report: _errors/errors.test-failures.md`);

  // Exit with appropriate code
  process.exit(failures.length > 0 ? 1 : 0);
});
