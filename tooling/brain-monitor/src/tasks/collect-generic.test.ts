import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { writeFileSync, existsSync, mkdirSync } from "fs";

// Create mock execAsync before importing the module
const mockExecAsync = vi.fn(() => Promise.resolve({ stdout: "", stderr: "" }));

// Mock modules
vi.mock("child_process", async () => {
  const actual =
    await vi.importActual<typeof import("child_process")>("child_process");
  return {
    ...actual,
    exec: vi.fn(),
  };
});

vi.mock("fs");

vi.mock("util", async () => {
  const actual = await vi.importActual<typeof import("util")>("util");
  return {
    ...actual,
    promisify: vi.fn(() => mockExecAsync),
  };
});

// Mock chalk to avoid color codes in tests
vi.mock("chalk", () => ({
  default: {
    blue: (str: string) => str,
    green: (str: string) => str,
    yellow: (str: string) => str,
    red: (str: string) => str,
  },
}));

// Import after mocks are set up
import { run } from "./collect-generic.js";

describe("collect-generic", () => {
  const mockWriteFileSync = vi.mocked(writeFileSync);
  const mockExistsSync = vi.mocked(existsSync);
  const mockMkdirSync = vi.mocked(mkdirSync);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mockExecAsync to default behavior
    mockExecAsync.mockResolvedValue({ stdout: "", stderr: "" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("directory creation", () => {
    it("should create _errors directory if it does not exist", async () => {
      mockExistsSync.mockReturnValue(false);
      mockExecAsync.mockResolvedValue({ stdout: "", stderr: "" });

      await run("unit");

      expect(mockExistsSync).toHaveBeenCalledWith("_errors");
      expect(mockMkdirSync).toHaveBeenCalledWith("_errors", {
        recursive: true,
      });
    });

    it("should not create _errors directory if it already exists", async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecAsync.mockResolvedValue({ stdout: "", stderr: "" });

      await run("unit");

      expect(mockExistsSync).toHaveBeenCalledWith("_errors");
      expect(mockMkdirSync).not.toHaveBeenCalled();
    });
  });

  describe("test execution", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
    });

    it("should run test command with correct format", async () => {
      mockExecAsync.mockResolvedValue({
        stdout: "All tests passed",
        stderr: "",
      });

      await run("unit");

      expect(mockExecAsync).toHaveBeenCalledWith("pnpm test:unit", {
        maxBuffer: 50 * 1024 * 1024,
      });
    });

    it("should handle test type with prefix", async () => {
      mockExecAsync.mockResolvedValue({ stdout: "", stderr: "" });

      await run("test:integration");

      expect(mockExecAsync).toHaveBeenCalledWith("pnpm test:integration", {
        maxBuffer: 50 * 1024 * 1024,
      });
    });

    it("should handle execution errors gracefully", async () => {
      const error = new Error("Command failed");
      Object.assign(error, {
        stdout: "Some test output",
        stderr: "Test failed with error",
      });
      mockExecAsync.mockRejectedValue(error);

      await run("unit");

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "_errors/errors.unit-failures.md",
        expect.stringContaining("Test failed with error"),
      );
    });
  });

  describe("failure parsing", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
    });

    it("should parse FAIL markers", async () => {
      const output = `
Running tests...
✓ test1 passed
FAIL test2.spec.ts
  Error: Expected true to be false
  at test2.spec.ts:10:5
✓ test3 passed
`;
      mockExecAsync.mockResolvedValue({ stdout: output, stderr: "" });

      await run("unit");

      const reportCall = mockWriteFileSync.mock.calls[0];
      expect(reportCall[0]).toBe("_errors/errors.unit-failures.md");
      expect(reportCall[1]).toContain("FAIL test2.spec.ts");
      expect(reportCall[1]).toContain("Expected true to be false");
      expect(reportCall[1]).toContain("Total failures found: 1");
    });

    it("should parse ✗ markers", async () => {
      const output = `
Test Suite
  ✓ test passed
  ✗ test failed
    Assertion error
    Stack trace here
  ✓ another test passed
`;
      mockExecAsync.mockResolvedValue({ stdout: output, stderr: "" });

      await run("integration");

      const reportCall = mockWriteFileSync.mock.calls[0];
      expect(reportCall[1]).toContain("✗ test failed");
      expect(reportCall[1]).toContain("Assertion error");
      expect(reportCall[1]).toContain("Total failures found: 1");
    });

    it('should parse "failed" keyword', async () => {
      const output = `
1 test passed
2 tests failed:
  - Component render test
  - API integration test
Summary: 2 failed, 1 passed
`;
      mockExecAsync.mockResolvedValue({ stdout: output, stderr: "" });

      await run("e2e");

      const reportCall = mockWriteFileSync.mock.calls[0];
      expect(reportCall[1]).toContain("2 tests failed");
      expect(reportCall[1]).toContain("Total failures found: 1");
    });

    it("should handle multiple failures", async () => {
      const output = `
FAIL test1.spec.ts
  Error 1
FAIL test2.spec.ts  
  Error 2
✗ test3 failed
  Error 3
`;
      mockExecAsync.mockResolvedValue({ stdout: output, stderr: "" });

      await run("unit");

      const reportCall = mockWriteFileSync.mock.calls[0];
      expect(reportCall[1]).toContain("Total failures found: 3");
      expect(reportCall[1]).toContain("Failure 1");
      expect(reportCall[1]).toContain("Failure 2");
      expect(reportCall[1]).toContain("Failure 3");
    });

    it("should handle no failures", async () => {
      const output = `
✓ All tests passed
✓ 100% coverage
✓ No errors found
`;
      mockExecAsync.mockResolvedValue({ stdout: output, stderr: "" });

      await run("unit");

      const reportCall = mockWriteFileSync.mock.calls[0];
      expect(reportCall[1]).toContain("Total failures found: 0");
      expect(reportCall[1]).toContain("✅ All tests passed!");
      expect(reportCall[1]).toContain("No action needed");
    });
  });

  describe("report generation", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
    });

    it("should generate report with correct filename", async () => {
      mockExecAsync.mockResolvedValue({ stdout: "", stderr: "" });

      await run("unit");

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "_errors/errors.unit-failures.md",
        expect.any(String),
      );
    });

    it("should sanitize test type for filename", async () => {
      mockExecAsync.mockResolvedValue({ stdout: "", stderr: "" });

      await run("test:e2e:browser");

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "_errors/errors.test-e2e-browser-failures.md",
        expect.any(String),
      );
    });

    it("should include timestamp in report", async () => {
      const mockDate = new Date("2024-01-15T10:30:00Z");
      vi.setSystemTime(mockDate);

      mockExecAsync.mockResolvedValue({ stdout: "", stderr: "" });

      await run("unit");

      const reportCall = mockWriteFileSync.mock.calls[0];
      expect(reportCall[1]).toContain("2024-01-15T10:30:00.000Z");

      vi.useRealTimers();
    });

    it("should include test command in report", async () => {
      mockExecAsync.mockResolvedValue({ stdout: "", stderr: "" });

      await run("integration");

      const reportCall = mockWriteFileSync.mock.calls[0];
      expect(reportCall[1]).toContain("Test command: `pnpm test:integration`");
    });

    it("should format failures with code blocks", async () => {
      const output = `
FAIL Component test
  Expected value to be true
  Received: false
`;
      mockExecAsync.mockResolvedValue({ stdout: output, stderr: "" });

      await run("unit");

      const reportCall = mockWriteFileSync.mock.calls[0];
      expect(reportCall[1]).toContain("```\nFAIL Component test");
      expect(reportCall[1]).toContain("Received: false\n```");
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
    });

    it("should write error report on exception", async () => {
      const error = new Error("Unexpected error");
      mockExecAsync.mockRejectedValue(error);

      await run("unit");

      const reportCall = mockWriteFileSync.mock.calls[0];
      expect(reportCall[0]).toBe("_errors/errors.unit-failures.md");
      expect(reportCall[1]).toContain("Test Collection Error");
      expect(reportCall[1]).toContain("Unexpected error");
      expect(reportCall[1]).toContain("Troubleshooting");
    });

    it("should handle missing stdout/stderr in error", async () => {
      const error = new Error("Command not found");
      mockExecAsync.mockRejectedValue(error);

      await run("custom");

      const reportCall = mockWriteFileSync.mock.calls[0];
      expect(reportCall[1]).toContain("Command not found");
    });

    it("should log errors to console", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      const error = new Error("Test error");
      mockExecAsync.mockRejectedValue(error);

      await run("unit");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error collecting unit test failures:"),
        error,
      );
    });
  });

  describe("console output", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
    });

    it("should log start message", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");
      mockExecAsync.mockResolvedValue({ stdout: "", stderr: "" });

      await run("unit");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Collecting unit test failures..."),
      );
    });

    it("should log success message with failure count", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");
      const output = "FAIL test1\nFAIL test2";
      mockExecAsync.mockResolvedValue({ stdout: output, stderr: "" });

      await run("unit");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Report saved to _errors/errors.unit-failures.md",
        ),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Found 2 test failures"),
      );
    });
  });
});
