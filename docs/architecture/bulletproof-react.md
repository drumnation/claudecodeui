# Bulletproof React Architecture

This document describes the bulletproof React architecture implemented in this codebase, providing guidelines for component structure, import patterns, and development best practices.

## Table of Contents

1. [Component Structure](#component-structure)
2. [File Organization](#file-organization)
3. [Import Patterns](#import-patterns)
4. [Styling with Emotion and Twin.macro](#styling-with-emotion-and-twinmacro)
5. [Development Guidelines](#development-guidelines)
6. [Migration Scripts](#migration-scripts)

## Component Structure

Each component in this codebase follows the bulletproof React pattern with clear separation of concerns:

```
ComponentName/
├── index.js              # Barrel export
├── ComponentName.jsx     # Main component (UI only)
├── ComponentName.hook.js # Custom hook for stateful logic
├── ComponentName.logic.js # Pure functions and business logic
├── ComponentName.styles.js # Emotion styled components with twin.macro
├── ComponentName.stories.jsx # Storybook stories
└── components/          # Sub-components (if needed)
    └── SubComponent/    # Follows same pattern
```

### File Responsibilities

#### `ComponentName.jsx`
- Contains ONLY JSX structure
- Imports and uses the custom hook
- Imports styled components from `.styles.js`
- Uses named exports: `export const ComponentName`
- No business logic, no state management

#### `ComponentName.hook.js`
- Contains all stateful logic (`useState`, `useReducer`)
- Contains all side effects (`useEffect`)
- Contains all event handlers
- Returns an object with state values and functions
- Named `useComponentName`

#### `ComponentName.logic.js`
- Contains pure functions
- Data transformation utilities
- Validation functions
- Helper functions that don't depend on React
- All functions are testable in isolation

#### `ComponentName.styles.js`
- Uses `@emotion/styled` and `twin.macro`
- Converts Tailwind classes to styled components
- Example:
```javascript
import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Container = styled.div`
  ${tw`flex flex-col gap-4 p-4`}
`;
```

#### `ComponentName.stories.jsx`
- Storybook stories for the component
- Includes different states and variations
- Uses autodocs for reusable components
- Follows Storybook 7+ format

#### `index.js`
- Barrel export for cleaner imports
- Example:
```javascript
export { ComponentName } from './ComponentName';
export { ComponentName as default } from './ComponentName';
```

## File Organization

The codebase is organized into feature-based folders:

```
src/
├── app/                 # Application entry point
│   ├── main.jsx        # React app initialization
│   └── App.jsx         # Root component with routing
├── features/           # Feature-based modules
│   ├── chat/          # Chat feature
│   └── files/         # File management feature
├── layouts/           # Layout components
│   └── root/          # Root layout components
│       ├── Sidebar/   # Navigation sidebar
│       ├── MainContent/ # Main content area
│       └── MobileNav/ # Mobile navigation
├── components/        # Shared UI components
│   ├── Shell/        # Terminal component
│   ├── GitPanel/     # Git operations panel
│   └── ...
├── shared-components/ # Reusable atomic components
│   ├── Button/       # Button component
│   ├── Input/        # Input component
│   └── ...
├── contexts/         # React contexts
├── hooks/           # Shared custom hooks
├── lib/            # Utility functions
└── utils/          # Helper utilities
```

## Import Patterns

All imports use absolute paths with the `@/` alias:

```javascript
// ✅ Good - Absolute imports
import { Button } from '@/shared-components/Button';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/date';

// ❌ Bad - Relative imports
import { Button } from '../../../shared-components/Button';
import { useAuth } from './hooks/useAuth';
```

### Alias Configuration

The `@/` alias is configured in:

1. `jsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

2. `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Styling with Emotion and Twin.macro

### Setup

Dependencies required:
```bash
pnpm add @emotion/react @emotion/styled twin.macro
```

### Usage Pattern

1. Create styled components in `.styles.js`:
```javascript
import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Card = styled.div`
  ${tw`bg-white rounded-lg shadow-md p-6`}
  ${tw`dark:bg-gray-800 dark:shadow-xl`}
`;

export const Title = styled.h2`
  ${tw`text-2xl font-bold text-gray-900`}
  ${tw`dark:text-white`}
`;
```

2. Use in component:
```javascript
import { Card, Title } from './Component.styles';

export const Component = () => (
  <Card>
    <Title>Hello World</Title>
  </Card>
);
```

### Benefits
- Compile-time optimization with twin.macro
- Type-safe styling with TypeScript
- Scoped styles without CSS modules
- Full Tailwind utilities support
- Dark mode support via Tailwind classes

## Development Guidelines

### Creating New Components

1. Use the bulletproof structure for all new components
2. Start with the logic file to define data structures
3. Create the hook for state management
4. Build styled components
5. Implement the UI component
6. Add Storybook stories
7. Export via barrel file

### Best Practices

1. **No Default Exports**: Always use named exports
2. **Props Interface**: Define clear prop types
3. **Accessibility**: Include ARIA attributes
4. **Error Boundaries**: Add where appropriate
5. **Loading States**: Handle async operations gracefully
6. **Memoization**: Use `useMemo` and `useCallback` appropriately

### Anti-Patterns to Avoid

- ❌ Inline styles
- ❌ Business logic in components
- ❌ Direct DOM manipulation
- ❌ Prop drilling (use Context or state management)
- ❌ Large components (>300 lines)
- ❌ Missing dependency arrays in hooks

## Migration Scripts

### Import Conversion Scripts

The project includes scripts to manage import paths:

#### `scripts/fixImports.js`
Converts relative imports to absolute `@/` imports:
```bash
npm run fix:imports
# or
node scripts/fixImports.js
```

#### `scripts/listBrokenImports.js`
Lists all broken imports in the codebase:
```bash
npm run list:imports
# or
node scripts/listBrokenImports.js
```

### Usage Example

1. After moving files or refactoring:
```bash
# Check for broken imports
npm run list:imports

# Fix all imports automatically
npm run fix:imports

# Verify no broken imports remain
npm run list:imports
```

## Component Examples

### Simple Component Example

```javascript
// Button/Button.jsx
import React from 'react';
import { useButton } from './Button.hook';
import { StyledButton, ButtonIcon } from './Button.styles';

export const Button = ({ children, onClick, variant = 'primary', icon, ...props }) => {
  const { handleClick, isLoading } = useButton({ onClick });
  
  return (
    <StyledButton variant={variant} onClick={handleClick} disabled={isLoading} {...props}>
      {icon && <ButtonIcon>{icon}</ButtonIcon>}
      {children}
    </StyledButton>
  );
};
```

### Complex Component Example

See the `Sidebar` component in `src/layouts/root/Sidebar/` for a complete example of:
- Complex state management
- API integration
- Multiple sub-components
- Comprehensive styling
- Full Storybook coverage

## Testing

Components following this pattern are highly testable:

1. **Logic Tests**: Pure functions in `.logic.js` are easily unit tested
2. **Hook Tests**: Custom hooks can be tested with `@testing-library/react-hooks`
3. **Component Tests**: UI components can be tested with React Testing Library
4. **Integration Tests**: Storybook stories serve as visual tests

## Conclusion

This bulletproof React architecture provides:
- Clear separation of concerns
- Improved maintainability
- Better testability
- Consistent code structure
- Enhanced developer experience

Follow these patterns for all new development and when refactoring existing components.