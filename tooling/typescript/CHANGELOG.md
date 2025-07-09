# Changelog

All notable changes to `@kit/tsconfig` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-01-01

### Added

- `noUncheckedIndexedAccess` flag for safer array/object access
- `useDefineForClassFields` for standard class field behavior
- Support for `.mts` and `.cts` file extensions
- `tsBuildInfoFile` configuration example in README

### Changed

- Updated to ES2022 target (from ES2020)
- Improved path alias documentation
- Better ESM/CJS dual package examples

### Fixed

- React configuration now properly includes `jsx: "react-jsx"`

## [1.2.0] - 2024-11-15

### Added

- Incremental compilation support by default
- `allowJs` option for gradual migration projects
- Performance optimization tips in README

### Changed

- Module resolution set to "bundler" for better compatibility
- Updated minimum TypeScript version to 5.0

### Removed

- Deprecated `importsNotUsedAsValues` option

## [1.1.0] - 2024-09-30

### Added

- React configuration (`react.json`)
- Node.js specific configuration (`node.json`)
- Support for project references
- Composite project examples

### Changed

- Base configuration now more strict by default
- Better organization of compiler options

### Fixed

- Issue with module resolution in monorepo setups

## [1.0.0] - 2024-08-15

### Added

- Initial release
- Base TypeScript configuration with strict mode
- ESM-first approach
- Support for modern JavaScript features
- Comprehensive documentation

[1.3.0]: https://github.com/yourorg/monorepo/compare/@kit/tsconfig@1.2.0...@kit/tsconfig@1.3.0
[1.2.0]: https://github.com/yourorg/monorepo/compare/@kit/tsconfig@1.1.0...@kit/tsconfig@1.2.0
[1.1.0]: https://github.com/yourorg/monorepo/compare/@kit/tsconfig@1.0.0...@kit/tsconfig@1.1.0
[1.0.0]: https://github.com/yourorg/monorepo/releases/tag/@kit/tsconfig@1.0.0
