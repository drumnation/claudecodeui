import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { init } from "./init.js";

// Mock modules
vi.mock("fs");
vi.mock("path", async () => {
  const actual = await vi.importActual<typeof import("path")>("path");
  return {
    ...actual,
    join: vi.fn((...args: string[]) => args.join("/")),
    dirname: vi.fn((path: string) => path.split("/").slice(0, -1).join("/")),
  };
});
vi.mock("url", async () => {
  const actual = await vi.importActual<typeof import("url")>("url");
  return {
    ...actual,
    fileURLToPath: vi.fn((url: string) => url.replace("file://", "")),
  };
});
vi.mock("child_process");

// Mock chalk
vi.mock("chalk", () => ({
  default: {
    blue: (str: string) => str,
    green: (str: string) => str,
    yellow: (str: string) => str,
    red: (str: string) => str,
    gray: (str: string) => str,
  },
}));

describe("init", () => {
  const mockReadFileSync = vi.mocked(readFileSync);
  const mockWriteFileSync = vi.mocked(writeFileSync);
  const mockMkdirSync = vi.mocked(mkdirSync);
  const mockExistsSync = vi.mocked(existsSync);
  const mockExecSync = vi.mocked(execSync);

  const mockPackageJson = {
    name: "test-project",
    version: "1.0.0",
    scripts: {
      test: "vitest",
      build: "tsc",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, "cwd").mockReturnValue("/test/project");
    vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("Process exit");
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("package.json validation", () => {
    it("should exit if package.json does not exist", async () => {
      mockExistsSync.mockReturnValue(false);
      const consoleErrorSpy = vi.spyOn(console, "error");

      await expect(init()).rejects.toThrow("Process exit");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("No package.json found in current directory"),
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should read package.json if it exists", async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(mockPackageJson);
        }
        return "";
      });

      await init();

      expect(mockReadFileSync).toHaveBeenCalledWith(
        "/test/project/package.json",
        "utf8",
      );
    });
  });

  describe("scripts addition", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(mockPackageJson);
        }
        return "";
      });
    });

    it("should add all brain:* scripts to package.json", async () => {
      await init();

      const writeCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/package.json",
      );

      expect(writeCall).toBeTruthy();
      const writtenContent = JSON.parse(writeCall![1] as string);

      expect(writtenContent.scripts).toMatchObject({
        "brain:validate": "brain-monitor validate",
        "brain:typecheck-failures": "brain-monitor typecheck",
        "brain:lint-failures": "brain-monitor lint",
        "brain:format-failures": "brain-monitor format",
        "brain:logs": "brain-monitor logs",
        "brain:test-failures-unit": "brain-monitor test unit",
        "brain:test-failures-integration": "brain-monitor test integration",
        "brain:test-failures-e2e": "brain-monitor test e2e",
      });
    });

    it("should preserve existing scripts", async () => {
      await init();

      const writeCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/package.json",
      );

      const writtenContent = JSON.parse(writeCall![1] as string);
      expect(writtenContent.scripts.test).toBe("vitest");
      expect(writtenContent.scripts.build).toBe("tsc");
    });

    it("should not overwrite existing brain:* scripts", async () => {
      const packageWithBrainScript = {
        ...mockPackageJson,
        scripts: {
          ...mockPackageJson.scripts,
          "brain:validate": "custom-validate-command",
        },
      };

      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(packageWithBrainScript);
        }
        return "";
      });

      await init();

      const writeCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/package.json",
      );

      const writtenContent = JSON.parse(writeCall![1] as string);
      expect(writtenContent.scripts["brain:validate"]).toBe(
        "custom-validate-command",
      );
    });

    it("should create scripts object if it does not exist", async () => {
      const packageWithoutScripts = { name: "test", version: "1.0.0" };

      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(packageWithoutScripts);
        }
        return "";
      });

      await init();

      const writeCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/package.json",
      );

      const writtenContent = JSON.parse(writeCall![1] as string);
      expect(writtenContent.scripts).toBeDefined();
      expect(writtenContent.scripts["brain:validate"]).toBe(
        "brain-monitor validate",
      );
    });
  });

  describe("automation docs creation", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(mockPackageJson);
        }
        return "";
      });
    });

    it("should create automation docs directory", async () => {
      await init();

      expect(mockMkdirSync).toHaveBeenCalledWith(
        "/test/project/docs/automation",
        {
          recursive: true,
        },
      );
    });

    it("should create cursor rule document", async () => {
      await init();

      const cursorRuleCall = mockWriteFileSync.mock.calls.find(
        (call) =>
          call[0] ===
          "/test/project/docs/automation/CRITICAL-Error-Task-Lists.md",
      );

      expect(cursorRuleCall).toBeTruthy();
      expect(cursorRuleCall![1]).toContain(
        "CRITICAL: Error Task Lists and Shared Dev Servers",
      );
      expect(cursorRuleCall![1]).toContain("Check Error Reports FIRST");
      expect(cursorRuleCall![1]).toContain("Development Server Management");
    });
  });

  describe("agent instruction files update", () => {
    beforeEach(() => {
      mockExistsSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") return true;
        if (path === "/test/project/CLAUDE.md") return true;
        if (path === "/test/project/GEMINI.md") return true;
        if (path === "/test/project/.clinerules") return true;
        return false;
      });

      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(mockPackageJson);
        }
        if (typeof path === "string" && path.endsWith(".md")) {
          return "# Agent Instructions\n\nSome content here\n";
        }
        if (typeof path === "string" && path.endsWith(".clinerules")) {
          return "Rules content\n";
        }
        return "";
      });
    });

    it("should update CLAUDE.md with include reference", async () => {
      await init();

      const claudeCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/CLAUDE.md",
      );

      expect(claudeCall).toBeTruthy();
      expect(claudeCall![1]).toContain(
        "> include docs/automation/CRITICAL-Error-Task-Lists.md",
      );
    });

    it("should update GEMINI.md with include reference", async () => {
      await init();

      const geminiCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/GEMINI.md",
      );

      expect(geminiCall).toBeTruthy();
      expect(geminiCall![1]).toContain(
        "> include docs/automation/CRITICAL-Error-Task-Lists.md",
      );
    });

    it("should update .clinerules with include reference", async () => {
      await init();

      const clinerCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/.clinerules",
      );

      expect(clinerCall).toBeTruthy();
      expect(clinerCall![1]).toContain(
        "> include docs/automation/CRITICAL-Error-Task-Lists.md",
      );
    });

    it("should not add duplicate include references", async () => {
      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(mockPackageJson);
        }
        if (path === "/test/project/CLAUDE.md") {
          return "# Content\n> include docs/automation/CRITICAL-Error-Task-Lists.md\n";
        }
        return "";
      });

      await init();

      const claudeCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/CLAUDE.md",
      );

      expect(claudeCall).toBeUndefined();
    });

    it("should handle missing agent files gracefully", async () => {
      mockExistsSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") return true;
        return false;
      });

      await init();

      const agentCalls = mockWriteFileSync.mock.calls.filter(
        (call) =>
          call[0].toString().endsWith(".md") ||
          call[0].toString().endsWith(".clinerules"),
      );

      // Should only have the cursor rule doc, not the agent files
      expect(agentCalls).toHaveLength(1);
      expect(agentCalls[0][0]).toContain("CRITICAL-Error-Task-Lists.md");
    });
  });

  describe("gitignore updates", () => {
    beforeEach(() => {
      mockExistsSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") return true;
        if (path === "/test/project/.gitignore") return true;
        return false;
      });

      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(mockPackageJson);
        }
        return "";
      });
    });

    it("should remove _errors/ from gitignore", async () => {
      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(mockPackageJson);
        }
        if (path === "/test/project/.gitignore") {
          return "node_modules/\n_errors/\ndist/\n";
        }
        return "";
      });

      await init();

      const gitignoreCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/.gitignore",
      );

      expect(gitignoreCall).toBeTruthy();
      expect(gitignoreCall![1]).not.toContain("_errors/");
      expect(gitignoreCall![1]).toContain("node_modules/");
      expect(gitignoreCall![1]).toContain("dist/");
    });

    it("should remove _logs/ from gitignore", async () => {
      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(mockPackageJson);
        }
        if (path === "/test/project/.gitignore") {
          return "_logs\n_errors\nnode_modules/\n";
        }
        return "";
      });

      await init();

      const gitignoreCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/.gitignore",
      );

      expect(gitignoreCall).toBeTruthy();
      expect(gitignoreCall![1]).not.toContain("_logs");
      expect(gitignoreCall![1]).not.toContain("_errors");
      expect(gitignoreCall![1]).toContain("node_modules/");
    });

    it("should handle missing .gitignore", async () => {
      mockExistsSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") return true;
        return false;
      });

      await init();

      const gitignoreCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "/test/project/.gitignore",
      );

      expect(gitignoreCall).toBeUndefined();
    });
  });

  describe("directory creation", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(mockPackageJson);
        }
        return "";
      });
    });

    it("should create _errors directory", async () => {
      await init();

      expect(mockMkdirSync).toHaveBeenCalledWith("_errors", {
        recursive: true,
      });
    });

    it("should create _logs directory", async () => {
      await init();

      expect(mockMkdirSync).toHaveBeenCalledWith("_logs", { recursive: true });
    });
  });

  describe("console output", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path) => {
        if (path === "/test/project/package.json") {
          return JSON.stringify(mockPackageJson);
        }
        return "";
      });
    });

    it("should log initialization message", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");

      await init();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Initializing brain-monitor..."),
      );
    });

    it("should log success message", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");

      await init();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("brain-monitor initialized successfully!"),
      );
    });

    it("should log next steps", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");

      await init();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Next steps:"),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Run `pnpm brain:validate`"),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Run `pnpm dev:with-logs`"),
      );
    });

    it("should log progress messages", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");

      await init();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Adding brain:* scripts to package.json..."),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Package.json scripts updated"),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Automation rules created"),
      );
    });
  });
});
