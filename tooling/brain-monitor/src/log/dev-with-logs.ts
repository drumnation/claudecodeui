#!/usr/bin/env tsx
/* eslint-disable no-console */

import { spawn, ChildProcess, execSync } from "child_process";
import { mkdirSync, writeFileSync, appendFileSync, readdirSync } from "fs";
import { join } from "path";
import chalk, { type ChalkInstance } from "chalk";
import { discoverDevPackages } from "../utils/package-discovery.js";

interface ServerInfo {
  name: string;
  command: string;
  args: string[];
  color: ChalkInstance;
  logFile: string;
}

async function startDevServers() {
  // Cleanup existing processes
  console.log(chalk.blue("🧹 Cleaning up any existing processes..."));

  try {
    // Kill anything that might be running - generic patterns
    execSync('pkill -f "pnpm.*dev" 2>/dev/null || true', {
      stdio: "ignore",
    });
    execSync('pkill -f "vite" 2>/dev/null || true', { stdio: "ignore" });
    execSync('pkill -f "tsx watch" 2>/dev/null || true', {
      stdio: "ignore",
    });
    execSync('pkill -f "node.*dev" 2>/dev/null || true', {
      stdio: "ignore",
    });

    // Clean up lock files
    execSync("rm -f .dev-server-lock .dev-server-pids", { stdio: "ignore" });

    console.log(chalk.green("✅ Cleanup complete"));
    console.log("");

    // Give processes time to die
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (e) {
    // Ignore errors in cleanup
  }

  // Ensure directories exist
  mkdirSync("_logs", { recursive: true });

  // Clear existing log files
  const existingLogs = readdirSync("_logs").filter((f) => f.endsWith(".log"));
  existingLogs.forEach((file) => {
    writeFileSync(join("_logs", file), "");
  });

  // Discover packages with dev scripts dynamically
  const devPackages = await discoverDevPackages();

  if (devPackages.length === 0) {
    console.warn(chalk.yellow("⚠️  No packages found with dev scripts"));
    return;
  }

  console.log(
    chalk.blue(`🔍 Found ${devPackages.length} packages with dev scripts:`),
  );
  devPackages.forEach((pkg) => {
    console.log(`  - ${pkg.color(pkg.name)} at ${chalk.gray(pkg.path)}`);
  });
  console.log("");

  const servers: ServerInfo[] = devPackages.map((pkg) => ({
    name: pkg.name,
    command: "pnpm",
    args: ["--filter", pkg.name, "dev"],
    color: pkg.color,
    logFile: join("_logs", pkg.logFileName),
  }));

  const processes: ChildProcess[] = [];

  // Color function is now directly stored in server object

  // Helper to get timestamp
  const getTimestamp = () => {
    const now = new Date();
    return (
      now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) +
      "." +
      now.getMilliseconds().toString().padStart(3, "0")
    );
  };

  // Helper to write initial log header
  const writeLogHeader = (logFile: string, serverName: string) => {
    const header = `# 📋 ${serverName} Server Logs

**Started:** ${new Date().toLocaleString()}
**Status:** 🟢 Starting...

## 📜 Server Output

\`\`\`
`;
    writeFileSync(logFile, header);
  };

  // Start all servers
  console.log(chalk.blue("🚀 Starting dev servers with logging..."));
  console.log(
    chalk.yellow("Note: Frontend (Vite) may take 60+ seconds on first start\n"),
  );

  servers.forEach((server) => {
    const colorFn = server.color;

    // Write initial header
    writeLogHeader(server.logFile, server.name);

    // Spawn the process
    const proc = spawn(server.command, server.args, {
      stdio: ["inherit", "pipe", "pipe"],
      shell: true,
    });

    processes.push(proc);

    // Handle stdout
    if (proc.stdout) {
      proc.stdout.on("data", (data) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((line: string) => line.trim());
        lines.forEach((line: string) => {
          const timestamp = getTimestamp();
          const logLine = `[${timestamp}] ${line}`;

          // Write to console with color
          console.log(
            `${colorFn(`[${server.name}]`)} ${chalk.gray(`[${timestamp}]`)} ${line}`,
          );

          // Append to log file
          appendFileSync(server.logFile, logLine + "\n");
        });
      });
    }

    // Handle stderr
    if (proc.stderr) {
      proc.stderr.on("data", (data) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((line: string) => line.trim());
        lines.forEach((line: string) => {
          const timestamp = getTimestamp();
          const logLine = `[${timestamp}] [ERROR] ${line}`;

          // Write to console with color
          console.log(
            `${colorFn(`[${server.name}]`)} ${chalk.gray(`[${timestamp}]`)} ${chalk.red(line)}`,
          );

          // Append to log file
          appendFileSync(server.logFile, logLine + "\n");
        });
      });
    }

    // Handle process exit
    proc.on("exit", (code) => {
      const exitLine = `\n[${getTimestamp()}] Process exited with code ${code}\n\`\`\`\n`;
      appendFileSync(server.logFile, exitLine);
      console.log(
        `${colorFn(`[${server.name}]`)} ${chalk.red(`Process exited with code ${code}`)}`,
      );
    });

    console.log(`${colorFn(`📋 ${server.name}`)} server starting...`);
  });

  // Update the log index periodically
  const updateIndexFile = () => {
    const indexContent = `# 📚 Server Logs Index (Dev Mode)

**Last Updated:** ${new Date().toLocaleString()}

## 🖥️ Active Servers with Logging

${servers
  .map((server) => {
    return `- [${server.name}](${server.logFile})`;
  })
  .join("\n")}

## 📝 Log Files Being Written

The \`pnpm dev\` command is capturing server output to these files in real-time.

### Quick Actions:

- **View logs:** Open any log file above
- **Stop servers:** Press Ctrl+C in the terminal
- **Monitor specific server:** \`tail -f ${servers[0]?.logFile || "_logs/server.log"}\`

---
*Logs captured by pnpm dev command*
`;

    writeFileSync("_logs/index.md", indexContent);
  };

  // Update index every 5 seconds
  const indexInterval = setInterval(updateIndexFile, 5000);

  // Initial index update
  updateIndexFile();

  // Handle graceful shutdown
  const cleanup = () => {
    console.log(chalk.yellow("\n⏹️  Stopping all processes..."));

    clearInterval(indexInterval);

    // Kill all child processes
    processes.forEach((proc) => {
      if (!proc.killed) {
        proc.kill("SIGTERM");
      }
    });

    // Force kill after timeout
    setTimeout(() => {
      processes.forEach((proc) => {
        if (!proc.killed) {
          proc.kill("SIGKILL");
        }
      });
      process.exit(0);
    }, 3000);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  console.log(
    chalk.green("\n✅ All servers started! Logs are being saved to _logs/"),
  );
  console.log(chalk.gray("Press Ctrl+C to stop all servers.\n"));
}

// Run the main function
startDevServers().catch(console.error);
