# TypeScript Migration Plan - Automated Approach

## Option 1: Using ts-migrate (Airbnb's Tool) - RECOMMENDED

```bash
# Install ts-migrate
npm install -g ts-migrate

# Initialize the migration
cd apps/frontend
ts-migrate init

# Rename files .js/.jsx to .ts/.tsx
ts-migrate rename --sources="src/**/*" --extensions=".js,.jsx"

# Add basic TypeScript annotations
ts-migrate migrate --sources="src/**/*"

# Clean up PropTypes (they're redundant with TypeScript)
ts-migrate clean --sources="src/**/*"
```

## Option 2: Manual Codemod with jscodeshift

```bash
# Install jscodeshift
npm install -g jscodeshift

# Run React to TypeScript transform
npx jscodeshift -t react-proptypes-to-typescript src/
```

## Option 3: 6 Claude Parallel Strategy

### Rules for Each Claude Instance:

#### Claude 1: Configuration & Utils (Safe Zone)
**Files**: `src/config/`, `src/utils/`, `src/constants/`, `*.styles.js`
**Rules**:
- Convert file extension `.js` → `.ts`, `.jsx` → `.tsx`
- Add TypeScript interfaces for all exports
- Remove any `PropTypes` imports and definitions
- Add return type annotations to functions
- Convert `module.exports` to `export default` if found

#### Claude 2: Hooks & Logic (Medium Risk)
**Files**: `*.hook.js`, `*.logic.js`, custom hooks
**Rules**:
- Add TypeScript generics for React hooks (`useState<Type>()`)
- Type all parameters and return values
- Remove PropTypes
- Convert React import to include types: `import React, { useState, useEffect } from 'react'`

#### Claude 3: Simple Components (Leaf Components)
**Files**: Components with no children components, simple presentational components
**Rules**:
- Add `React.FC<Props>` or component function typing
- Create `Props` interface replacing PropTypes
- Remove `Component.propTypes` and `Component.defaultProps`
- Add `children?: ReactNode` to props when needed
- Import `ReactNode` from 'react'

#### Claude 4: Complex Components (Higher Risk)
**Files**: Components with state, lifecycle methods, complex logic
**Rules**:
- Convert class components to maintain existing pattern but add types
- Add state interfaces for `useState<StateType>()`
- Type event handlers: `onClick: (event: React.MouseEvent) => void`
- Add ref types: `useRef<HTMLDivElement>(null)`

#### Claude 5: Context & Providers (Critical)
**Files**: `*Context.jsx`, `*Provider.jsx`
**Rules**:
- Create context type interfaces
- Add proper generic typing to `createContext<Type | undefined>()`
- Type provider props with `children: ReactNode`
- Add return type annotations to custom hooks

#### Claude 6: Test Files & Stories (Low Risk)
**Files**: `*.test.js`, `*.spec.js`, `*.stories.js`
**Rules**:
- Convert file extensions
- Add basic types for test parameters
- Type story parameters and args
- Remove PropTypes from stories

### Shared Rules for ALL Claudes:

1. **ALWAYS**:
   - Test TypeScript compilation after each file: `npm run frontend:typecheck`
   - Preserve all existing functionality
   - Add `import React from 'react'` if not present
   - Use interface instead of type for object shapes
   - Add JSDoc comments for complex types

2. **NEVER**:
   - Change component logic or behavior
   - Remove existing functionality
   - Add new features during migration
   - Change file structure or move files
   - Break existing imports

3. **PropTypes Removal Pattern**:
   ```javascript
   // REMOVE these entirely:
   import PropTypes from 'prop-types';
   Component.propTypes = { ... };
   Component.defaultProps = { ... };
   
   // REPLACE with TypeScript interface:
   interface ComponentProps {
     title: string;
     onClick?: () => void;
     children?: ReactNode;
   }
   ```

4. **Common Type Patterns**:
   ```typescript
   // Event handlers
   onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
   onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
   onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
   
   // Refs
   const ref = useRef<HTMLDivElement>(null);
   
   // State with proper typing
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState<boolean>(false);
   ```

## File Assignment Strategy

### Phase 1 (Parallel Execution):
- Claude 1: 50 files (utils, config, styles)
- Claude 2: 40 files (hooks, logic)
- Claude 3: 60 files (simple components)
- Claude 4: 40 files (complex components)
- Claude 5: 15 files (contexts, providers)
- Claude 6: 30 files (tests, stories)

### Validation After Each Phase:
```bash
# Test compilation
npm run frontend:typecheck

# Test build
npm run frontend:build

# Test dev server
npm run frontend:dev

# Test Storybook
npm run frontend:storybook
```

## Error Recovery Plan

If any Claude breaks something:
1. Revert their specific files: `git checkout HEAD -- [file-pattern]`
2. Resume with stricter rules
3. Continue with remaining files

## Success Criteria

- [ ] All 477 files converted to TypeScript
- [ ] Zero TypeScript compilation errors
- [ ] All existing functionality preserved
- [ ] PropTypes completely removed
- [ ] Build and dev server working
- [ ] Storybook functional
- [ ] Tests passing

## Estimated Timeline

- **Setup**: 30 minutes
- **Parallel Conversion**: 2-3 hours
- **Validation & Fixes**: 1-2 hours
- **Total**: 4-6 hours with 6 Claude instances

This approach is much faster than the 40+ hours it would take to manually convert 477 files.