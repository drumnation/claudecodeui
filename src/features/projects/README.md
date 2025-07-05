# Projects Feature

The Projects feature provides comprehensive project and session management for Claude Code UI. It enables users to organize their development projects, manage chat sessions within projects, and maintain a structured workspace with easy navigation and session history.

## Overview

The Projects feature offers a hierarchical organization system where users can manage multiple projects, each containing multiple chat sessions. It provides project discovery, session management, and quick access to recent work, making it easy to switch contexts and maintain organized development workflows.

## Components Structure

### Main Component
- **ProjectList** - Main container displaying all projects and their sessions

### Sub-components
- **ProjectItem** - Individual project with expandable session list
- **SessionItem** - Individual chat session within a project
- **SessionList** - Container for sessions within a project
- **NewProjectModal** - Modal dialog for adding new projects

### File Structure
```
projects/
├── index.js
├── ProjectList.jsx
├── ProjectList.styles.js
├── ProjectList.hook.js
├── ProjectList.logic.js
├── ProjectList.stories.jsx
├── README.md
├── components/
│   ├── ProjectItem/
│   │   ├── index.js
│   │   ├── ProjectItem.jsx
│   │   ├── ProjectItem.styles.js
│   │   ├── ProjectItem.hook.js
│   │   ├── ProjectItem.logic.js
│   │   └── ProjectItem.stories.jsx
│   ├── SessionItem/
│   │   ├── index.js
│   │   ├── SessionItem.jsx
│   │   ├── SessionItem.styles.js
│   │   ├── SessionItem.hook.js
│   │   ├── SessionItem.logic.js
│   │   └── SessionItem.stories.jsx
│   ├── SessionList/
│   │   ├── index.js
│   │   ├── SessionList.jsx
│   │   ├── SessionList.styles.js
│   │   ├── SessionList.hook.js
│   │   ├── SessionList.logic.js
│   │   └── SessionList.stories.jsx
│   └── NewProjectModal/
│       ├── index.js
│       ├── NewProjectModal.jsx
│       ├── NewProjectModal.styles.js
│       ├── NewProjectModal.hook.js
│       ├── NewProjectModal.logic.js
│       └── NewProjectModal.stories.jsx
```

## Key Features

### Project Management
- Display all available projects
- Create new projects via modal
- Edit project names inline
- Delete projects with confirmation
- Show project metadata (last activity, session count)
- Project path validation

### Session Management
- List sessions within projects
- Create new sessions
- Edit session names/summaries
- Delete sessions
- Show session activity status
- Generate AI summaries for sessions
- Session timestamps

### Navigation
- Expand/collapse project sessions
- Select active project
- Select active session
- Visual indicators for selection
- Smooth transitions
- Keyboard navigation support

### Organization
- Hierarchical project/session structure
- Chronological session ordering
- Activity-based sorting
- Search/filter capabilities (planned)
- Batch operations (planned)

### Visual Feedback
- Loading states during operations
- Active session indicators
- Hover effects
- Selection highlighting
- Empty states
- Error states

## State Management

The feature uses React hooks for state management:
- **useProjectList** - Main project list state
- **useProjectOperations** - Project CRUD operations
- **useSessionManagement** - Session operations
- **useExpandedState** - Expansion state tracking

## API Integration

### Endpoints
- `/api/projects` - List all projects
- `/api/projects/create` - Create new project
- `/api/projects/delete` - Delete project
- `/api/projects/rename` - Rename project
- `/api/sessions` - List project sessions
- `/api/sessions/create` - Create new session
- `/api/sessions/delete` - Delete session
- `/api/sessions/update` - Update session metadata
- `/api/sessions/generate-summary` - AI summary generation

### Data Structure
```javascript
{
  projects: [{
    id: 'project-uuid',
    displayName: 'My Project',
    path: '/Users/dev/projects/my-project',
    lastActivity: '2024-01-15T10:30:00Z',
    sessionCount: 5,
    sessions: [{
      id: 'session-uuid',
      name: 'Feature Implementation',
      summary: 'Working on user auth...',
      createdAt: '2024-01-15T09:00:00Z',
      lastActivity: '2024-01-15T10:30:00Z',
      isActive: true
    }]
  }]
}
```

## UI/UX Features

### Interactive Elements
- Click to select project/session
- Double-click to edit names
- Hover for action buttons
- Drag to reorder (planned)
- Context menus (planned)

### Visual Design
- Clean, hierarchical layout
- Consistent spacing
- Icon indicators
- Status badges
- Smooth animations
- Theme-aware colors

### Responsive Behavior
- Mobile-optimized layout
- Touch-friendly targets
- Collapsible sections
- Adaptive density
- Horizontal scrolling prevention

## Performance Optimizations

- Lazy session loading
- Virtual scrolling for long lists
- Debounced name editing
- Optimistic UI updates
- Memoized renders
- Efficient re-renders

## Accessibility

- Keyboard navigation (Tab, Enter, Escape)
- ARIA labels and roles
- Focus management
- Screen reader announcements
- High contrast support
- Semantic HTML structure

## Error Handling

- Network failure recovery
- Validation errors
- Conflict resolution
- User-friendly messages
- Retry mechanisms
- Graceful degradation

## Usage Example

```jsx
import { ProjectList } from '@/features/projects';

function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <ProjectList
      projects={projects}
      selectedProject={selectedProject}
      selectedSession={selectedSession}
      onProjectSelect={setSelectedProject}
      onSessionSelect={setSelectedSession}
      onNewSession={handleNewSession}
      onSessionDelete={handleSessionDelete}
      onProjectDelete={handleProjectDelete}
      isLoading={isLoading}
      onRefresh={refreshProjects}
      onShowSettings={showSettings}
    />
  );
}
```

## Props

- `projects` - Array of project objects
- `selectedProject` - Currently selected project
- `selectedSession` - Currently selected session
- `onProjectSelect` - Project selection callback
- `onSessionSelect` - Session selection callback
- `onNewSession` - New session creation callback
- `onSessionDelete` - Session deletion callback
- `onProjectDelete` - Project deletion callback
- `isLoading` - Loading state boolean
- `onRefresh` - Refresh projects callback
- `onShowSettings` - Show settings callback

## Future Enhancements

- Project search/filtering
- Session tagging system
- Bulk operations
- Import/export projects
- Project templates
- Session sharing
- Activity timeline
- Project statistics

## Testing

- Component unit tests
- Integration tests
- User interaction tests
- API mock testing
- Storybook stories