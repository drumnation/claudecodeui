# Upstream Integration Plan

## Overview
This document outlines the strategy for integrating valuable features from the upstream repository while maintaining our architectural improvements.

## Architecture Context
- **Our Version**: Monorepo with pnpm workspaces, TypeScript migration, Bulletproof React pattern
- **Upstream**: Traditional structure, JavaScript, CommonJS backend

## Feature Comparison Matrix

| Feature | Upstream | Ours | Action Required | Priority |
|---------|----------|------|-----------------|----------|
| **CodeEditor Word Wrap** | ✅ Button toggle with extension | ❌ Missing | Add toggle button and extension | HIGH |
| **Dark Mode** | ✅ Per-component toggle | ✅ Global theme system | Keep ours | - |
| **Git Integration** | ✅ Basic routes | ✅ Comprehensive with hooks | Keep ours | - |
| **Project Directory** | ✅ JSONL parser | ✅ Directory Browser | Evaluate need | LOW |
| **Version Checking** | ✅ GitHub releases check | ❌ Missing | Adapt for monorepo | MEDIUM |
| **Audio Transcription** | ✅ Whisper API | ✅ Frontend ready, ❌ Backend | Add backend endpoint | MEDIUM |
| **Error Handling** | Basic | ✅ Structured logging | Keep ours | - |
| **TypeScript** | ❌ JavaScript only | ✅ Migration in progress | - | - |

## Implementation Tasks

### 1. CodeEditor Word Wrap (HIGH PRIORITY)
```typescript
// In packages/frontend/features/code-editor/CodeEditor.logic.ts
export const createWordWrapExtension = (enabled: boolean) => {
  return enabled ? EditorView.lineWrapping : [];
};

// Add to CodeEditor component state
const [wordWrap, setWordWrap] = useState(false);
```

### 2. Audio Transcription Backend (MEDIUM PRIORITY)
```typescript
// In apps/backend/src/modules/audio/transcription.controller.ts
export class TranscriptionController {
  async transcribe(audioFile: Buffer, mode: WhisperMode) {
    // Implement Whisper API integration
  }
}
```

### 3. Version Checking System (MEDIUM PRIORITY)
```typescript
// In packages/shared/hooks/useVersionCheck.ts
export const useVersionCheck = () => {
  // Adapt for monorepo versioning
  // Check workspace versions
};
```

### 4. Project Directory Parser (LOW PRIORITY)
Evaluate if needed for Claude project compatibility.

## Migration Strategy

### Phase 1: Direct Ports (Week 1)
- [ ] Add word wrap to CodeEditor
- [ ] Create transcription endpoint

### Phase 2: Adaptations (Week 2)
- [ ] Implement version checking for monorepo
- [ ] Evaluate project directory parser need

### Phase 3: Testing & Integration (Week 3)
- [ ] Full integration testing
- [ ] Update documentation

## Code Conversion Guidelines

### CommonJS to ESM
```javascript
// Upstream (CommonJS)
const express = require('express');
module.exports = router;

// Our Version (ESM)
import express from 'express';
export default router;
```

### JavaScript to TypeScript
```typescript
// Add types to all upstream code
interface TranscriptionRequest {
  audio: Buffer;
  mode: 'whisper-1' | 'whisper-large';
}
```

### File Structure Adaptation
```
// Upstream structure
/server/routes/git.js (their implementation)

// Our structure
/apps/backend/src/modules/git/
  ├── git.controller.ts
  ├── git.service.ts
  └── git.types.ts
```

## Conflict Resolution

1. **Always prefer our architectural patterns**
2. **Extract only the business logic from upstream**
3. **Rewrite using our patterns rather than direct copy**
4. **Maintain backward compatibility where possible**

## Testing Requirements

- Unit tests for all new features
- Integration tests for API endpoints
- Storybook stories for UI components
- E2E tests for critical paths

## Documentation Updates

- Update README with new features
- Add to CLAUDE.md for monorepo guidelines
- Create feature-specific docs in `/docs`