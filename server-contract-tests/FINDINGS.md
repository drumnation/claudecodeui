# Contract Test Findings

## Summary

Created a comprehensive contract test suite to compare the current backend (`/server`) with the refactored TypeScript backend (`/apps/backend`).

## Test Coverage

1. **Projects API** - All project management endpoints
2. **Git API** - Git operations (status, diff, commit, branches, etc.)
3. **File Operations** - File read/write/tree/binary operations  
4. **WebSocket** - Chat and shell WebSocket connections
5. **Config/Utility** - Configuration, server management, and audio transcription

## Current Server (`/server`) Test Results

When running tests against the current server:

### Failures Found

1. **GET /api/projects** - Returns more projects than expected (includes existing projects in user's .claude directory)
2. **POST /api/projects/create** - Returns 500 error when path doesn't exist
3. **GET /api/projects/:project/sessions** - Fails when project doesn't exist in .claude directory
4. **PUT /api/projects/:project/sessions/:sessionId/summary** - Returns 500 error
5. **DELETE /api/projects/:project/sessions/:sessionId/delete** - Returns 404
6. **GET /api/projects/:project/sessions/:sessionId/messages** - Returns different format than expected
7. **POST /api/projects/:project/rename** - Returns 404
8. **POST /api/projects/:project/delete** - Returns 404

### Key Differences from Expected API

- The current server expects projects to exist in `~/.claude/projects/` directory
- Session management is tightly coupled to filesystem structure
- Error handling returns different status codes than documented
- Some endpoints appear to be missing or not fully implemented

## Refactored Backend (`/apps/backend`) Status

The refactored backend could not be fully tested due to:

1. **Workspace Dependencies** - Requires `@kit/*` packages that are part of a larger monorepo structure
2. **Native Module Issues** - `node-pty` requires compilation
3. **Module Resolution** - TypeScript/ESM configuration differences

## Recommendations

1. **Before Migration**:
   - Review and document the actual API behavior of the current server
   - Update contract tests to match actual behavior rather than ideal behavior
   - Ensure all workspace dependencies are properly set up

2. **Migration Strategy**:
   - Port the new project detection logic from `/server` to `/apps/backend`
   - Run contract tests against both implementations
   - Fix any API incompatibilities in the refactored version
   - Gradually migrate endpoints one at a time

3. **Testing Approach**:
   - Use contract tests as a safety net during migration
   - Test with real Claude directory structure
   - Consider mocking filesystem operations for more reliable tests

## Next Steps

1. Fix the contract tests to match the actual current server behavior
2. Set up proper workspace environment for the refactored backend
3. Run tests against both implementations to identify gaps
4. Create a migration plan based on the differences found