# Git Feature

The Git feature provides a comprehensive Git interface for version control operations. It enables users to view repository status, stage changes, commit code, manage branches, and review commit history - all within the Claude Code UI.

## Overview

The Git feature offers a visual Git client integrated into the development environment. It provides real-time repository status updates, visual diff viewing, and streamlined workflows for common Git operations without requiring command-line interaction.

## Components Structure

### Main Components
- **GitPanel** - Main container orchestrating all Git functionality
- **BranchSelector** - Dropdown for branch switching and creation
- **FileList** - List of changed files with staging controls
- **FileItem** - Individual file change display with diff viewer
- **CommitMessage** - Commit message input with AI generation support
- **CommitHistory** - List of recent commits
- **CommitItem** - Individual commit display
- **NewBranchModal** - Modal dialog for creating new branches

### File Structure
```
git/
├── index.js                    # Main export
├── GitPanel.jsx               # Main component
├── GitPanel.styles.js         # Styled components
├── GitPanel.hook.js           # Custom hooks and state management
├── GitPanel.logic.js          # Business logic and API calls
├── GitPanel.stories.jsx       # Storybook stories
├── README.md                  # This file
├── BranchSelector/
├── CommitMessage/
├── FileList/
├── FileItem/
├── CommitHistory/
├── CommitItem/
└── NewBranchModal/
```

## Key Features

### Repository Status
- Real-time file change detection
- Visual status indicators (modified, added, deleted, renamed, untracked)
- Staged vs unstaged file separation
- Change count badges
- Conflict detection and marking

### File Management
- Select/deselect individual files for staging
- Select/deselect all changes at once
- View inline diffs with syntax highlighting
- Expand/collapse diff views
- Word wrap toggle for long lines
- Line-by-line change visualization

### Diff Viewer
- Syntax-highlighted diffs
- Added/removed line indicators
- Line numbers for reference
- Copy diff content
- Responsive width handling
- Mobile-optimized view

### Branch Operations
- Switch between local branches
- Create new branches from current
- View current branch name
- Branch list with search
- Protected branch indicators
- Fast branch switching

### Commit Workflow
- Multi-line commit message input
- AI-powered commit message generation
- Voice input for commit messages
- Commit message validation
- Character count indicator
- Commit with selected files only

### History View
- Chronological commit list
- Commit hash and author info
- Relative timestamps
- Expandable commit diffs
- Copy commit hash
- Navigate to files from commits

## API Integration

The component integrates with the following Git API endpoints:
- `/api/git/status` - Get repository status and changed files
- `/api/git/branches` - List all branches
- `/api/git/checkout` - Switch to different branch
- `/api/git/create-branch` - Create new branch
- `/api/git/diff` - Get file diffs
- `/api/git/commits` - Get commit history
- `/api/git/commit-diff` - Get specific commit diff
- `/api/git/generate-commit-message` - AI-generate commit message
- `/api/git/commit` - Create new commit

## State Management

The feature uses React hooks for state management:
- **useGitPanel** - Main state management hook
- **useGitStatus** - Monitors repository status
- **useCommitMessage** - Handles commit message state
- **useBranchOperations** - Manages branch operations
- **useFileSelection** - Tracks selected files

## Performance Considerations

- Debounced status polling (5 second intervals)
- Diff content lazy loading
- Virtualized file lists for large changesets
- Memoized component renders
- Optimistic UI updates
- Background status refresh

## UI/UX Features

### Visual Design
- Color-coded file status badges
- Icon indicators for operations
- Smooth expand/collapse animations
- Loading states for async operations
- Error state handling
- Empty states with guidance

### Mobile Support
- Responsive layout adjustments
- Touch-friendly controls
- Swipe gestures for navigation
- Optimized diff viewing
- Condensed information display

### Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader announcements
- High contrast mode support

## Error Handling

- Network failure recovery
- Git operation error messages
- Validation before operations
- Rollback on failures
- User-friendly error descriptions

## Configuration

- Polling interval settings
- Default commit message templates
- Diff view preferences
- File selection behavior
- Auto-refresh toggles

## Usage Example

```jsx
import { GitPanel } from '@/features/git';

function App() {
  return (
    <GitPanel 
      selectedProject={currentProject}
      isMobile={isMobileDevice}
    />
  );
}
```

## Props

- `selectedProject` - Current project object with path
- `isMobile` - Boolean for mobile layout adjustments

## Testing

- Component unit tests with React Testing Library
- Git operation mocks for isolated testing
- Integration tests for workflows
- Visual regression tests
- Storybook stories for all states