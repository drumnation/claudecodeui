import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  discoverDevPackages,
  discoverPackagesWithScript,
} from "./package-discovery.js";
import type { DevPackageInfo } from "../types.js";

// Mock dependencies
vi.mock("glob", () => ({
  glob: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
}));

import { glob } from "glob";
import { readFile } from "fs/promises";

describe("package-discovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("discoverDevPackages", () => {
    it("should discover packages with dev scripts", async () => {
      // Mock pnpm-workspace.yaml
      vi.mocked(readFile).mockImplementationOnce(async (path) => {
        if (path === "pnpm-workspace.yaml") {
          return `
packages:
  - apps/*
  - packages/*
  - tooling/*
`;
        }
        throw new Error(`Unexpected path: ${path}`);
      });

      // Mock glob results
      vi.mocked(glob).mockImplementation(async (pattern) => {
        if (pattern === "apps/*/package.json") {
          return ["apps/frontend/package.json", "apps/backend/package.json"];
        }
        if (pattern === "packages/*/package.json") {
          return ["packages/logger/package.json"];
        }
        if (pattern === "tooling/*/package.json") {
          return ["tooling/brain-monitor/package.json"];
        }
        return [];
      });

      // Mock package.json files
      vi.mocked(readFile).mockImplementation(async (path) => {
        if (path === "pnpm-workspace.yaml") {
          return `packages:\n  - apps/*\n  - packages/*\n  - tooling/*`;
        }
        if (path === "apps/frontend/package.json") {
          return JSON.stringify({
            name: "@claude-code-ui/frontend",
            scripts: { dev: "vite" },
          });
        }
        if (path === "apps/backend/package.json") {
          return JSON.stringify({
            name: "@claude-code-ui/backend",
            scripts: { dev: "tsx watch src/server.ts" },
          });
        }
        if (path === "packages/logger/package.json") {
          return JSON.stringify({
            name: "@kit/logger",
            scripts: { test: "vitest" }, // No dev script
          });
        }
        if (path === "tooling/brain-monitor/package.json") {
          return JSON.stringify({
            name: "@kit/brain-monitor",
            scripts: { dev: "tsx watch src/cli.ts" },
          });
        }
        throw new Error(`Unexpected path: ${path}`);
      });

      const packages = await discoverDevPackages();

      expect(packages).toHaveLength(3);
      expect(packages.map((p) => p.name)).toEqual([
        "@claude-code-ui/frontend",
        "@claude-code-ui/backend",
        "@kit/brain-monitor",
      ]);

      // Check structure of returned packages
      const frontend = packages.find(
        (p) => p.name === "@claude-code-ui/frontend",
      );
      expect(frontend).toBeDefined();
      expect(frontend!.path).toBe("apps/frontend");
      expect(frontend!.devCommand).toEqual(["vite"]);
      expect(frontend!.logFileName).toBe("claude-code-ui-frontend.log");
      expect(frontend!.color).toBeDefined();
    });

    it("should handle empty workspace", async () => {
      vi.mocked(readFile).mockResolvedValueOnce("packages: []");

      const packages = await discoverDevPackages();

      expect(packages).toEqual([]);
    });

    it("should handle missing pnpm-workspace.yaml", async () => {
      vi.mocked(readFile).mockRejectedValueOnce(new Error("ENOENT"));

      const packages = await discoverDevPackages();

      expect(packages).toEqual([]);
    });

    it("should skip packages without dev scripts", async () => {
      vi.mocked(readFile).mockImplementationOnce(
        async () => "packages:\n  - packages/*",
      );

      vi.mocked(glob).mockResolvedValueOnce(["packages/no-dev/package.json"]);

      vi.mocked(readFile).mockImplementation(async (path) => {
        if (path === "pnpm-workspace.yaml") {
          return "packages:\n  - packages/*";
        }
        if (path === "packages/no-dev/package.json") {
          return JSON.stringify({
            name: "@test/no-dev",
            scripts: { build: "tsc", test: "vitest" }, // No dev script
          });
        }
        throw new Error(`Unexpected path: ${path}`);
      });

      const packages = await discoverDevPackages();

      expect(packages).toEqual([]);
    });

    it("should handle malformed package.json files", async () => {
      vi.mocked(readFile).mockImplementationOnce(
        async () => "packages:\n  - packages/*",
      );

      vi.mocked(glob).mockResolvedValueOnce(["packages/broken/package.json"]);

      vi.mocked(readFile).mockImplementation(async (path) => {
        if (path === "pnpm-workspace.yaml") {
          return "packages:\n  - packages/*";
        }
        if (path === "packages/broken/package.json") {
          return "not valid json{";
        }
        throw new Error(`Unexpected path: ${path}`);
      });

      const packages = await discoverDevPackages();

      expect(packages).toEqual([]);
    });

    it("should exclude private packages when requested", async () => {
      vi.mocked(readFile).mockImplementationOnce(
        async () => "packages:\n  - packages/*",
      );

      vi.mocked(glob).mockResolvedValueOnce([
        "packages/public/package.json",
        "packages/private/package.json",
      ]);

      vi.mocked(readFile).mockImplementation(async (path) => {
        if (path === "pnpm-workspace.yaml") {
          return "packages:\n  - packages/*";
        }
        if (path === "packages/public/package.json") {
          return JSON.stringify({
            name: "@test/public",
            scripts: { dev: "vite" },
          });
        }
        if (path === "packages/private/package.json") {
          return JSON.stringify({
            name: "@test/private",
            private: true,
            scripts: { dev: "vite" },
          });
        }
        throw new Error(`Unexpected path: ${path}`);
      });

      const packages = await discoverDevPackages({ includePrivate: false });

      expect(packages).toHaveLength(1);
      expect(packages[0].name).toBe("@test/public");
    });

    it("should assign unique colors to packages", async () => {
      vi.mocked(readFile).mockImplementationOnce(
        async () => "packages:\n  - apps/*",
      );

      // Create many packages to test color cycling
      const packagePaths = Array.from(
        { length: 10 },
        (_, i) => `apps/app${i}/package.json`,
      );

      vi.mocked(glob).mockResolvedValueOnce(packagePaths);

      vi.mocked(readFile).mockImplementation(async (path) => {
        if (path === "pnpm-workspace.yaml") {
          return "packages:\n  - apps/*";
        }
        const match = path.match(/apps\/app(\d+)\/package\.json/);
        if (match) {
          return JSON.stringify({
            name: `@test/app${match[1]}`,
            scripts: { dev: "vite" },
          });
        }
        throw new Error(`Unexpected path: ${path}`);
      });

      const packages = await discoverDevPackages();

      expect(packages).toHaveLength(10);

      // Check that colors are assigned
      packages.forEach((pkg) => {
        expect(pkg.color).toBeDefined();
      });
    });
  });

  describe("discoverPackagesWithScript", () => {
    it("should find packages with specific script", async () => {
      vi.mocked(readFile).mockImplementationOnce(
        async () => "packages:\n  - packages/*",
      );

      vi.mocked(glob).mockResolvedValueOnce([
        "packages/a/package.json",
        "packages/b/package.json",
      ]);

      vi.mocked(readFile).mockImplementation(async (path) => {
        if (path === "pnpm-workspace.yaml") {
          return "packages:\n  - packages/*";
        }
        if (path === "packages/a/package.json") {
          return JSON.stringify({
            name: "@test/a",
            scripts: { test: "vitest", build: "tsc" },
          });
        }
        if (path === "packages/b/package.json") {
          return JSON.stringify({
            name: "@test/b",
            scripts: { test: "jest" },
          });
        }
        throw new Error(`Unexpected path: ${path}`);
      });

      const packages = await discoverPackagesWithScript("test");

      expect(packages).toEqual(["@test/a", "@test/b"]);
    });

    it("should return empty array for non-existent script", async () => {
      vi.mocked(readFile).mockImplementationOnce(
        async () => "packages:\n  - packages/*",
      );

      vi.mocked(glob).mockResolvedValueOnce(["packages/a/package.json"]);

      vi.mocked(readFile).mockImplementation(async (path) => {
        if (path === "pnpm-workspace.yaml") {
          return "packages:\n  - packages/*";
        }
        if (path === "packages/a/package.json") {
          return JSON.stringify({
            name: "@test/a",
            scripts: { build: "tsc" },
          });
        }
        throw new Error(`Unexpected path: ${path}`);
      });

      const packages = await discoverPackagesWithScript("dev");

      expect(packages).toEqual([]);
    });
  });
});
