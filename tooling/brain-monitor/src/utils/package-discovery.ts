import { glob } from "glob";
import { readFile } from "fs/promises";
import { join, relative } from "path";
import chalk from "chalk";
import yaml from "js-yaml";
import type { DevPackageInfo, PackageDiscoveryOptions } from "../types.js";

const COLORS = [
  chalk.cyan,
  chalk.magenta,
  chalk.yellow,
  chalk.green,
  chalk.blue,
  chalk.red,
  chalk.gray,
];

export async function discoverDevPackages(
  options: PackageDiscoveryOptions = {},
): Promise<DevPackageInfo[]> {
  const { includePrivate = true, excludePatterns = [] } = options;
  const packages: DevPackageInfo[] = [];

  try {
    // Read pnpm-workspace.yaml to get workspace patterns
    const workspaceContent = await readFile("pnpm-workspace.yaml", "utf-8");
    const workspace = yaml.load(workspaceContent) as { packages: string[] };

    if (!workspace?.packages) {
      console.warn("No workspace packages found in pnpm-workspace.yaml");
      return packages;
    }

    // Find all package.json files matching workspace patterns
    const packageJsonPaths: string[] = [];
    for (const pattern of workspace.packages) {
      const globPattern = pattern.endsWith("/*")
        ? `${pattern}/package.json`
        : `${pattern}/*/package.json`;

      const matches = await glob(globPattern, {
        ignore: ["**/node_modules/**", ...excludePatterns],
      });

      packageJsonPaths.push(...matches);
    }

    // Process each package.json
    let colorIndex = 0;
    for (const packageJsonPath of packageJsonPaths) {
      try {
        const content = await readFile(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(content);

        // Skip if no dev script
        if (!packageJson.scripts?.dev) {
          continue;
        }

        // Skip private packages if requested
        if (!includePrivate && packageJson.private) {
          continue;
        }

        const packageName = packageJson.name || "unknown";
        const packagePath = relative(
          process.cwd(),
          join(packageJsonPath, ".."),
        );

        // Generate log file name from package name
        const logFileName = packageName
          .replace(/^@/, "")
          .replace(/\//g, "-")
          .toLowerCase();

        // Parse dev command
        const devCommand = packageJson.scripts.dev
          .split(" ")
          .filter((arg: string) => arg.trim());

        const color = COLORS[colorIndex % COLORS.length];
        if (!color) {
          throw new Error("Color not found");
        }

        packages.push({
          name: packageName,
          path: packagePath,
          devCommand,
          logFileName: `${logFileName}.log`,
          color: color.bold,
        });

        colorIndex++;
      } catch {
        // Ignore parse errors for individual package.json files
      }
    }

    return packages;
  } catch {
    // Return empty array if discovery fails
    return packages;
  }
}

export async function discoverPackagesWithScript(
  scriptName: string,
): Promise<string[]> {
  const packages = await discoverAllPackages();
  return packages
    .filter((pkg) => pkg.scripts?.[scriptName])
    .map((pkg) => pkg.name);
}

async function discoverAllPackages() {
  const packages: Array<{ name: string; scripts?: Record<string, string> }> =
    [];

  try {
    const workspaceContent = await readFile("pnpm-workspace.yaml", "utf-8");
    const workspace = yaml.load(workspaceContent) as { packages: string[] };

    if (!workspace?.packages) {
      return packages;
    }

    const packageJsonPaths: string[] = [];
    for (const pattern of workspace.packages) {
      const globPattern = pattern.endsWith("/*")
        ? `${pattern}/package.json`
        : `${pattern}/*/package.json`;

      const matches = await glob(globPattern, {
        ignore: ["**/node_modules/**"],
      });

      packageJsonPaths.push(...matches);
    }

    for (const packageJsonPath of packageJsonPaths) {
      try {
        const content = await readFile(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(content);
        packages.push({
          name: packageJson.name || "unknown",
          scripts: packageJson.scripts || {},
        });
      } catch {
        // Ignore parse errors
      }
    }
  } catch {
    // Ignore errors
  }

  return packages;
}
