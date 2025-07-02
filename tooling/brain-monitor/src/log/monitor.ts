#!/usr/bin/env tsx

import { ChildProcess, spawn } from "child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import * as readline from "readline";

interface ServerConfig {
  name: string;
  logPatterns: string[];
  color: string;
  port?: number;
}

interface LogBuffer {
  entries: LogEntry[];
  maxSize: number;
}

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  server: string;
  message: string;
  raw: string;
}

// ANSI color codes for console output
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

// Color pool for dynamically discovered servers
const COLOR_POOL = [
  COLORS.blue,
  COLORS.green,
  COLORS.magenta,
  COLORS.cyan,
  COLORS.yellow,
];

// Auto-discover servers from apps directory
function discoverServers(): ServerConfig[] {
  const servers: ServerConfig[] = [];
  const appsDir = "apps";

  if (existsSync(appsDir)) {
    const apps = readdirSync(appsDir);
    let colorIndex = 0;

    apps.forEach((app: string) => {
      const appPath = join(appsDir, app);
      const packagePath = join(appPath, "package.json");

      if (existsSync(packagePath)) {
        try {
          const pkg = JSON.parse(readFileSync(packagePath, "utf-8"));
          if (pkg.scripts && (pkg.scripts.dev || pkg.scripts.start)) {
            // Try to extract port from scripts or use defaults
            let port = 3000;
            const devScript = pkg.scripts.dev || pkg.scripts.start || "";

            // Look for PORT environment variable or port number in script
            const portMatch = devScript.match(
              /PORT[= ](\d+)|:(\d+)|--port[= ](\d+)/,
            );
            if (portMatch) {
              port = parseInt(portMatch[1] || portMatch[2] || portMatch[3], 10);
            } else {
              // Use default ports based on app type
              if (app.includes("ui")) port = 5173;
              else if (app.includes("api")) port = 3001;
              else if (app.includes("agent")) port = 3002 + servers.length;
            }

            servers.push({
              name: app,
              logPatterns: [
                `${appPath}/logs/*.log`,
                `${appPath}/stdout.log`,
                `${appPath}/stderr.log`,
                `${appPath}/.vite/*.log`,
                `${appPath}/*.log`,
              ],
              color: COLOR_POOL[colorIndex % COLOR_POOL.length] || COLORS.blue,
              port,
            });

            colorIndex++;
          }
        } catch (e) {
          console.error(`Failed to parse package.json for ${app}:`, e);
        }
      }
    });
  }

  // Fallback to known servers if none discovered
  if (servers.length === 0) {
    return [
      {
        name: "financial-api",
        logPatterns: [
          "apps/financial-api/logs/*.log",
          "apps/financial-api/stdout.log",
          "apps/financial-api/stderr.log",
        ],
        color: COLORS.blue,
        port: 3001,
      },
      {
        name: "financial-ui",
        logPatterns: [
          "apps/financial-ui/logs/*.log",
          "apps/financial-ui/.vite/*.log",
        ],
        color: COLORS.green,
        port: 5173,
      },
      {
        name: "financial-lead-agent",
        logPatterns: [
          "apps/financial-lead-agent/logs/*.log",
          "apps/financial-lead-agent/stdout.log",
        ],
        color: COLORS.magenta,
        port: 3002,
      },
      {
        name: "financial-simulation-agent",
        logPatterns: [
          "apps/financial-simulation-agent/logs/*.log",
          "apps/financial-simulation-agent/stdout.log",
        ],
        color: COLORS.cyan,
        port: 3003,
      },
    ];
  }

  return servers;
}

// Server configurations - auto-discovered
const SERVERS: ServerConfig[] = discoverServers();

// Ensure _logs directory exists
mkdirSync("_logs", { recursive: true });

// Clear all existing log files at startup
console.log(`${COLORS.yellow}🧹 Clearing existing log files...${COLORS.reset}`);
const existingLogs = readdirSync("_logs").filter((f) => f.endsWith(".log"));
existingLogs.forEach((file: string) => {
  writeFileSync(join("_logs", file), "");
});

// Log buffers for each server (keep last 1000 entries)
const logBuffers = new Map<string, LogBuffer>();
SERVERS.forEach((server) => {
  logBuffers.set(server.name, { entries: [], maxSize: 1000 });
});

// Get timestamp in simple format
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

// Parse log line to extract structured information
const parseLogLine = (line: string, serverName: string): LogEntry => {
  const timestamp = getTimestamp();
  let level: LogEntry["level"] = "info";
  let message = line;

  // Try to detect log level
  if (/\b(error|err|exception|fatal|❌|🔴)\b/i.test(line)) {
    level = "error";
  } else if (/\b(warn|warning|⚠️|🟡)\b/i.test(line)) {
    level = "warn";
  } else if (/\b(debug|trace|🔍)\b/i.test(line)) {
    level = "debug";
  }

  // Clean up the message (remove ANSI codes, extra whitespace)
  message = line.replace(/\x1b\[[0-9;]*m/g, "").trim();

  return {
    timestamp,
    level,
    server: serverName,
    message,
    raw: line,
  };
};

// Update markdown file for a server
const updateMarkdownFile = (serverName: string) => {
  const buffer = logBuffers.get(serverName);
  if (!buffer) return;

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

  const serverConfig = SERVERS.find((s) => s.name === serverName);

  let output = `# 📋 ${serverName} Server Logs

**Last Updated:** ${currentDate}
**Status:** 🟢 Running (Monitoring Active)
${serverConfig?.port ? `**Port:** ${serverConfig.port}` : ""}

## 📊 Log Summary

- **Total Entries:** ${buffer.entries.length}
- **Errors:** ${buffer.entries.filter((l) => l.level === "error").length}
- **Warnings:** ${buffer.entries.filter((l) => l.level === "warn").length}
- **Info:** ${buffer.entries.filter((l) => l.level === "info").length}
- **Debug:** ${buffer.entries.filter((l) => l.level === "debug").length}

## 📜 Recent Logs (Newest First)

`;

  // Get entries in reverse order (newest first)
  const reversedEntries = [...buffer.entries].reverse();

  // Group logs by level
  const errorLogs = reversedEntries.filter((l) => l.level === "error");
  const warnLogs = reversedEntries.filter((l) => l.level === "warn");
  const recentLogs = reversedEntries.slice(0, 100); // Most recent 100 entries

  if (errorLogs.length > 0) {
    output += `### 🔴 Recent Errors\n\n\`\`\`\n`;
    errorLogs.slice(0, 20).forEach((log) => {
      output += `[${log.timestamp}] ${log.message}\n`;
    });
    output += `\`\`\`\n\n`;
    if (errorLogs.length > 20) {
      output += `*... and ${errorLogs.length - 20} more errors*\n\n`;
    }
  }

  if (warnLogs.length > 0) {
    output += `### 🟡 Recent Warnings\n\n\`\`\`\n`;
    warnLogs.slice(0, 20).forEach((log) => {
      output += `[${log.timestamp}] ${log.message}\n`;
    });
    output += `\`\`\`\n\n`;
    if (warnLogs.length > 20) {
      output += `*... and ${warnLogs.length - 20} more warnings*\n\n`;
    }
  }

  output += `### 📝 All Recent Logs\n\n\`\`\`\n`;
  recentLogs.forEach((log) => {
    const icon =
      log.level === "error" ? "❌" : log.level === "warn" ? "⚠️" : "📝";
    output += `${icon} [${log.timestamp}] ${log.message}\n`;
  });
  output += `\`\`\`\n`;

  if (buffer.entries.length > 100) {
    output += `\n*Showing most recent 100 of ${buffer.entries.length} total entries*\n`;
  }

  output += `\n---\n*Live monitoring active - auto-updates every few seconds*\n`;

  writeFileSync(`_logs/${serverName}.log`, output);
};

// Update index file
const updateIndexFile = () => {
  const indexContent = `# 📚 Server Logs Index (Live Monitoring)

**Last Updated:** ${new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })}

## 🖥️ Monitored Servers

${SERVERS.map((server) => {
  const buffer = logBuffers.get(server.name);
  const errorCount =
    buffer?.entries.filter((e) => e.level === "error").length || 0;
  const status = errorCount > 0 ? "🔴" : "🟢";
  return `- [${status} ${server.name}](./${server.name}.log) - ${
    buffer?.entries.length || 0
  } entries${errorCount > 0 ? ` (${errorCount} errors)` : ""}`;
}).join("\n")}

## 🔄 Log Monitoring Active

The log monitor is currently running and updating these files in real-time.

### Quick Actions:

- **Stop monitoring:** Press Ctrl+C in the terminal running the monitor
- **Clear logs:** Delete files in _logs/ and restart monitoring
- **View live updates:** Files are updated every few seconds

### Console Output:

The monitor also outputs colored logs to the console for real-time viewing:
${SERVERS.map((s) => `- ${s.color}${s.name}${COLORS.reset}`).join("\n")}

---
*Live monitoring by log collection script*
`;

  writeFileSync("_logs/index.md", indexContent);
};

// Monitor a process output
const monitorProcess = (serverName: string, process: ChildProcess) => {
  const serverConfig = SERVERS.find((s) => s.name === serverName);
  const color = serverConfig?.color || COLORS.reset;

  const handleOutput = (data: Buffer) => {
    const lines = data
      .toString()
      .split("\n")
      .filter((line) => line.trim());

    lines.forEach((line) => {
      const entry = parseLogLine(line, serverName);

      // Add to buffer
      const buffer = logBuffers.get(serverName);
      if (buffer) {
        buffer.entries.push(entry);
        // Keep only last maxSize entries
        if (buffer.entries.length > buffer.maxSize) {
          buffer.entries = buffer.entries.slice(-buffer.maxSize);
        }
      }

      // Output to console with color and timestamp
      const levelColor =
        entry.level === "error"
          ? COLORS.red
          : entry.level === "warn"
            ? COLORS.yellow
            : COLORS.gray;

      console.log(
        `${color}[${serverName}]${COLORS.reset} ${COLORS.gray}[${entry.timestamp}]${COLORS.reset} ${levelColor}${entry.message}${COLORS.reset}`,
      );
    });
  };

  if (process.stdout) {
    process.stdout.on("data", handleOutput);
  }

  if (process.stderr) {
    process.stderr.on("data", handleOutput);
  }
};

// Start monitoring all servers
const startMonitoring = () => {
  console.log(
    `${COLORS.cyan}🚀 Starting log monitor for ${SERVERS.length} discovered servers...${COLORS.reset}\n`,
  );
  console.log(`${COLORS.gray}Discovered servers:${COLORS.reset}`);
  SERVERS.forEach((s) => {
    console.log(`  ${s.color}• ${s.name}${COLORS.reset} (port ${s.port})`);
  });
  console.log("");

  // For each server, we'll tail its potential log files
  const tailProcesses: ChildProcess[] = [];

  SERVERS.forEach((server) => {
    // Create a combined tail command for all potential log locations
    const tailCommand = `tail -F ${server.logPatterns.join(" ")} 2>/dev/null || true`;

    const tailProcess = spawn("sh", ["-c", tailCommand], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });

    monitorProcess(server.name, tailProcess);
    tailProcesses.push(tailProcess);

    console.log(
      `${server.color}📋 Monitoring ${server.name} logs...${COLORS.reset}`,
    );
  });

  // Also monitor the main dev process output if available
  if (process.stdin.isTTY === false) {
    // We're receiving piped input, monitor it
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", (line) => {
      // Try to determine which server this log is from
      let serverName = "unknown";

      for (const server of SERVERS) {
        if (line.includes(server.name) || line.includes(`:${server.port}`)) {
          serverName = server.name;
          break;
        }
      }

      const entry = parseLogLine(line, serverName);

      // Add to appropriate buffer
      const buffer = logBuffers.get(serverName) || logBuffers.get("unknown");
      if (buffer) {
        buffer.entries.push(entry);
        if (buffer.entries.length > buffer.maxSize) {
          buffer.entries = buffer.entries.slice(-buffer.maxSize);
        }
      }
    });
  }

  // Update markdown files periodically
  const updateInterval = setInterval(() => {
    SERVERS.forEach((server) => updateMarkdownFile(server.name));
    updateIndexFile();
  }, 3000); // Update every 3 seconds

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log(`\n${COLORS.yellow}⏹️  Stopping log monitor...${COLORS.reset}`);

    clearInterval(updateInterval);
    tailProcesses.forEach((p: ChildProcess) => p.kill());

    // Final update
    SERVERS.forEach((server) => updateMarkdownFile(server.name));
    updateIndexFile();

    console.log(
      `${COLORS.green}✅ Log monitor stopped. Logs saved to _logs/${COLORS.reset}`,
    );
    process.exit(0);
  });

  console.log(
    `\n${COLORS.green}✅ Log monitor running! Press Ctrl+C to stop.${COLORS.reset}\n`,
  );
  console.log(
    `${COLORS.gray}Logs are being saved to _logs/ and updated every 3 seconds.${COLORS.reset}\n`,
  );
};

// Start the monitoring
startMonitoring();
