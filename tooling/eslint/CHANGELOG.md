# Changelog

All notable changes to `@kit/eslint-config` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-01

### 🎉 TypeScript Migration

Complete rewrite of all ESLint configurations from JavaScript to TypeScript for better type safety and IDE support.

### Added

- **TypeScript configurations** - All `.js` files converted to `.ts` with full type exports
- **Import sorting presets** - Granular control over import organization patterns
- **Playwright configuration** - Dedicated rules for E2E test files
- **Services configuration** - Backend-specific rules with security focus
- **Apps configuration** - Stricter rules for application code vs libraries
- **Custom rule types** - Full TypeScript definitions for all configurations

### Changed

- **File extensions** - All configuration files now use `.ts` extension
- **Import statements** - Updated to use `.js` extensions for ESM compatibility
- **Export structure** - Now uses named exports with proper typing
- **Plugin versions** - Updated all ESLint plugins to latest versions:
  - `@typescript-eslint/*`: 8.x
  - `eslint-plugin-react`: 7.x
  - `eslint-plugin-react-hooks`: 5.x
  - `eslint-plugin-import`: 2.x
  - `eslint-plugin-jsx-a11y`: 6.x
  - `eslint-plugin-storybook`: 0.11.x

### Improved

- **Type safety** - All configurations now have full TypeScript support
- **IDE integration** - Better autocomplete and error detection
- **Performance** - Lazy loading of configurations reduces initial load time
- **Documentation** - Comprehensive README with examples and troubleshooting

### Breaking Changes

- Minimum Node.js version is now 18.x
- ESLint 9.x is required (was 8.x)
- Configuration files must use `.ts` extension
- Import paths must include `.js` extension

### Migration Notes

1. Update ESLint to v9.x:

   ```bash
   pnpm add -D eslint@^9.0.0
   ```

2. If using JavaScript config files, rename to `.ts`:

   ```bash
   mv eslint.config.js eslint.config.ts
   ```

3. Update imports to use `.js` extension:

   ```typescript
   // Old
   import baseConfig from '@kit/eslint-config/base';

   // New
   import baseConfig from '@kit/eslint-config/base.js';
   ```

## [1.8.0] - 2024-12-15

### Added

- Import sorting configuration with customizable groups
- Support for workspace package sorting
- Type import separation rules

### Changed

- Improved React hooks exhaustive deps warnings
- Better handling of custom hooks

## [1.7.0] - 2024-11-30

### Added

- Storybook configuration for story files
- Story naming conventions enforcement
- CSF3 format support

### Fixed

- False positives in React effect dependencies
- Import cycle detection in monorepos

## [1.6.0] - 2024-11-01

### Added

- Services configuration for backend Node.js code
- Security-focused rules for API development
- Express.js specific linting

### Changed

- More granular control over console.log warnings
- Allow console.error and console.warn by default

## [1.5.0] - 2024-10-15

### Added

- Apps configuration with stricter rules
- Performance-focused React rules
- Accessibility improvements

### Fixed

- TypeScript parser configuration for monorepos
- Path resolution for custom aliases

## [1.4.0] - 2024-09-30

### Added

- JSX accessibility rules (jsx-a11y)
- React 18 concurrent features support
- Suspense and error boundary rules

### Changed

- Updated React plugin to latest version
- Improved TypeScript integration

## [1.3.0] - 2024-09-01

### Added

- Prettier integration for consistent formatting
- Format-on-save configuration examples
- Conflict resolution between ESLint and Prettier

### Fixed

- Semicolon and quote rule conflicts
- Trailing comma inconsistencies

## [1.2.0] - 2024-08-15

### Added

- React hooks rules configuration
- Custom hook pattern recognition
- Exhaustive deps validation

### Changed

- More permissive unused variable rules
- Allow underscore prefix for ignored variables

## [1.1.0] - 2024-08-01

### Added

- TypeScript ESLint parser and plugin
- Type-aware linting rules
- Project reference support

### Fixed

- Parser options for different TypeScript versions
- Module resolution in workspaces

## [1.0.0] - 2024-07-15

### Added

- Initial release with base configuration
- React configuration with JSX support
- Basic TypeScript support
- Import plugin for module resolution
- Comprehensive documentation

[2.0.0]: https://github.com/yourorg/monorepo/compare/@kit/eslint-config@1.8.0...@kit/eslint-config@2.0.0
[1.8.0]: https://github.com/yourorg/monorepo/compare/@kit/eslint-config@1.7.0...@kit/eslint-config@1.8.0
[1.7.0]: https://github.com/yourorg/monorepo/compare/@kit/eslint-config@1.6.0...@kit/eslint-config@1.7.0
[1.6.0]: https://github.com/yourorg/monorepo/compare/@kit/eslint-config@1.5.0...@kit/eslint-config@1.6.0
[1.5.0]: https://github.com/yourorg/monorepo/compare/@kit/eslint-config@1.4.0...@kit/eslint-config@1.5.0
[1.4.0]: https://github.com/yourorg/monorepo/compare/@kit/eslint-config@1.3.0...@kit/eslint-config@1.4.0
[1.3.0]: https://github.com/yourorg/monorepo/compare/@kit/eslint-config@1.2.0...@kit/eslint-config@1.3.0
[1.2.0]: https://github.com/yourorg/monorepo/compare/@kit/eslint-config@1.1.0...@kit/eslint-config@1.2.0
[1.1.0]: https://github.com/yourorg/monorepo/compare/@kit/eslint-config@1.0.0...@kit/eslint-config@1.1.0
[1.0.0]: https://github.com/yourorg/monorepo/releases/tag/@kit/eslint-config@1.0.0
