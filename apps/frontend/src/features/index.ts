/**
 * Features - Master export file
 * Following Bulletproof React feature-slice pattern
 * 
 * Each feature is a self-contained domain slice with:
 * - components/ - UI components specific to the feature
 * - hooks/ - Custom hooks for feature logic
 * - api/ - API layer for feature operations
 * - types/ - TypeScript definitions
 * - utils/ - Feature-specific utilities
 */

// Chat Feature - Real-time conversations with Claude
export * from './chat';

// Projects Feature - Project and session management
export * from './projects';

// Files Feature - File system operations and editing
export * from './files';

// Shell Feature - Terminal, git, and development tools
export * from './shell';

// Settings Feature - Application configuration
export * from './settings';

// Tools Feature - Claude Code tool execution and visualization
export * from './tools';

/**
 * Feature Dependency Rules (Bulletproof React):
 * 
 * ✅ ALLOWED:
 * - features → shared components (atoms/molecules)
 * - features → lib utilities  
 * - features → app types
 * 
 * ❌ FORBIDDEN:
 * - features → other features (use app-level orchestration)
 * - shared components → features
 * - lib → features
 * 
 * 🔄 COMMUNICATION:
 * - Features communicate through app-level state management
 * - Use events/callbacks passed down from app layer
 * - Shared state via context or state management library
 */