import { spawn, ChildProcess } from "child_process";
import { writeFileSync } from "fs";
import { ensureDirectories, getErrorReportPath } from "./utils/paths.js";
import chalk from "chalk";

interface WatchOptions {
  all: boolean;
  interval: number;
}

interface WatchTask {
  name: string;
  script: string;
  process?: ChildProcess;
  status: "running" | "error" | "stopped";
  errorCount: number;
  lastUpdate: Date;
}

export function watch(options: WatchOptions): void {
  console.log(chalk.cyan.bold("🔍 Starting brain-monitor watch mode..."));
  console.log(
    chalk.gray(
      `Mode: ${options.all ? "All validations" : "TypeScript + Lint only"}`,
    ),
  );
  console.log(chalk.gray(`Update throttle: ${options.interval} seconds\n`));

  // Ensure directories exist
  ensureDirectories();

  // Define watch tasks
  const tasks: WatchTask[] = options.all
    ? [
        {
          name: "TypeScript",
          script: "brain-monitor typecheck",
          status: "stopped",
          errorCount: 0,
          lastUpdate: new Date(),
        },
        {
          name: "Lint",
          script: "brain-monitor lint",
          status: "stopped",
          errorCount: 0,
          lastUpdate: new Date(),
        },
        {
          name: "Format",
          script: "brain-monitor format",
          status: "stopped",
          errorCount: 0,
          lastUpdate: new Date(),
        },
        {
          name: "Unit Tests",
          script: "brain-monitor test unit",
          status: "stopped",
          errorCount: 0,
          lastUpdate: new Date(),
        },
        {
          name: "Integration Tests",
          script: "brain-monitor test integration",
          status: "stopped",
          errorCount: 0,
          lastUpdate: new Date(),
        },
        {
          name: "E2E Tests",
          script: "brain-monitor test e2e",
          status: "stopped",
          errorCount: 0,
          lastUpdate: new Date(),
        },
      ]
    : [
        {
          name: "TypeScript",
          script: "brain-monitor typecheck",
          status: "stopped",
          errorCount: 0,
          lastUpdate: new Date(),
        },
        {
          name: "Lint",
          script: "brain-monitor lint",
          status: "stopped",
          errorCount: 0,
          lastUpdate: new Date(),
        },
      ];

  // Track last run times to throttle
  const lastRunTimes = new Map<string, number>();

  // Update watch summary
  const updateWatchSummary = () => {
    const currentDate = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const totalErrors = tasks.reduce((sum, task) => sum + task.errorCount, 0);
    const runningTasks = tasks.filter((t) => t.status === "running").length;

    let content = `# 👁️ Watch Mode Active

[✓ Date compliance: All dates generated via command] **Last Updated:** ${currentDate}
**Mode:** ${options.all ? "🔄 All Validations" : "⚡ Fast Mode (TypeScript + Lint)"}
**Status:** ${runningTasks > 0 ? "🟡 Checking..." : totalErrors > 0 ? "🔴 Errors Found" : "🟢 All Clear"}
**Total Issues:** ${totalErrors}

## 🚦 Quick Status
`;

    tasks.forEach((task) => {
      const emoji =
        task.status === "running" ? "🟡" : task.errorCount === 0 ? "🟢" : "🔴";
      const status =
        task.status === "running"
          ? "Checking..."
          : task.errorCount === 0
            ? "Passed ✓"
            : `${task.errorCount} errors`;
      content += `- ${emoji} **${task.name}**: ${status}\n`;
    });

    content += `
## 📊 Validation Details

| Validation | Status | Issues | Last Check | Report |
|------------|--------|--------|------------|--------|
`;

    tasks.forEach((task) => {
      const status =
        task.status === "running"
          ? "⏳ Running"
          : task.errorCount === 0
            ? "✅ Passed"
            : "❌ Failed";
      const lastCheck = task.lastUpdate.toLocaleTimeString();
      const reportFile = task.name.toLowerCase().replace(" ", "-");
      const reportPath = `[View Report](./reports/errors.${reportFile}-failures.md)`;

      content += `| ${task.name} | ${status} | ${task.errorCount} | ${lastCheck} | ${reportPath} |\n`;
    });

    content += `
## 🔄 Watch Mode Info

- **Watching:** File changes trigger automatic validation
- **Throttling:** Minimum ${options.interval}s between runs per validation
- **Reports:** Individual error reports update in \`_errors/reports/\`

## ⚡ Commands

- **Stop watching:** Press \`Ctrl+C\`
- **Run all validations:** \`pnpm brain:validate\`
- **Watch all validations:** \`pnpm brain:watch --all\`
- **Check specific errors:** View reports in \`_errors/reports/\`

---
*Watch mode active - monitoring file changes*
`;

    writeFileSync(getErrorReportPath("watch-summary.md"), content);
  };

  // Run a single validation
  const runValidation = (task: WatchTask): void => {
    const lastRun = lastRunTimes.get(task.name) || 0;
    const now = Date.now();

    // Throttle runs
    if (now - lastRun < options.interval * 1000) {
      return;
    }

    lastRunTimes.set(task.name, now);
    task.status = "running";
    updateWatchSummary();

    console.log(chalk.blue(`🔄 Running ${task.name} validation...`));

    const proc = spawn("npx", task.script.split(" "), {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });

    let output = "";
    let errorOutput = "";

    proc.stdout?.on("data", (data) => {
      output += data.toString();
    });

    proc.stderr?.on("data", (data) => {
      errorOutput += data.toString();
    });

    proc.on("close", (code) => {
      task.status = code === 0 ? "stopped" : "error";
      task.lastUpdate = new Date();

      // Parse error count from output
      if (task.name === "TypeScript") {
        const match = /Found (\d+) errors/.exec(output);
        task.errorCount = match?.[1] ? parseInt(match[1], 10) : 0;
      } else if (task.name === "Lint") {
        const match = /Errors: (\d+)/.exec(output);
        task.errorCount = match?.[1] ? parseInt(match[1], 10) : 0;
      } else if (task.name === "Format") {
        const match = /Unformatted files: (\d+)/.exec(output);
        task.errorCount = match?.[1] ? parseInt(match[1], 10) : 0;
      } else {
        // For tests, check exit code
        task.errorCount = code === 0 ? 0 : 1;
      }

      const statusEmoji = task.errorCount === 0 ? "✅" : "❌";
      const statusText =
        task.errorCount === 0 ? "Passed" : `Failed (${task.errorCount} issues)`;

      console.log(
        chalk[task.errorCount === 0 ? "green" : "red"](
          `${statusEmoji} ${task.name}: ${statusText}`,
        ),
      );

      updateWatchSummary();
    });

    task.process = proc;
  };

  // Watch for file changes using turbo watch
  const startWatching = () => {
    console.log(chalk.green("✅ Watch mode started!\n"));

    // Initial run
    tasks.forEach((task) => void runValidation(task));

    // Set up file watching using chokidar through turbo
    const watchProcess = spawn("pnpm", ["turbo", "watch", "--filter=*"], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });

    watchProcess.stdout?.on("data", (data) => {
      const output = data.toString();

      // Detect file changes
      if (
        output.includes("changed") ||
        output.includes("added") ||
        output.includes("deleted")
      ) {
        console.log(chalk.gray("📝 File change detected..."));

        // Determine which validations to run based on file type
        const shouldRunTypeScript = output.match(/\.(ts|tsx)$/);
        const shouldRunLint = output.match(/\.(ts|tsx|js|jsx)$/);
        const shouldRunTests = output.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/);

        tasks.forEach((task) => {
          if (task.name === "TypeScript" && shouldRunTypeScript) {
            void runValidation(task);
          } else if (task.name === "Lint" && shouldRunLint) {
            void runValidation(task);
          } else if (
            task.name.includes("Test") &&
            shouldRunTests &&
            options.all
          ) {
            void runValidation(task);
          }
        });
      }
    });

    // Fallback: Poll for changes every 30 seconds
    const pollInterval = setInterval(() => {
      tasks.forEach((task) => void runValidation(task));
    }, 30000);

    // Handle shutdown
    process.on("SIGINT", () => {
      console.log(chalk.yellow("\n⏹️  Stopping watch mode..."));

      // Kill all processes
      watchProcess.kill();
      tasks.forEach((task) => task.process?.kill());
      clearInterval(pollInterval);

      // Final summary update
      tasks.forEach((task) => {
        task.status = "stopped";
      });
      updateWatchSummary();

      console.log(chalk.green("✅ Watch mode stopped"));
      console.log(chalk.gray("Final report saved to _errors/watch-summary.md"));
      process.exit(0);
    });
  };

  // Start watching
  startWatching();
}
