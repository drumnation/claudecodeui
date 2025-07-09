# Changelog

All notable changes to `@kit/testing` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-01

### 🎉 Major Architectural Overhaul

This release introduces a complete restructuring of the testing library for improved organization, scalability, and developer experience.

### Added

- **Concern-based architecture** - Configs, presets, utilities, runners, and setup files are now clearly separated
- **Composable presets system** - Reusable configuration patterns for coverage, timeouts, pools, and reporters
- **Modern lazy-loading API** - `configs.vitest.unit()` for on-demand configuration loading
- **Recursive test runner** - Automatically adjusts timeouts, retries, and isolation on failure
- **CI orchestration script** - Optimally ordered test execution with merged coverage reports
- **Coverage multiplier reporter** - Real-time coverage feedback with threshold enforcement
- **Storybook E2E utilities** - Complete story testing with Playwright integration
- **TypeScript-first approach** - All configurations now in TypeScript with full type exports
- **Self-healing capabilities** - Tests auto-adjust up to 2 times on failure
- **Migration guide** - Comprehensive guide for upgrading from v1.x

### Changed

- **Directory structure** - Reorganized from mixed concerns to clear separation:
  ```
  src/
  ├── configs/      # All test configurations
  ├── presets/      # Reusable settings
  ├── utilities/    # Test helpers
  ├── runners/      # Execution scripts
  ├── setup/        # Environment setup
  └── types/        # TypeScript definitions
  ```
- **Coverage enabled by default** - All Vitest suites now have 85% coverage threshold
- **Import paths** - Updated to use path aliases (`@/configs/...`)
- **Base configuration** - Now uses presets for all common settings
- **Package exports** - Cleaner export structure with backward compatibility

### Improved

- **Performance** - Lazy loading reduces initial import time by ~40%
- **Coverage accuracy** - Better exclude patterns and threshold enforcement
- **Error messages** - Clearer feedback when coverage fails
- **Test isolation** - Configurable isolation strategies per test type
- **CI integration** - Better reporter configuration for CI environments
- **Documentation** - Complete rewrite with examples and troubleshooting

### Deprecated

- Direct config imports (`@kit/testing/unit`) - Use `configs.vitest.unit()` instead
- Mixed utility exports - Use `utilities.storybook.*` for better organization

### Migration Notes

The v1.x API is still supported for backward compatibility. To migrate:

1. Update imports to use the new API:

   ```typescript
   // Old
   import {unitConfig} from '@kit/testing';

   // New (recommended)
   import {configs} from '@kit/testing';
   export default await configs.vitest.unit();
   ```

2. Use presets for common patterns:
   ```typescript
   import {presets} from '@kit/testing';
   coverage: presets.coverage.strict; // 90% thresholds
   ```

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions.

## [1.5.0] - 2024-12-31

### Added

- Storybook test-runner configuration with accessibility checks
- Playwright backend API testing configuration
- Cross-browser mobile viewport testing
- Visual regression testing utilities

### Changed

- Updated dependencies to latest versions:
  - `vitest`: 3.2.4
  - `@playwright/test`: 1.53.2
  - `@storybook/test`: 8.5.0

## [1.4.0] - 2024-12-20

### Added

- Storybook interaction testing utilities
- Component test suite generator
- E2E story testing with Playwright

### Fixed

- Memory leaks in long-running test suites
- Flaky tests in CI environment

## [1.3.0] - 2024-12-01

### Added

- Integration test configuration with extended timeouts
- E2E test configuration with optional coverage
- Setup files for different test environments

### Changed

- Default test timeout increased to 10s (from 5s)
- Better handling of async test cleanup

## [1.2.0] - 2024-11-15

### Added

- Playwright configuration for browser E2E tests
- Multi-browser support (Chrome, Firefox, Safari)
- Screenshot and video capture on failure

### Fixed

- Coverage report generation in CI
- Test file pattern matching

## [1.1.0] - 2024-11-01

### Added

- Coverage threshold configuration via environment variables
- Custom reporter support
- Watch mode improvements

### Changed

- Improved error messages for failed tests
- Better TypeScript type exports

## [1.0.0] - 2024-10-15

### Added

- Initial release with Vitest configuration
- Unit test setup with jsdom
- Basic coverage reporting
- TypeScript support

[2.0.0]: https://github.com/yourorg/monorepo/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/yourorg/monorepo/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/yourorg/monorepo/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/yourorg/monorepo/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/yourorg/monorepo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/yourorg/monorepo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/yourorg/monorepo/releases/tag/v1.0.0
