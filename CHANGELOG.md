# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **BREAKING**: Migrated to monorepo structure using pnpm workspaces
  - Frontend moved from `/src` to `/apps/frontend`
  - Backend moved from `/server` to `/apps/backend`
  - Added Turbo for build orchestration
  - Root package.json now only contains monorepo management scripts
- Updated all scripts to use pnpm workspace commands
- Removed root-level dependencies (now in respective app packages)
- Backend continues to run on port 8765/8767 (configurable via .env)
- Frontend continues to run on port 8766

### Added
- `turbo.json` configuration for efficient builds and task running
- Monorepo structure with `/apps`, `/packages`, and `/tooling` directories
- Workspace-aware pnpm commands for parallel execution

### Removed
- Root-level `/src` directory (moved to `/apps/frontend/src`)
- Root-level `/server` directory (moved to `/apps/backend`)
- Root-level frontend configuration files (moved to `/apps/frontend`)
- Direct dependency management in root package.json