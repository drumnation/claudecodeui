import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { spawn, execSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import * as detectTests from "./tasks/detect-tests.js";

// Mock modules first, before importing the module under test
vi.mock("child_process", async () => {
  const actual =
    await vi.importActual<typeof import("child_process")>("child_process");
  return {
    ...actual,
    spawn: vi.fn(),
    execSync: vi.fn(() => "Friday, January 15, 2024 at 10:30:00 AM"),
  };
});
vi.mock("fs");
vi.mock("./tasks/detect-tests.js", () => ({
  findPackagesWithTests: vi.fn(() => []),
  getTestDisplayName: vi.fn((type) => type),
  getTestFileName: vi.fn((type) => type),
}));

// Import after mocks are set up
import { run } from "./orchestrator.js";

describe("orchestrator", () => {
  const mockSpawn = vi.mocked(spawn);
  const mockMkdirSync = vi.mocked(mkdirSync);
  const mockWriteFileSync = vi.mocked(writeFileSync);
  const mockFindPackagesWithTests = vi.mocked(
    detectTests.findPackagesWithTests,
  );
  const mockGetTestDisplayName = vi.mocked(detectTests.getTestDisplayName);
  const mockGetTestFileName = vi.mocked(detectTests.getTestFileName);
  let mockExit: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock process.exit for all tests
    mockExit = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    // Setup default mocks
    mockFindPackagesWithTests.mockReturnValue([
      {
        name: "@financial/test-pkg",
        path: "packages/test-pkg",
        availableTests: ["test:unit", "test:integration"],
      },
    ]);

    mockGetTestDisplayName.mockImplementation((type) => {
      const map: Record<string, string> = {
        "test:unit": "Unit Tests",
        "test:integration": "Integration Tests",
      };
      return map[type] || type;
    });

    mockGetTestFileName.mockImplementation((type) => {
      const map: Record<string, string> = {
        "test:unit": "unit",
        "test:integration": "integration",
      };
      return map[type] || type;
    });

    // Mock process.stdout for progress updates
    process.stdout.isTTY = true;
    process.stdout.clearLine = vi.fn();
    process.stdout.cursorTo = vi.fn();
    process.stdout.write = vi.fn();
  });

  afterEach(() => {
    mockExit?.mockRestore();
    vi.restoreAllMocks();
  });

  describe("buildValidationTasks", () => {
    it("should create _errors directory", async () => {
      const mockProcess = createMockProcess(0);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      // Wait for initial setup
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Trigger close event for all spawned processes
      mockSpawn.mock.calls.forEach((call, index) => {
        const process = mockSpawn.mock.results[index].value;
        process.emit("close", 0);
      });

      await promise.catch(() => {}); // Catch the exit

      expect(mockMkdirSync).toHaveBeenCalledWith("_errors", {
        recursive: true,
      });
    });

    it("should build tasks for all detected test types", async () => {
      mockFindPackagesWithTests.mockReturnValue([
        {
          name: "@financial/pkg1",
          path: "packages/pkg1",
          availableTests: ["test:unit", "test:e2e"],
        },
        {
          name: "@financial/pkg2",
          path: "packages/pkg2",
          availableTests: ["test:integration"],
        },
      ]);

      const mockProcess = createMockProcess(0);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await new Promise((resolve) => setTimeout(resolve, 10));
      mockSpawn.mock.calls.forEach((call, index) => {
        const process = mockSpawn.mock.results[index].value;
        process.emit("close", 0);
      });

      await promise.catch(() => {});

      // Should spawn tasks for TypeScript, Lint, Format, and 3 test types
      expect(mockSpawn).toHaveBeenCalledTimes(6);

      const spawnedCommands = mockSpawn.mock.calls.map((call) => call[1][1]);
      expect(spawnedCommands).toContain("npx brain-monitor test unit");
      expect(spawnedCommands).toContain("npx brain-monitor test e2e");
      expect(spawnedCommands).toContain("npx brain-monitor test integration");
    });
  });

  describe("runValidation", () => {
    it("should run validation command and capture output", async () => {
      const mockProcess = createMockProcess(0, "Test output", "Test error");
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await new Promise((resolve) => setTimeout(resolve, 10));
      mockSpawn.mock.calls.forEach((call, index) => {
        const process = mockSpawn.mock.results[index].value;
        process.stdout.emit("data", Buffer.from("Test output"));
        process.stderr.emit("data", Buffer.from("Test error"));
        process.emit("close", 0);
      });

      await promise.catch(() => {});

      expect(mockSpawn).toHaveBeenCalled();
    });

    it("should detect TypeScript errors from output", async () => {
      const mockProcess = createMockProcess(1);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await new Promise((resolve) => setTimeout(resolve, 10));
      mockSpawn.mock.calls.forEach((call, index) => {
        const command = call[1][1];
        const process = mockSpawn.mock.results[index].value;

        if (command.includes("typecheck")) {
          process.stdout.emit(
            "data",
            Buffer.from("Found 5 errors in 3 packages"),
          );
        }
        process.emit("close", command.includes("typecheck") ? 1 : 0);
      });

      await promise.catch(() => {});

      // Check that summary was written with error count
      const summaryCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "_errors/validation-summary.md",
      );
      expect(summaryCall).toBeTruthy();
      expect(summaryCall?.[1]).toContain("5");
    });

    it("should detect test failures from output", async () => {
      const mockProcess = createMockProcess(1);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await Promise.resolve();
      mockSpawn.mock.calls.forEach((call, index) => {
        const command = call[1][1];
        const process = mockSpawn.mock.results[index].value;

        if (command.includes("test unit")) {
          process.stdout.emit("data", Buffer.from("Test failures: 3"));
        }
        process.emit("close", command.includes("test unit") ? 1 : 0);
      });

      await promise.catch(() => {});

      const summaryCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "_errors/validation-summary.md",
      );
      expect(summaryCall).toBeTruthy();
      expect(summaryCall?.[1]).toContain("3");
    });

    it("should detect lint auto-fixes", async () => {
      const mockProcess = createMockProcess(0);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await Promise.resolve();
      mockSpawn.mock.calls.forEach((call, index) => {
        const command = call[1][1];
        const process = mockSpawn.mock.results[index].value;

        if (command.includes("lint")) {
          process.stdout.emit(
            "data",
            Buffer.from("Auto-fix: Applied\nErrors: 0\nWarnings: 2"),
          );
        }
        process.emit("close", 0);
      });

      await promise.catch(() => {});

      const summaryCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "_errors/validation-summary.md",
      );
      expect(summaryCall).toBeTruthy();
      expect(summaryCall?.[1]).toContain("Auto-fix Applied:");
    });
  });

  describe("generateSummary", () => {
    it("should generate summary report with all results", async () => {
      const mockProcess = createMockProcess(0);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await Promise.resolve();
      mockSpawn.mock.calls.forEach((call, index) => {
        const process = mockSpawn.mock.results[index].value;
        process.emit("close", 0);
      });

      await promise.catch(() => {});

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "_errors/validation-summary.md",
        expect.stringContaining("Validation Summary Report"),
      );
    });

    it("should show success status when all pass", async () => {
      const mockProcess = createMockProcess(0);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await Promise.resolve();
      mockSpawn.mock.calls.forEach((call, index) => {
        const process = mockSpawn.mock.results[index].value;
        process.emit("close", 0);
      });

      await promise.catch(() => {});

      const summaryCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "_errors/validation-summary.md",
      );
      expect(summaryCall?.[1]).toContain("✅ All validations passed!");
    });

    it("should show failure status when some fail", async () => {
      const mockProcess = createMockProcess(1);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await Promise.resolve();
      mockSpawn.mock.calls.forEach((call, index) => {
        const command = call[1][1];
        const process = mockSpawn.mock.results[index].value;
        process.emit("close", command.includes("typecheck") ? 1 : 0);
      });

      await promise.catch(() => {});

      const summaryCall = mockWriteFileSync.mock.calls.find(
        (call) => call[0] === "_errors/validation-summary.md",
      );
      expect(summaryCall?.[1]).toContain("❌");
      expect(summaryCall?.[1]).toContain("validation(s) failed");
    });
  });

  describe("progress updates", () => {
    it("should update progress bar when TTY available", async () => {
      process.stdout.isTTY = true;
      const mockProcess = createMockProcess(0);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await Promise.resolve();
      mockSpawn.mock.calls.forEach((call, index) => {
        const process = mockSpawn.mock.results[index].value;
        process.emit("close", 0);
      });

      await promise.catch(() => {});

      expect(process.stdout.clearLine).toHaveBeenCalled();
      expect(process.stdout.cursorTo).toHaveBeenCalled();
      expect(process.stdout.write).toHaveBeenCalled();
    });

    it("should use console.log when not TTY", async () => {
      process.stdout.isTTY = false;
      const mockProcess = createMockProcess(0);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await Promise.resolve();

      // Allow progress interval to run
      await new Promise((resolve) => setTimeout(resolve, 150));

      mockSpawn.mock.calls.forEach((call, index) => {
        const process = mockSpawn.mock.results[index].value;
        process.emit("close", 0);
      });

      await promise.catch(() => {});

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Progress:"),
      );
    });
  });

  describe("exit codes", () => {
    it("should exit with 0 when all pass", async () => {
      const mockProcess = createMockProcess(0);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await new Promise((resolve) => setTimeout(resolve, 10));
      mockSpawn.mock.calls.forEach((call, index) => {
        const process = mockSpawn.mock.results[index].value;
        process.emit("close", 0);
      });

      await promise.catch(() => {});

      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it("should exit with 1 when some fail", async () => {
      const mockProcess = createMockProcess(1);
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = run();

      await new Promise((resolve) => setTimeout(resolve, 10));
      mockSpawn.mock.calls.forEach((call, index) => {
        const process = mockSpawn.mock.results[index].value;
        process.emit("close", 1);
      });

      await promise.catch(() => {});

      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});

// Helper to create mock child process
function createMockProcess(exitCode: number, stdout = "", stderr = "") {
  const process = {
    stdout: {
      on: vi.fn((event, handler) => {
        if (event === "data" && stdout) {
          setTimeout(() => handler(Buffer.from(stdout)), 0);
        }
      }),
      emit: vi.fn(),
    },
    stderr: {
      on: vi.fn((event, handler) => {
        if (event === "data" && stderr) {
          setTimeout(() => handler(Buffer.from(stderr)), 0);
        }
      }),
      emit: vi.fn(),
    },
    on: vi.fn(),
    emit: vi.fn(),
  };

  return process;
}
