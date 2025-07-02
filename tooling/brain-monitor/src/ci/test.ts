import { execSync, spawn } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";

interface TestOptions {
  job?: string;
  workflow?: string;
}

export function testCI(options: TestOptions): void {
  console.log(chalk.blue("🧪 Testing GitHub Actions locally with act..."));

  // Check if act is installed
  try {
    execSync("which act", { stdio: "ignore" });
  } catch {
    console.error(chalk.red("❌ act is not installed!"));
    console.log(
      chalk.yellow("\nInstall act for local GitHub Actions testing:"),
    );
    console.log(chalk.gray("  brew install act              # macOS"));
    console.log(
      chalk.gray(
        "  curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux",
      ),
    );
    console.log(chalk.gray("  choco install act-cli         # Windows"));
    console.log(chalk.gray("\nOr use npm: npm install -g @nektos/act"));
    process.exit(1);
  }

  // Check if Docker is running
  try {
    execSync("docker info", { stdio: "ignore" });
  } catch {
    console.error(chalk.red("❌ Docker is not running!"));
    console.log(
      chalk.yellow("\nact requires Docker to simulate GitHub Actions locally."),
    );
    console.log(chalk.gray("\nTo start Docker:"));
    console.log(chalk.gray("  - macOS: Open Docker Desktop from Applications"));
    console.log(chalk.gray("  - Linux: sudo systemctl start docker"));
    console.log(chalk.gray("  - Windows: Start Docker Desktop"));
    console.log(
      chalk.gray("\nInstall Docker from: https://www.docker.com/get-started"),
    );
    process.exit(1);
  }

  // Check if workflow exists
  const workflowPath = join(
    process.cwd(),
    ".github",
    "workflows",
    options.workflow || "validate.yml",
  );
  if (!existsSync(workflowPath)) {
    console.error(chalk.red(`❌ Workflow not found: ${workflowPath}`));
    console.log(
      chalk.yellow("Run `brain-monitor ci:init` first to create workflows"),
    );
    process.exit(1);
  }

  // Build act command
  const actArgs = ["--container-architecture", "linux/amd64"];

  if (options.workflow) {
    actArgs.push("-W", `.github/workflows/${options.workflow}`);
  }

  if (options.job) {
    actArgs.push("-j", options.job);
  }

  // Use medium image by default to avoid the prompt
  actArgs.unshift("-P", "ubuntu-latest=catthehacker/ubuntu:act-latest");

  // Add pull_request event
  actArgs.push("pull_request");

  console.log(chalk.gray(`Running: act ${actArgs.join(" ")}`));
  console.log(chalk.yellow("\n📝 Simulating pull request event..."));
  console.log(
    chalk.yellow("Note: First run will download Docker images (~500MB)"),
  );

  // Spawn act process
  const actProcess = spawn("act", actArgs, {
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN || "dummy-token-for-testing",
    },
  });

  actProcess.on("close", (code) => {
    if (code === 0) {
      console.log(
        chalk.green("\n✅ GitHub Actions test completed successfully!"),
      );
    } else {
      console.log(
        chalk.red(`\n❌ GitHub Actions test failed with code ${code}`),
      );
      process.exit(code || 1);
    }
  });
}
