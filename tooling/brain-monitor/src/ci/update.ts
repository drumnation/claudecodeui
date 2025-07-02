import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";

export async function updateCI(): Promise<void> {
  console.log(chalk.blue("🔄 Updating GitHub Actions workflows..."));

  const workflowPath = join(
    process.cwd(),
    ".github",
    "workflows",
    "validate.yml",
  );

  if (!existsSync(workflowPath)) {
    console.error(chalk.red("❌ No existing workflow found!"));
    console.log(
      chalk.yellow("Run `brain-monitor ci:init` first to create workflows"),
    );
    process.exit(1);
  }

  // Read current workflow
  const currentWorkflow = readFileSync(workflowPath, "utf8");

  // Check if it's a brain-monitor managed workflow
  if (!currentWorkflow.includes("brain:validate")) {
    console.error(
      chalk.red("❌ This workflow was not created by brain-monitor"),
    );
    console.log(
      chalk.yellow(
        "Only brain-monitor managed workflows can be updated automatically",
      ),
    );
    process.exit(1);
  }

  // For now, just regenerate the workflow
  // In the future, this could be smarter about preserving customizations
  console.log(
    chalk.yellow("⚠️  This will overwrite any manual changes to the workflow"),
  );
  console.log(chalk.gray("Backing up current workflow to validate.yml.backup"));

  writeFileSync(workflowPath + ".backup", currentWorkflow);

  // Re-run init to update
  const { initCI } = await import("./init.js");
  await initCI();

  console.log(chalk.green("\n✅ Workflow updated successfully!"));
  console.log(chalk.yellow("Review the changes and test with: `pnpm ci:test`"));
}
