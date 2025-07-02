import { describe, it, expect, vi, beforeEach } from "vitest";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  findPackagesWithTests,
  getTestDisplayName,
  getTestFileName,
} from "./detect-tests.js";

// Mock modules
vi.mock("fs");
vi.mock("path", async () => {
  const actual = await vi.importActual<typeof import("path")>("path");
  return {
    ...actual,
    join: vi.fn((...args: string[]) => args.join("/")),
  };
});

describe("detect-tests", () => {
  const mockReaddirSync = vi.mocked(readdirSync);
  const mockReadFileSync = vi.mocked(readFileSync);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, "cwd").mockReturnValue("/test/project");
  });

  describe("findPackagesWithTests", () => {
    it("should find packages with test scripts in apps directory", () => {
      mockReaddirSync.mockImplementation((path) => {
        if (path.includes("apps")) {
          return ["app1", "app2"] as any;
        }
        return [] as any;
      });

      mockReadFileSync.mockImplementation((path) => {
        if (path.includes("app1/package.json")) {
          return JSON.stringify({
            name: "@financial/app1",
            scripts: {
              "test:unit": "vitest run",
              "test:integration": "vitest run --config integration",
            },
          });
        }
        if (path.includes("app2/package.json")) {
          return JSON.stringify({
            name: "@financial/app2",
            scripts: {
              "test:e2e": "playwright test",
            },
          });
        }
        return "{}";
      });

      const result = findPackagesWithTests();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: "@financial/app1",
        path: "apps/app1",
        availableTests: ["test:unit", "test:integration"],
      });
      expect(result[1]).toEqual({
        name: "@financial/app2",
        path: "apps/app2",
        availableTests: ["test:e2e"],
      });
    });

    it("should find packages with test scripts in packages directory", () => {
      mockReaddirSync.mockImplementation((path) => {
        if (path.includes("packages")) {
          return ["pkg1", "pkg2"] as any;
        }
        return [] as any;
      });

      mockReadFileSync.mockImplementation((path) => {
        if (path.includes("pkg1/package.json")) {
          return JSON.stringify({
            name: "@financial/pkg1",
            scripts: {
              "test:unit": "vitest run",
              "test:storybook": "test-storybook",
            },
          });
        }
        return "{}";
      });

      const result = findPackagesWithTests();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "@financial/pkg1",
        path: "packages/pkg1",
        availableTests: ["test:unit", "test:storybook"],
      });
    });

    it('should filter out "n/a" test scripts', () => {
      mockReaddirSync.mockImplementation((path) => {
        if (path.includes("apps")) {
          return ["app1"] as any;
        }
        return [] as any;
      });
      mockReadFileSync.mockReturnValue(
        JSON.stringify({
          name: "@financial/app1",
          scripts: {
            "test:unit": "vitest run",
            "test:integration": 'echo "n/a"',
            "test:e2e": "echo 'n/a'",
          },
        }),
      );

      const result = findPackagesWithTests();

      expect(result).toHaveLength(1);
      expect(result[0].availableTests).toEqual(["test:unit"]);
    });

    it("should handle missing package.json gracefully", () => {
      mockReaddirSync.mockReturnValue(["app1"] as any);
      mockReadFileSync.mockImplementation(() => {
        throw new Error("File not found");
      });

      const result = findPackagesWithTests();

      expect(result).toHaveLength(0);
    });

    it("should handle missing directories gracefully", () => {
      mockReaddirSync.mockImplementation(() => {
        throw new Error("Directory not found");
      });

      const result = findPackagesWithTests();

      expect(result).toHaveLength(0);
    });

    it("should use directory name if package name is missing", () => {
      mockReaddirSync.mockReturnValue(["app1"] as any);
      mockReadFileSync.mockReturnValue(
        JSON.stringify({
          scripts: {
            "test:unit": "vitest run",
          },
        }),
      );

      const result = findPackagesWithTests();

      expect(result[0].name).toBe("app1");
    });

    it("should handle packages without scripts", () => {
      mockReaddirSync.mockReturnValue(["app1"] as any);
      mockReadFileSync.mockReturnValue(
        JSON.stringify({
          name: "@financial/app1",
        }),
      );

      const result = findPackagesWithTests();

      expect(result).toHaveLength(0);
    });
  });

  describe("getTestDisplayName", () => {
    it("should return correct display names for all test types", () => {
      expect(getTestDisplayName("test:unit")).toBe("Unit Tests");
      expect(getTestDisplayName("test:integration")).toBe("Integration Tests");
      expect(getTestDisplayName("test:e2e")).toBe("E2E Tests");
      expect(getTestDisplayName("test:e2e:browser")).toBe("Browser E2E Tests");
      expect(getTestDisplayName("test:storybook")).toBe("Storybook Tests");
      expect(getTestDisplayName("test:storybook:interaction")).toBe(
        "Storybook Interaction Tests",
      );
      expect(getTestDisplayName("test:storybook:e2e")).toBe(
        "Storybook E2E Tests",
      );
    });

    it("should return the input for unknown test types", () => {
      expect(getTestDisplayName("test:unknown" as any)).toBe("test:unknown");
    });
  });

  describe("getTestFileName", () => {
    it("should return correct file names for all test types", () => {
      expect(getTestFileName("test:unit")).toBe("unit");
      expect(getTestFileName("test:integration")).toBe("integration");
      expect(getTestFileName("test:e2e")).toBe("e2e");
      expect(getTestFileName("test:e2e:browser")).toBe("browser-e2e");
      expect(getTestFileName("test:storybook")).toBe("storybook");
      expect(getTestFileName("test:storybook:interaction")).toBe(
        "storybook-interaction",
      );
      expect(getTestFileName("test:storybook:e2e")).toBe("storybook-e2e");
    });

    it("should replace colons with dashes for unknown test types", () => {
      expect(getTestFileName("test:custom:type" as any)).toBe(
        "test-custom-type",
      );
    });
  });

  describe("integration tests", () => {
    it("should handle complex monorepo structure", () => {
      mockReaddirSync.mockImplementation((path) => {
        if (path.includes("apps")) {
          return ["api", "ui", "admin"] as any;
        }
        if (path.includes("packages")) {
          return ["shared", "utils", "components"] as any;
        }
        return [] as any;
      });

      mockReadFileSync.mockImplementation((path) => {
        const configs: Record<string, any> = {
          "/test/project/apps/api/package.json": {
            name: "@financial/api",
            scripts: {
              "test:unit": "vitest",
              "test:integration": "vitest integration",
              "test:e2e": 'echo "n/a"',
            },
          },
          "/test/project/apps/ui/package.json": {
            name: "@financial/ui",
            scripts: {
              "test:unit": "vitest",
              "test:e2e": "playwright test",
              "test:storybook": "test-storybook",
            },
          },
          "/test/project/packages/shared/package.json": {
            name: "@financial/shared",
            scripts: {
              "test:unit": "vitest",
            },
          },
        };

        const content = configs[path as string];
        if (content) {
          return JSON.stringify(content);
        }
        return "{}";
      });

      const result = findPackagesWithTests();

      expect(result).toHaveLength(3);

      const api = result.find((p) => p.name === "@financial/api");
      expect(api?.availableTests).toEqual(["test:unit", "test:integration"]);

      const ui = result.find((p) => p.name === "@financial/ui");
      expect(ui?.availableTests).toEqual([
        "test:unit",
        "test:e2e",
        "test:storybook",
      ]);

      const shared = result.find((p) => p.name === "@financial/shared");
      expect(shared?.availableTests).toEqual(["test:unit"]);
    });
  });
});
