#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

void yargs(hideBin(process.argv))
  .command(
    "validate",
    "Run all validations",
    () => {
      // No setup needed
    },
    async () => {
      const { run } = await import("./orchestrator.js");
      await run();
    },
  )
  .command(
    "logs",
    "Start log monitor",
    () => {
      // No setup needed
    },
    async () => {
      await import("./log/monitor.js");
    },
  )
  .command(
    "dev",
    "Start dev servers with integrated logging",
    () => {
      // No setup needed
    },
    async () => {
      await import("./log/dev-with-logs.js");
    },
  )
  .command(
    "typecheck",
    "TypeScript validation only",
    () => {
      // No setup needed
    },
    async () => {
      await import("./tasks/collect-errors.js");
    },
  )
  .command(
    "lint",
    "Lint validation only",
    () => {
      // No setup needed
    },
    async () => {
      await import("./tasks/collect-lint.js");
    },
  )
  .command(
    "format",
    "Format validation only",
    () => {
      // No setup needed
    },
    async () => {
      await import("./tasks/collect-format.js");
    },
  )
  .command(
    "test <type>",
    "Collect test failures for specific type",
    (yargs) => {
      return yargs.positional("type", {
        type: "string",
        describe: "Test type (e.g., unit, integration, e2e)",
        demandOption: true,
      });
    },
    async (argv) => {
      const { execSync } = await import("child_process");
      const scriptPath = new URL("./tasks/collect-generic.js", import.meta.url)
        .pathname;
      execSync(`tsx ${scriptPath} ${argv.type}`, { stdio: "inherit" });
    },
  )
  .command(
    "watch",
    "Run validations in watch mode",
    (yargs) => {
      return yargs
        .option("all", {
          type: "boolean",
          description: "Watch all validations (default: typecheck + lint only)",
          default: false,
        })
        .option("interval", {
          alias: "i",
          type: "number",
          description: "Minimum seconds between updates",
          default: 5,
        });
    },
    async (argv) => {
      const { watch } = await import("./watch.js");
      await watch(argv);
    },
  )
  .command(
    "init",
    "Bootstrap scripts and documentation",
    () => {
      // No setup needed
    },
    async () => {
      const { init } = await import("./init.js");
      await init();
    },
  )
  .command(
    "ci:init",
    "Generate GitHub Actions workflows",
    () => {
      // No setup needed
    },
    async () => {
      const { initCI } = await import("./ci/init.js");
      await initCI();
    },
  )
  .command(
    "ci:test",
    "Test GitHub Actions locally with act",
    (yargs) => {
      return yargs
        .option("job", {
          alias: "j",
          type: "string",
          description: "Specific job to test",
        })
        .option("workflow", {
          alias: "w",
          type: "string",
          description: "Workflow file to test",
          default: "validate.yml",
        });
    },
    async (argv) => {
      const { testCI } = await import("./ci/test.js");
      await testCI(argv);
    },
  )
  .command(
    "ci:update",
    "Update existing GitHub Actions workflows",
    () => {
      // No setup needed
    },
    async () => {
      const { updateCI } = await import("./ci/update.js");
      await updateCI();
    },
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("h", "help")
  .version()
  .alias("v", "version")
  .parse();
