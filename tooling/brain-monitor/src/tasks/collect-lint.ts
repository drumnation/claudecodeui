#!/usr/bin/env tsx

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import {
  ensureDirectories,
  getCountFilePath,
  getErrorReportPath,
} from "../utils/paths.js";

// Ensure directories exist
ensureDirectories();

// Run count tracking
const RUN_COUNT_FILE = getCountFilePath("lint");
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

// Run lint check with turbo (with auto-fix)
let lintOutput = "";
let exitCode = 0;
let autoFixed = false;

// First try auto-fix with turbo
console.log("🔧 Running lint with auto-fix using turbo...");
try {
  execSync('pnpm turbo run lint --filter="*" -- --fix', {
    encoding: "utf-8",
    stdio: "inherit",
  });
  autoFixed = true;
  console.log("✅ Auto-fix completed! Re-running to check remaining issues...");
} catch (error: any) {
  // Auto-fix may have fixed some issues, continue to check what remains
  autoFixed = true;
}

// Now run lint check to see what issues remain
console.log("🔍 Checking for remaining lint issues...");
try {
  lintOutput = execSync('pnpm turbo run lint --filter="*"', {
    encoding: "utf-8",
  });
} catch (error: any) {
  lintOutput = error.stdout || "";
  exitCode = error.status || 1;
}

// Parse lint output
interface LintIssue {
  file: string;
  line: number;
  column: number;
  severity: "error" | "warning";
  message: string;
  rule: string;
}

const issues: LintIssue[] = [];
const packageErrors = new Map<string, LintIssue[]>();

// Parse ESLint output (looking for patterns like: file.ts:10:5  error  Message  rule-name)
const lines = lintOutput.split("\n");
let currentPackage = "";

for (const line of lines) {
  // Detect package context from turbo output
  const packageMatch = /(@[^:]+):/.exec(line);
  if (packageMatch?.[1]) {
    currentPackage = packageMatch[1];
  }

  // Parse ESLint issue lines
  const issueMatch =
    /^(.+):(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+(@?\S+)$/.exec(line);
  if (
    issueMatch?.[1] &&
    issueMatch[2] &&
    issueMatch[3] &&
    issueMatch[4] &&
    issueMatch[5] &&
    issueMatch[6]
  ) {
    const [, file, lineNum, column, severity, message, rule] = issueMatch;
    const issue: LintIssue = {
      file: file.trim(),
      line: parseInt(lineNum, 10),
      column: parseInt(column, 10),
      severity: severity as "error" | "warning",
      message: message.trim(),
      rule: rule.trim(),
    };

    issues.push(issue);

    // Add to package errors
    if (!packageErrors.has(currentPackage)) {
      packageErrors.set(currentPackage, []);
    }
    packageErrors.get(currentPackage)!.push(issue);
  }
}

// Count errors and warnings
const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;

// Group issues by rule for batch fixing
const issuesByRule = new Map<string, LintIssue[]>();
issues.forEach((issue: LintIssue) => {
  if (!issuesByRule.has(issue.rule)) {
    issuesByRule.set(issue.rule, []);
  }
  issuesByRule.get(issue.rule)!.push(issue);
});

// Generate markdown report
const markdownContent = `# 🔍 Current Lint Issues

[✓ Date compliance: All dates generated via command] **Last Updated:** ${currentDate}
**Run:** #${runCount} | **Branch:** ${branchName} | **Commit:** ${commitHash}
**Status:** ${errorCount} errors, ${warningCount} warnings
${
  autoFixed
    ? "**✅ Auto-fix was applied!** Issues shown are those that require manual intervention."
    : ""
}

## 🔄 Batch-Fixing Opportunities

${Array.from(issuesByRule.entries())
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 5)
  .map(([rule, ruleIssues]) => {
    const isError = ruleIssues.some((i) => i.severity === "error");
    const firstIssue = ruleIssues[0];
    if (!firstIssue) return "";
    return `### ${isError ? "🔴" : "🟡"} **${rule}** (${ruleIssues.length} instances)
- **Example:** ${firstIssue.message}
- **First occurrence:** \`${firstIssue.file}:${firstIssue.line}\``;
  })
  .join("\n\n")}

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
4. **Run:** \`pnpm brain:lint-failures\` to refresh this file
5. **Verify** your fixes resolved the issues
6. **Commit** with message format: \`fix: resolve [rule-name] lint issues\`

### 📋 Commit Strategy:
- **Few issues (<10):** One commit per rule type
- **Many issues:** Group by severity (errors first, then warnings)

## 📊 Quick Summary
- **Errors:** ${errorCount}
- **Warnings:** ${warningCount}
- **Exit Code:** ${exitCode}
${autoFixed ? "- **Auto-fix:** Applied successfully" : ""}

## 🎯 Fix These Issues (Checkboxes)

${issues
  .sort((a, b) => {
    // Sort by severity (errors first), then by file and line
    if (a.severity !== b.severity) {
      return a.severity === "error" ? -1 : 1;
    }
    if (a.file !== b.file) {
      return a.file.localeCompare(b.file);
    }
    return a.line - b.line;
  })
  .map((issue) => {
    const icon = issue.severity === "error" ? "❌" : "⚠️";
    return `- [ ] **${icon} ${issue.rule}** in \`${issue.file}\` (Line ${issue.line})
  - **${issue.severity.toUpperCase()}:** ${issue.message}`;
  })
  .join("\n\n")}

## 📦 Issues by Package

${Array.from(packageErrors.entries())
  .filter(([pkg, issues]) => issues.length > 0)
  .map(([pkg, pkgIssues]) => {
    const pkgErrors = pkgIssues.filter((i) => i.severity === "error").length;
    const pkgWarnings = pkgIssues.filter(
      (i) => i.severity === "warning",
    ).length;
    return `### ${pkg}
- **Errors:** ${pkgErrors}
- **Warnings:** ${pkgWarnings}`;
  })
  .join("\n\n")}

## ⚡ Quick Actions

- **Re-run lint check:** \`pnpm brain:lint-failures\`
- **Run lint with auto-fix:** \`pnpm turbo run lint -- --fix\`
- **Check specific package:** \`cd [package-dir] && pnpm lint\`

---
*Updated automatically by lint collection script with turbo caching*
`;

// Write the markdown file
writeFileSync(getErrorReportPath("errors.lint-failures.md"), markdownContent);

console.log(`\n📊 Lint Summary:`);
console.log(`- Errors: ${errorCount}`);
console.log(`- Warnings: ${warningCount}`);
console.log(`- Auto-fix: ${autoFixed ? "Applied" : "Not applied"}`);
console.log(`- Report: _errors/errors.lint-failures.md`);

// Exit with appropriate code
process.exit(errorCount > 0 ? 1 : 0);
