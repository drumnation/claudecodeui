# Session Duplication Management

## Overview
Since the Claude Code UI currently creates new sessions instead of resuming existing ones (which will be fixed in a future branch), we've implemented features to help manage and identify duplicate sessions.

## Changes Made

### 1. Session Origin Tracking
- UI-created sessions now have a `ui-` prefix in their ID (e.g., `ui-session-1234567890`)
- Sessions store metadata about their origin (`webui` vs direct CLI usage)
- Both mobile and desktop interfaces show a blue "UI" badge for sessions created through the web interface

### 2. Duplicate Session Counter
- When generating session titles, the system checks for existing sessions with the same title
- Duplicate sessions are numbered automatically (e.g., "Fix authentication bug", "Fix authentication bug (2)", "Fix authentication bug (3)")
- This helps track the progression of related sessions

### 3. Visual Indicators
- **UI Badge**: Blue outline badge showing "UI" for sessions created through the web interface
- **Message Count**: Gray badge showing the number of messages in the session
- **Active Indicator**: Green pulsing dot for currently active sessions

## Implementation Details

### Backend Changes
1. **Session Service** (`apps/backend/src/modules/sessions/sessions.service.ts`):
   - Added `findDuplicateSessions()` method to count existing sessions with similar titles
   - Updated `updateSessionTitle()` to accept metadata and append duplicate counters
   - Session titles now include automatic numbering for duplicates

2. **WebSocket Handler** (`apps/backend/src/modules/claude-cli/claude-cli.websocket.ts`):
   - Session IDs now include `ui-` prefix when created through the web UI
   - Session metadata includes `origin: 'webui'` flag
   - Title generation passes metadata to the sessions service

3. **API Endpoints** (`apps/backend/src/main.ts`):
   - Session list API now includes metadata in the response
   - Sessions display their origin information

### Frontend Changes
1. **Session Display** (`src/features/projects/components/SessionItem/`):
   - Both mobile and web versions show the "UI" badge for web-created sessions
   - Badge uses blue color to distinguish from other status indicators
   - Checks both metadata.origin and session ID prefix for compatibility

## Configuration
No additional configuration needed. The system automatically:
- Detects UI-created sessions
- Numbers duplicate sessions
- Shows appropriate badges

## Future Improvements
Once session resuming is fixed:
- The duplicate counter will be less necessary
- The UI badge will still help identify session origins
- Consider adding a "continuation" indicator for resumed sessions