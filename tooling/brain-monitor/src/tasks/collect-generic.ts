#!/usr/bin/env tsx

import { execSync, spawn } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import {
  findPackagesWithTests,
  getTestDisplayName,
  getTestFileName,
} from "./detect-tests.js";
import {
  ensureDirectories,
  getCountFilePath,
  getErrorReportPath,
} from "../utils/paths.js";

// Export the main run function for testing
 export async function run(testType?: string): Promise<void> {
   // Get test type from command line or parameter
   const actualTestType = testType || process.argv[2];
   if (!actualTestType) {
     console.error(
       "❌ Please specify a test type (e.g., test:unit, test:integration, test:e2e)",
     );
     process.exit(1);
   }
 
   // Ensure directories exist
   ensureDirectories();
 
   // Run count tracking
   const RUN_COUNT_FILE = getCountFilePath(actualTestType.replace(":", "-"));
   let runCount = 1;
   try {
     runCount = parseInt(readFileSync(RUN_COUNT_FILE, "utf-8")) + 1;
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
 
   // Find packages that have this test type
   const allPackages = findPackagesWithTests();
   const packagesWithTest = allPackages.filter((p) =>
     p.availableTests.includes(actualTestType as any),
   );
 
   if (packagesWithTest.length === 0) {
     console.log(`❌ No packages found with ${actualTestType} tests`);
     process.exit(0);
   }
 
   console.log(`🧪 Running ${getTestDisplayName(actualTestType as any)} with turbo...`);
   console.log(`📦 Found ${packagesWithTest.length} packages with ${actualTestType}`);
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
     type: "assertion" | "timeout" | "setup" | "runtime" | "unknown";
   }
 
   const failures: TestFailure[] = [];
   const packageFailures = new Map<string, TestFailure[]>();
   let testOutput = "";
   let currentPackage = "";
   let currentFile = "";
   let currentSuite = "";
   let lastTestTime = Date.now();
   let currentTest = "";
 
   // Build filter for packages that have this test type
   const packageFilter = packagesWithTest
     .map((p) => `--filter=${p.name}`)
     .join(" ");
 
   // Run tests with turbo, streaming output with --continue to run all tests even if some fail
   const testProcess = spawn(
     "pnpm",
     ["turbo", "run", actualTestType, ...packageFilter.split(" "), "--continue"],
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
  testProcess.stdout?.on("data", (data) => {
    const output = data.toString();
    testOutput += output;
  
    // Parse output for current test info
    const lines = output.split("\n");
  
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      let line = lines[lineIndex];
      // Strip ANSI codes before processing
      line = stripAnsi(line);
      // Detect package context from turbo output and strip prefix
      // Match pattern: @package:command: content
      const packageMatch = line.match(/^(@[^:]+):(\S+):\s*(.*)$/);
      if (packageMatch) {
        currentPackage = packageMatch[1];
        // Strip the turbo prefix from the line for further parsing
        line = packageMatch[3] || "";
      }
  
      // Skip TypeScript compilation errors - these are not test failures
      const tsErrorMatch = line.match(
        /^(.+\.ts)\((\d+),(\d+)\):\s*error\s+TS\d+:\s*(.+)$/,
      );
      if (tsErrorMatch) {
        // Don't add as a test failure, just skip
        continue;
      }
  
      // Detect current test file from vitest output (❯ prefix indicates file)
      const fileMatch = line.match(/^\s*❯\s*(.+\.(test|spec)\.(ts|tsx|js|jsx))/);
      if (fileMatch) {
        currentFile = fileMatch[1];
      }
  
      // Detect test running (vitest format)
      const runningMatch = line.match(/^\s*(?:RUN|RUNS)\s+(.+)/);
      if (runningMatch) {
        currentTest = runningMatch[2];
        lastTestTime = Date.now();
      }
  
      // Detect test suite
      const suiteMatch = line.match(
        /^\s*(?:describe|it|test)\s*\(\s*['"`](.+?)['"`]/,
      );
      if (suiteMatch) {
        currentSuite = suiteMatch[1];
      }
  
      // Parse test failures (vitest format - × or ✕)
      const failMatch = line.match(
        /^\s*(?:✕|×)\s+(.+?)(?:\s+\[.*\])?(?:\s+\d+ms)?$/,
      );
      if (failMatch) {
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
            fileFromTest.includes(".test.") ||
            fileFromTest.includes(".spec.")
          ) {
            testFile = fileFromTest;
          }
        }
  
        const failure: TestFailure = {
          package: currentPackage,
          file: testFile,
          suite: suiteName,
          test: testName,
          error: "", // Will be filled from error output
          type: "unknown",
        };
  
        // Look for error details in next lines
        let errorCapture = false;
        const errorLines: string[] = [];
        for (let i = lineIndex + 1; i < lines.length; i++) {
          let errorLine = lines[i];
  
          // Strip ANSI codes from error line first
          errorLine = stripAnsi(errorLine);
  
          // Strip turbo prefix from error lines too
          const errorLinePackageMatch = errorLine.match(
            /^(@[^:]+):(\S+):\s*(.*)$/,
          );
          if (errorLinePackageMatch) {
            errorLine = errorLinePackageMatch[3] || "";
          }
  
          // Stop at next test or file marker (but NOT at → which is an error detail marker)
          if (
            errorLine.match(/^\s*(?:✓|✕|×|↓)/) ||
            errorLine.match(/^\s*(?:describe|it|test)/) ||
            errorLine.match(/^(@[^:]+:[^:]+:)/)
          ) {
            break;
          }
  
          // Check for error indicators (→ prefix is the main vitest error indicator)
          if (errorLine.match(/^\s*→/)) {
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
            errorLine.includes("ReferenceError") ||
            errorLine.includes("is not a function") ||
            errorLine.includes("Cannot read") ||
            errorLine.includes("Cannot access")
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
      const vitestConfigError = line.match(
        /Could not resolve.*@kit\/testing\/(unit|integration|e2e)/,
      );
      if (vitestConfigError && currentPackage) {
        const failure: TestFailure = {
          package: currentPackage,
          file: "vitest.config.ts",
          suite: "Test Configuration",
          test: "Vitest Config",
          error: `Vitest config file missing - need to create vitest.config.ts for ${vitestConfigError[1]} tests`,
          type: "setup",
        };
        failures.push(failure);
        if (!packageFailures.has(currentPackage)) {
          packageFailures.set(currentPackage, []);
        }
        packageFailures.get(currentPackage)!.push(failure);
      }
  
      // Skip build failures - these are not test failures
      const buildFailMatch = line.match(/ELIFECYCLE\s+Command failed/);
      if (buildFailMatch) {
        // Don't add as a test failure, just skip
        continue;
      }
    }
  });
  
  // Process stderr
  testProcess.stderr?.on("data", (data) => {
    testOutput += data.toString();
  });
  
  // Wait for process to complete
  testProcess.on("close", (code) => {
    clearInterval(statusInterval);
    process.stdout.write(
      "\r                                                           \r",
    );
  
    const exitCode = code || 0;
  
    // Group failures by type
    const failuresByType = new Map<string, TestFailure[]>();
    failures.forEach((failure) => {
      if (!failuresByType.has(failure.type)) {
        failuresByType.set(failure.type, []);
      }
      failuresByType.get(failure.type)!.push(failure);
    });
  
    // Generate markdown report
    const testDisplayName = getTestDisplayName(actualTestType as any);
    const testFileName = getTestFileName(actualTestType as any);
  
    const markdownContent = `# 🧪 Current ${testDisplayName} Failures
  
  [✓ Date compliance: All dates generated via command] **Last Updated:** ${currentDate}
  **Run:** #${runCount} | **Branch:** ${branchName} | **Commit:** ${commitHash}
  **Status:** ${failures.length} ${actualTestType} failures
  
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
    - Agent 5-6: Build failures or test-specific issues
  - **Package division:** Alternatively, assign agents to different packages
  - **Coordination:** Each agent should claim specific test files or failure types
  
  ### 📋 Individual Agent Workflow:
  1. **Check batch opportunities above** - Fix similar failures together
  2. **Pick failures to fix** (group by type or file)
  3. **Fix the test failures** in the codebase
  4. **CRITICAL: Run TypeScript check** - \`pnpm brain:typecheck-failures\` to ensure no new TS errors
  5. **If TypeScript errors created:** Fix them IMMEDIATELY before proceeding (avoid whack-a-mole!)
  6. **Run:** \`pnpm brain:${testFileName}-failures\` to refresh this file
  7. **Verify** your fixes resolved the failures AND no new TypeScript errors
  8. **Commit** with message format: \`fix: resolve [type] ${actualTestType} failures\`
  
  ⚠️ **IMPORTANT: TypeScript Whack-a-Mole Prevention**
  - ALWAYS check for TypeScript errors after fixing tests
  - DO NOT move to the next test if you created TypeScript errors
  - Fix BOTH the test AND any TypeScript errors before proceeding
  - This prevents backsliding and accumulating technical debt
  
  ### 📋 Commit Strategy:
  - **Few failures (<5):** Individual commits per test
  - **Many failures:** Group by failure type or test file
  
  ## 📊 Quick Summary
  - **Test Type:** ${testDisplayName}
  - **Test Failures:** ${failures.length}
  - **Packages Tested:** ${packagesWithTest.length}
  - **Exit Code:** ${exitCode}
  
  ## 🎯 Fix These Test Failures (Checkboxes)
  
  ${
    failures.length > 0
      ? failures
          .map((failure, index) => {
            const icon =
              failure.type === "assertion"
                ? "🎯"
                : failure.type === "timeout"
                  ? "⏱️"
                  : failure.type === "setup"
                    ? "🔧"
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
  
  - **Re-run ${actualTestType}:** \`pnpm brain:${testFileName}-failures\`
  - **Run with watch:** \`pnpm turbo run ${actualTestType} -- --watch\`
  - **Check specific package:** \`cd [package-dir] && pnpm ${actualTestType}\`
  - **Run with coverage:** \`pnpm turbo run ${actualTestType} -- --coverage\`
  
  ---
  *Updated automatically by test collection script with turbo caching and real-time feedback*
  `;
  
    // Write the markdown file
    const outputFileName = `errors.test-failures-${testFileName.replace("test-", "")}.md`;
    writeFileSync(getErrorReportPath(outputFileName), markdownContent);
  
    console.log(`\n📊 ${testDisplayName} Summary:`);
    console.log(`- Test failures: ${failures.length}`);
    console.log(`- Packages tested: ${packagesWithTest.length}`);
    console.log(`- Report: _errors/${outputFileName}`);
  
      // Exit with appropriate code
      process.exit(failures.length > 0 ? 1 : 0);
    });
  }
 
 // Run directly if called as a script
 if (process.argv[1]?.endsWith('collect-generic.ts') || process.argv[1]?.endsWith('collect-generic.js')) {
   run().catch(console.error);
 }
