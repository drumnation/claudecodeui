# Changelog

All notable changes to @kit/brain-monitor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Dev Server with Logging** (`brain:dev` command, now used by `pnpm dev`):
  - Starts all 4 dev servers (frontend, backend, lead-agent, sim-agent) with integrated logging
  - Writes server output directly to log files in `_logs/`
  - Replaces the need for external log file monitoring
  - Shows colored output in terminal while saving to files
  - Handles graceful shutdown of all processes
  - Cleans up existing processes before starting
  - Now the default for `pnpm dev` command

- **Watch Mode** (`brain:watch` command):
  - Continuous validation with file watching
  - Default: TypeScript + Lint only (fast, low resource usage)
  - `--all` flag to watch all validations including tests
  - `--interval` flag to control update throttling (default: 5 seconds)
  - Creates `_errors/watch-summary.md` for live status monitoring
  - Updates existing error reports in real-time

- **Improved Directory Structure**:
  - Reorganized `_errors/` directory into clear hierarchy:
    - `validation-summary.md` at root for quick overview
    - `reports/` subdirectory for all detailed error reports
    - `.counts/` hidden subdirectory for run count tracking
  - Cleaner, more navigable structure for agents and developers

- **GitHub Actions CI/CD Integration**:
  - `ci:init` command to generate GitHub Actions workflows
  - `ci:test` command to test workflows locally with act
  - `ci:update` command to update existing workflows
  - Automatic PR comments with validation results
  - Artifact uploads for error reports

- **Cursor IDE Integration**:
  - Automatic rule installation to `.cursor/rules/` during init
  - `brain-monitor-validation.rules.mdc` with all commands and paths
  - Ensures AI assistants know correct report locations

- **Log Monitor Improvements**:
  - Fixed log formatting (removed triple backticks between lines)
  - Dynamic server discovery from `apps/` directory
  - Single log file per server (overwrites on restart)
  - Automatic cleanup of old timestamped log files

### Changed

- All error reports now go to `_errors/reports/` instead of `_errors/` root
- Count files moved from `_errors/.{type}-run-count` to `_errors/.counts/.{type}-run-count`
- Log entries now grouped in single code blocks for better readability
- Updated all documentation paths to reflect new directory structure

### Fixed

- TypeScript errors in brain-monitor package (35 errors resolved)
- Import paths updated for `moduleResolution: "NodeNext"`
- Log monitor now correctly overwrites files instead of appending
- Server log capture issues - added new `brain:dev` command that properly captures stdout/stderr
- Removed dependency on non-existent log files for monitoring

## [0.0.0] - 2025-01-01

### Added

- Initial release of @kit/brain-monitor
- **CLI Commands**:
  - `validate` - Run all validation tasks (typecheck, lint, format, tests)
  - `typecheck` - Run TypeScript validation only
  - `lint` - Run ESLint validation only
  - `format` - Run Prettier validation only
  - `test <type>` - Run specific test suite validation
  - `logs` - Start real-time log monitoring
  - `init` - Bootstrap scripts and documentation in target project
- **Core Features**:
  - Auto-detection of available test suites across monorepo
  - Parallel execution of validation tasks
  - Markdown report generation in `_errors/` directory
  - Real-time log streaming to `_logs/` directory
  - Multi-agent collaboration support
  - Zero-configuration setup
- **Test Suite Support**:
  - Standard test commands (`test`, `test:unit`, `test:integration`, `test:e2e`)
  - Extended E2E variants (`test:e2e:ui`, `test:e2e:api`, `test:e2e:browser`)
  - Storybook testing (`test:storybook`, `test:storybook:interaction`, `test:storybook:e2e`)
- **Output Files**:
  - Individual error reports for each validation type
  - Combined validation summary
  - Organized log files with index
- **Developer Experience**:
  - Graceful error handling and recovery
  - Progress indicators with emojis
  - Execution time tracking
  - Failed task retry suggestions

### Technical Details

- Built with TypeScript and ESM modules
- Uses functional programming patterns (no classes)
- Exports raw TypeScript files (monorepo convention)
- Supports pnpm workspaces
- Compatible with Vitest, Jest, and other standard test runners

### Migration from Scripts

This package consolidates and replaces the following shell scripts:
- `scripts/run-all-validations.ts` → `brain-monitor validate`
- `scripts/collect-errors.ts` → `brain-monitor typecheck`
- `scripts/collect-lint-failures.ts` → `brain-monitor lint`
- `scripts/collect-format-failures.ts` → `brain-monitor format`
- `scripts/collect-test-failures-*.ts` → `brain-monitor test <type>`
- `scripts/monitor-logs.ts` → `brain-monitor logs`
- `scripts/detect-available-tests.ts` → Internal auto-detection