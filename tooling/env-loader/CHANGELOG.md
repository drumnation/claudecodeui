# Changelog

All notable changes to @kit/env-loader will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-17

### Added

- Initial release of @kit/env-loader
- Monorepo-aware environment loading with automatic root detection
- Hierarchical loading: root `.env` → local `.env` → defaults
- Separate exports for Node.js (`/node`) and browser (`/browser`) environments
- TypeScript support with full type definitions
- Helper functions: `getEnv`, `requireEnv`, `getIntEnv`, `getBoolEnv`
- Environment filtering with `getFilteredEnv`
- Debug mode for troubleshooting
- Required variables validation
- Browser runtime initialization with `initBrowserEnv`
- Support for multiple environment sources in browser:
  - `import.meta.env` (Vite)
  - `process.env` (webpack/bundlers)
  - `window.__ENV__` (runtime injection)

### Security

- Frontend exports don't include Node.js dependencies (fs, path)
- Automatic prefix filtering for browser environments
- Clear separation between public and private variables
