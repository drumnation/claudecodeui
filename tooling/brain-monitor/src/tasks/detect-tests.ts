#!/usr/bin/env tsx

import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// Test types we support
const TEST_TYPES = [
  "test:unit",
  "test:integration",
  "test:e2e",
  "test:e2e:browser",
  "test:storybook",
  "test:storybook:interaction",
  "test:storybook:e2e",
] as const;

export type TestType = (typeof TEST_TYPES)[number];

interface PackageTests {
  name: string;
  path: string;
  availableTests: TestType[];
}

// Find all packages with tests
export function findPackagesWithTests(): PackageTests[] {
  const packages: PackageTests[] = [];

  // Check apps directory
  const appsDir = join(process.cwd(), "apps");
  try {
    const apps = readdirSync(appsDir);
    for (const app of apps) {
      const packageJsonPath = join(appsDir, app, "package.json");
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        const availableTests = getAvailableTests(packageJson);
        if (availableTests.length > 0) {
          packages.push({
            name: packageJson.name || app,
            path: join("apps", app),
            availableTests,
          });
        }
      } catch {
        // Skip if no package.json
      }
    }
  } catch {
    // No apps directory
  }

  // Check packages directory
  const packagesDir = join(process.cwd(), "packages");
  try {
    const pkgs = readdirSync(packagesDir);
    for (const pkg of pkgs) {
      const packageJsonPath = join(packagesDir, pkg, "package.json");
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        const availableTests = getAvailableTests(packageJson);
        if (availableTests.length > 0) {
          packages.push({
            name: packageJson.name || pkg,
            path: join("packages", pkg),
            availableTests,
          });
        }
      } catch {
        // Skip if no package.json
      }
    }
  } catch {
    // No packages directory
  }

  return packages;
}

// Get available test types from package.json
function getAvailableTests(packageJson: any): TestType[] {
  const scripts = packageJson.scripts || {};
  const availableTests: TestType[] = [];

  for (const testType of TEST_TYPES) {
    if (scripts[testType]) {
      // Check if it's a real test command (not echo 'n/a')
      const command = scripts[testType];
      if (!command.includes("echo 'n/a'") && !command.includes('echo "n/a"')) {
        availableTests.push(testType);
      }
    }
  }

  return availableTests;
}

// Get test display name
export function getTestDisplayName(testType: TestType): string {
  const displayNames: Record<TestType, string> = {
    "test:unit": "Unit Tests",
    "test:integration": "Integration Tests",
    "test:e2e": "E2E Tests",
    "test:e2e:browser": "Browser E2E Tests",
    "test:storybook": "Storybook Tests",
    "test:storybook:interaction": "Storybook Interaction Tests",
    "test:storybook:e2e": "Storybook E2E Tests",
  };
  return displayNames[testType] || testType;
}

// Get test file name
export function getTestFileName(testType: TestType): string {
  const fileNames: Record<TestType, string> = {
    "test:unit": "unit",
    "test:integration": "integration",
    "test:e2e": "e2e",
    "test:e2e:browser": "browser-e2e",
    "test:storybook": "storybook",
    "test:storybook:interaction": "storybook-interaction",
    "test:storybook:e2e": "storybook-e2e",
  };
  return fileNames[testType] || testType.replace(/:/g, "-");
}

// Main function - list available tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const packages = findPackagesWithTests();

  console.log("📦 Available Test Types by Package:\n");

  for (const pkg of packages) {
    console.log(`${pkg.name} (${pkg.path}):`);
    for (const testType of pkg.availableTests) {
      console.log(`  - ${testType}: ${getTestDisplayName(testType)}`);
    }
    console.log("");
  }

  // Summary by test type
  console.log("\n📊 Summary by Test Type:");
  for (const testType of TEST_TYPES) {
    const packagesWithTest = packages.filter((p) =>
      p.availableTests.includes(testType),
    );
    if (packagesWithTest.length > 0) {
      console.log(`\n${getTestDisplayName(testType)} (${testType}):`);
      console.log(
        `  Packages: ${packagesWithTest.map((p) => p.name).join(", ")}`,
      );
    }
  }
}
