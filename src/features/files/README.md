# Files Feature

The Files feature provides a comprehensive file explorer and viewer for navigating and inspecting project files. It enables users to browse directory structures, view file contents, and interact with various file types including images.

## Overview

The Files feature offers a tree-based file navigation system with support for expanding/collapsing directories, viewing file contents, and specialized handling for different file types. It integrates closely with the chat interface to enable file-based interactions.

## Components Structure

### Main Components
- **FileTree** - Hierarchical file browser with expand/collapse functionality
- **ImageViewer** - Specialized viewer for image files with zoom and pan capabilities

### Component Details

#### FileTree
- Recursive tree structure rendering
- Lazy loading of directory contents
- File type icon mapping
- Search/filter capabilities
- Context menu integration
- Drag and drop support

#### ImageViewer  
- Support for common image formats (PNG, JPG, GIF, SVG, WebP)
- Zoom controls (fit, actual size, zoom in/out)
- Pan functionality for large images
- Image metadata display
- Full-screen mode

## Key Features

### File Navigation
- Hierarchical tree view with indentation
- Expand/collapse directories with chevron icons
- File type detection and appropriate icons
- Breadcrumb navigation
- Quick file search
- Recent files tracking

### File Operations
- View file contents in chat
- Copy file paths
- Open in external editor
- Reveal in system file explorer
- File watching for changes

### Image Handling
- Inline image preview
- Zoom and pan controls
- Image dimension display
- File size information
- Copy image to clipboard

## State Management

The feature uses React hooks for state management:
- **useFileTree** - Manages tree expansion state and selection
- **useFileWatcher** - Monitors file system changes
- **useImageViewer** - Controls image zoom and pan state

## Integration Points

- **File System API** - Native file system access
- **WebSocket Server** - File change notifications
- **Chat Interface** - Send files to conversation
- **Code Editor** - Open files for editing

## Performance Considerations

- Virtual scrolling for large directories
- Lazy loading of directory contents
- Image thumbnail generation
- Debounced search input
- Memoized tree rendering

## File Type Support

### Text Files
- Syntax highlighting for code files
- Line numbers
- UTF-8 encoding support

### Images
- PNG, JPG, JPEG, GIF, SVG, WebP
- EXIF data reading
- Responsive sizing

### Special Files
- .gitignore parsing
- Package.json visualization
- Markdown preview
- JSON formatting

## Accessibility

- Keyboard navigation (arrow keys)
- ARIA tree role implementation
- Screen reader file type announcements
- Focus management
- High contrast mode support

## Security Considerations

- Path traversal prevention
- File size limits
- MIME type validation
- Sandboxed file preview
- Permission checking

## Styling

Uses Emotion styled components with:
- Consistent spacing and indentation
- Theme-aware colors
- Smooth expand/collapse animations
- Responsive layout adjustments
- Custom scrollbars

## Configuration

- Hidden files toggle
- File extension visibility
- Sort order (name, date, size)
- Search scope settings
- Icon theme selection

## Testing

- Component unit tests
- File tree interaction tests
- Image viewer functionality tests
- Performance benchmarks
- Storybook stories for variants