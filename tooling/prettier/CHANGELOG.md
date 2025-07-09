# Changelog

All notable changes to `@kit/prettier-config` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-01

### Added

- Initial release with core Prettier configuration
- TypeScript configuration file (`index.ts`)
- ESM module support with proper exports
- Comprehensive README with usage examples
- IDE integration instructions for VS Code and IntelliJ
- Git hooks setup guide with husky and lint-staged
- CI integration examples

### Configuration

The initial configuration includes these formatting rules:

- **Indentation**: 2 spaces (`tabWidth: 2`, `useTabs: false`)
- **Semicolons**: Always required (`semi: true`)
- **Quotes**: Single quotes preferred (`singleQuote: true`)
- **Line width**: 80 characters (`printWidth: 80`)
- **Arrow functions**: Always use parentheses (`arrowParens: 'always'`)
- **Object spacing**: No spaces inside braces (`bracketSpacing: false`)
- **JSX brackets**: Closing bracket on new line (`bracketSameLine: false`)
- **Line endings**: Auto-detect (`endOfLine: 'auto'`)

### Design Decisions

- **TypeScript-first**: Configuration written in TypeScript for better type safety
- **ESM exports**: Using modern ES modules with `.js` extension in imports
- **Minimal config**: Only essential rules to avoid over-configuration
- **Git-friendly**: Settings chosen to minimize diff noise
- **Cross-platform**: Works on Windows, macOS, and Linux

### Integration

- Works seamlessly with `@kit/eslint-config`
- Compatible with all major IDEs and editors
- Supports monorepo workflows with PNPM
- Provides format-on-save capabilities

[0.1.0]: https://github.com/yourorg/monorepo/releases/tag/@kit/prettier-config@0.1.0
