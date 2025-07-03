# Components Architecture

This directory follows the **Bulletproof React** pattern with feature-based organization and atomic design principles.

## Structure

```
components/
├── atoms/           # Basic building blocks (Button, Input, Badge, ScrollArea)
├── molecules/       # Composed components (MobileNav, CommandMenu, TodoList, DarkModeToggle)
├── organisms/       # Complex composed components (to be added)
├── layouts/         # Layout components (to be added)
└── index.ts         # Main exports
```

## Migration Status

### ✅ Completed Migrations

#### Atomic Components (`/atoms/`)
- **Button** - Enhanced with logging and interaction tracking
- **Input** - Added validation logging and privacy protection  
- **Badge** - Extended with additional variants (success, warning, info)
- **ScrollArea** - Enhanced with scroll tracking and orientation support

#### Feature Components
- **Chat Feature** (`/src/features/chat/`)
  - ClaudeLogo, ClaudeStatus, MicButton
  - ChatInterface (placeholder - full migration pending)
- **Files Feature** (`/src/features/files/`)
  - CodeEditor, FileTree, ImageViewer
- **Projects Feature** (`/src/features/projects/`)
  - Sidebar (streamlined version)
- **Settings Feature** (`/src/features/settings/`)
  - ToolsSettings
- **Tools Feature** (`/src/features/tools/`)
  - Complete architecture with types and API

#### Molecule Components (`/molecules/`)
- **DarkModeToggle** - Enhanced with size variants and theme tracking
- **MobileNav** - Touch interaction logging and navigation analytics
- **CommandMenu** - Command selection tracking and enhanced UX
- **TodoList** - Status analytics and interaction monitoring

### ⏳ Pending Migrations

#### Large Components (Staged)
- **ChatInterface.tsx** (2859 lines) - Complex message handling
- **MainContent.tsx** (563 lines) - Main layout orchestration  
- **Shell.tsx** (623 lines) - Terminal interface
- **GitPanel.tsx, LivePreviewPanel.tsx** - Shell feature components
- **QuickSettingsPanel.tsx** - Settings feature

## Migration Guidelines

### For New Components
1. **Start with Atoms** - Create reusable building blocks
2. **Feature-First** - Place components in appropriate feature directories
3. **Shared Last** - Only move to shared if used across 3+ features
4. **Comprehensive Logging** - Use `@kit/logger/react` for all interactions

### Import Patterns
```typescript
// ✅ Preferred - Feature imports
import { ChatInterface } from '@/features/chat';
import { FileTree } from '@/features/files';

// ✅ Atomic components
import { Button, Input } from '@/components/atoms/Button';

// ✅ Molecule components  
import { MobileNav, DarkModeToggle } from '@/components/molecules';

// ❌ Avoid - Direct component imports
import ChatInterface from '@/components/ChatInterface';
```

### Logging Standards
All components should include:
```typescript
import { useLogger } from '@kit/logger/react';

function MyComponent() {
  const logger = useLogger({ scope: 'MyComponent' });
  
  useEffect(() => {
    logger.info('Component mounted', { props: ... });
  }, []);
  
  const handleAction = () => {
    logger.debug('User action', { action: 'click', target: '...' });
  };
}
```

## Benefits

### ✅ Achieved
- **Feature Boundaries** - Clear separation of concerns
- **Reusability** - Atomic components used throughout app
- **Maintainability** - Easy to locate and update components
- **Debugging** - Comprehensive logging for all interactions
- **Performance** - Optimized logging without runtime impact
- **Accessibility** - Enhanced keyboard navigation and ARIA support

### 🎯 Goals
- **Scalability** - Easy to add new features
- **Team Collaboration** - Clear ownership boundaries
- **Testing** - Isolated components for easier testing
- **Documentation** - Self-documenting through enhanced logging

## Component Guidelines

### Atomic Components
- Single responsibility
- No business logic
- Highly reusable
- Comprehensive prop interfaces
- Enhanced logging for interactions

### Feature Components  
- Business logic specific to feature
- Can import atoms and shared components
- Cannot import other feature components
- API services as singletons
- Complete type definitions

### Molecule Components
- Composed of multiple atoms
- Used across multiple features  
- Generic, configurable behavior
- Well-documented props interface
- Comprehensive interaction logging
- Mobile-friendly design

## Architecture Compliance

This structure follows:
- ✅ **Bulletproof React** - Feature-slice pattern
- ✅ **Atomic Design** - Hierarchical component structure  
- ✅ **TypeScript** - Full type safety
- ✅ **Accessibility** - WCAG 2.1 compliance
- ✅ **Performance** - Optimized rendering and logging
- ✅ **Testing** - Testable component isolation