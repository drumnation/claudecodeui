# CLAUDE.md - @kit/logger

This file provides guidance to Claude Code (claude.ai/code) when working with the @kit/logger package.

## Package Overview

`@kit/logger` is a unified logging solution for the monorepo that provides:

- Structured logging for both Node.js and browser environments
- Environment-based log level control
- React integration with hooks and context
- Request correlation and session tracking
- Performance-optimized logging with level checks

## Key Concepts

### Log Levels (in order of severity)

1. `silent` - No logs output
2. `error` - Only errors
3. `warn` - Warnings and errors
4. `info` - General information, warnings, and errors
5. `debug` - Detailed debugging information
6. `trace` - Very detailed trace information

### Environment Variables

- `LOG_LEVEL` - Controls backend/Node.js log level
- `VITE_LOG_LEVEL` - Controls frontend/browser log level
- Default: `info` in development, `error` in production

## Usage Patterns

### Backend (Node.js)

```typescript
import {createLogger} from '@kit/logger/node';

const logger = createLogger({scope: 'my-service'});
logger.info('Service started', {port: 3000});
```

### Frontend (Browser)

```typescript
import {createLogger} from '@kit/logger/browser';

const logger = createLogger({scope: 'my-component'});
logger.debug('Component rendered', {props});
```

### React Components

```typescript
import {useLogger} from '@kit/logger/react';

function MyComponent() {
  const logger = useLogger({component: 'MyComponent'});
  logger.info('Component action', {userId});
}
```

## Best Practices

### 1. Always Use Structured Logging

```typescript
// ❌ Bad
logger.info('User logged in: ' + userId);

// ✅ Good
logger.info('User logged in', {userId, timestamp: Date.now()});
```

### 2. Use Appropriate Log Levels

- `error` - For errors that need immediate attention
- `warn` - For unexpected but handled situations
- `info` - For important business events
- `debug` - For development and debugging
- `trace` - For very detailed debugging (avoid in loops)

### 3. Performance Optimization

```typescript
// Check level before expensive operations
if (logger.isLevelEnabled('debug')) {
  const expensiveData = calculateComplexMetrics();
  logger.debug('Metrics calculated', expensiveData);
}
```

### 4. Child Loggers for Context

```typescript
// Create child logger with additional context
const requestLogger = logger.child({
  reqId: generateId(),
  userId: req.user.id,
});
```

### 5. Error Logging

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', {
    error,
    stack: error.stack,
    context: {userId, operation: 'riskyOperation'},
  });
}
```

## Common Pitfalls to Avoid

1. **Don't use console.log** - Always use the logger
2. **Don't log sensitive data** - No passwords, tokens, or PII
3. **Don't log in tight loops** - Use trace level or level checks
4. **Don't concatenate strings** - Use structured metadata
5. **Don't forget error context** - Always include relevant metadata

## Migration from console.log

When migrating existing code:

1. Replace `console.log` → `logger.info` or `logger.debug`
2. Replace `console.error` → `logger.error`
3. Replace `console.warn` → `logger.warn`
4. Convert string concatenation to metadata objects
5. Add appropriate context/scope to loggers

## Testing with Logger

In tests, the logger automatically uses 'silent' level. To enable logging in specific tests:

```typescript
process.env.LOG_LEVEL = 'debug';
const logger = createLogger({scope: 'test'});
```

## Performance Considerations

- Logging has overhead - use appropriate levels
- Check `isLevelEnabled` before expensive operations
- Use child loggers instead of adding context to every call
- In production, use 'error' or 'silent' level
- Browser logging is more expensive than Node.js logging

---

### **Rule: Functional Isolated Concerns Architecture**

#### 1. **Core Principles**

- **ALWAYS** use functional programming patterns (NO CLASSES)
- **ALWAYS** organize code into isolated concern files
- **COMBINE** both transformations in a single refactoring pass
- **NEVER** create class wrappers or compatibility layers

#### 2. **Refactoring Triggers & Process**

**WHEN** encountering code that violates either principle:

1. **ANALYZE** the entire module/class structure first
2. **TRANSFORM** to functional patterns WHILE splitting into concern files
3. **NEVER** do two-pass refactoring (class→functional→isolated)
4. **DELETE** all class-based code without creating wrappers

#### 3. **Critical Anti-patterns FORBIDDEN**

```typescript
// ❌ NEVER create backward compatible class wrappers:
class UserService {
  constructor() {
    this.create = createUser; // NO!
    this.find = findUser; // NO!
  }
}

// ❌ NEVER create "function bag" objects mimicking classes:
export const userService = {
  create: createUser, // This is just a class in disguise
  find: findUser,
};

// ✅ INSTEAD: Direct function exports
export {createUser, findUser};
```

#### 4. **Single-Pass Transformation Pattern**

**FROM** class-based or monolithic code **TO** functional isolated concerns:

```typescript
// BEFORE: user.ts (class-based monolithic)
class UserService {
  private db: Database;

  async createUser(data) { ... }
  async findUser(id) { ... }
  validateEmail(email) { ... }
  hashPassword(password) { ... }
}

// AFTER: user/ folder structure
user/
├── user.service.ts        // Pure business logic functions
├── user.repository.ts     // Data access functions
├── user.validation.ts     // Validation functions
├── user.utils.ts          // Utility functions
├── user.types.ts          // Type definitions
└── index.ts               // Exports
```

#### 5. **Mandatory Refactoring Steps**

**WHEN** refactoring a file named `feature.ts` or class into folder structure:

1. **CREATE** new folder named `feature/`
2. **SPLIT** content into `feature/[name].[purpose].ts` files using functional patterns
3. **CREATE** `feature/index.ts` with exports
4. **UPDATE ALL IMPORTS** in the ENTIRE codebase:
   - Find all files importing from `./feature`, `../feature`, etc.
   - Update imports to point to new structure
   - **ESPECIALLY** update all test files (`.test.ts`, `.spec.ts`)
5. **VERIFY** imports are updated by searching for the old import pattern
6. **DELETE** the original `feature.ts` file
7. **RUN TESTS** to ensure they fail if any imports were missed
8. **VERIFY** no duplicate exports or backward compatibility code exists

**CRITICAL**: Tests MUST be updated BEFORE deleting the original file, otherwise tests will pass with stale imports.

#### 6. **Functional Transformation Rules**

**Classes → Functions mapping:**

- Class methods → Exported pure functions
- Constructor dependencies → Function parameters or closure
- Instance state → Function arguments or returned state
- Private methods → Non-exported functions in same file
- Static methods → Regular exported functions

**State management patterns:**

```typescript
// INSTEAD OF: this.state mutation
// USE: Return new state
const updateUser = (user: User, updates: Partial<User>): User => ({
  ...user,
  ...updates,
});

// INSTEAD OF: Dependency injection via constructor
// USE: Higher-order functions or explicit parameters
const createUserService = (db: Database) => ({
  create: (data: UserData) => createUser(db, data),
  find: (id: string) => findUser(db, id),
});
```

#### 7. **File Organization by Concern**

**Standard concern mapping for functional code:**

- `.service.ts` → Pure business logic (no I/O)
- `.repository.ts` → Data access (I/O isolated here)
- `.controller.ts` → HTTP handling (request/response)
- `.validation.ts` → Pure validation functions
- `.utils.ts` → Pure utility functions
- `.types.ts` → TypeScript interfaces/types
- `.effects.ts` → Side effects (logging, external APIs)
- `.constants.ts` → Constant values
- `.test.ts` or `.spec.ts` → Test files

#### 8. **Functional Patterns by Concern Type**

**Services (Pure Business Logic):**

```typescript
// user.service.ts
export const calculateUserScore = (
  user: User,
  activities: Activity[],
): number =>
  activities.reduce(
    (score, activity) => score + activity.points,
    user.baseScore,
  );

export const applyDiscount = (price: number, user: User): number =>
  user.isPremium ? price * 0.8 : price;
```

**Repositories (I/O Operations):**

```typescript
// user.repository.ts
export const createUser = async (db: Database, data: UserData): Promise<User> =>
  db.insert('users', data);

export const findUserById = async (
  db: Database,
  id: string,
): Promise<User | null> => db.findOne('users', {id});
```

**Controllers (HTTP Handling):**

```typescript
// user.controller.ts
export const handleCreateUser =
  (deps: Dependencies) => async (req: Request, res: Response) => {
    const validated = validateUserData(req.body);
    const user = await createUser(deps.db, validated);
    res.json(user);
  };
```

#### 9. **Dependency Management**

**INSTEAD OF** class constructor injection:

```typescript
// Option 1: Closure pattern
export const createUserHandlers = (deps: Dependencies) => ({
  create: handleCreateUser(deps),
  find: handleFindUser(deps),
  update: handleUpdateUser(deps),
});

// Option 2: Explicit parameters
export const createUser = async (db: Database, data: UserData): Promise<User> =>
  db.insert('users', data);

// Option 3: Reader monad pattern (advanced)
export const createUser =
  (data: UserData) =>
  (deps: Dependencies): Promise<User> =>
    deps.db.insert('users', data);
```

#### 10. **Import Rules**

- **Within same feature:** Use relative imports (`./user.types`)
- **Cross-feature:** Use absolute imports from feature root (`@/features/auth/auth.types`)
- **Shared modules:** Use absolute imports (`@/shared/utils/logger`)
- **Circular dependencies:** FORBIDDEN - refactor immediately if detected

#### 11. **Validation Checklist**

Before completing any refactoring:

1. ✓ No classes exist (except documented exceptions)
2. ✓ All functions are pure where possible
3. ✓ Side effects isolated to specific files
4. ✓ Each file has single concern
5. ✓ File follows `[name].[purpose].ts` pattern
6. ✓ Dependencies passed explicitly
7. ✓ No mutable state (use immutable updates)
8. ✓ ALL imports updated (search for old import patterns)
9. ✓ ALL test imports updated specifically
10. ✓ Original file deleted
11. ✓ Tests run against NEW structure (not old file)
12. ✓ No backward compatibility wrappers exist
13. ✓ No "function bag" objects mimicking classes

#### 12. **Import Update Verification**

```typescript
// REQUIRED verification after refactoring:
verifyNoStaleImports(oldFileName: string) {
  const staleImportPatterns = [
    `from './${oldFileName}'`,
    `from '../${oldFileName}'`,
    `from '../../${oldFileName}'`,
    `import '${oldFileName}'`,
    `require('${oldFileName}')`,
    `require('./${oldFileName}')`
  ];

  // Search entire codebase for these patterns
  // If found, refactoring is INCOMPLETE
}
```

#### 13. **Refactoring Decision Tree**

```
FOR each class or monolithic file:
  1. IDENTIFY all methods and their concerns
  2. GROUP methods by concern type
  3. FOR each concern group:
     - CREATE new file with functional exports
     - TRANSFORM class methods to pure functions
     - EXTRACT shared types to .types.ts
  4. UPDATE all imports atomically
  5. DELETE original file
  6. VERIFY tests still pass
```

#### 14. **Subfolder Strategy**

- **Decision tree for component placement:**
  ```
  IF component is used by multiple features → create in /shared/[component]/
  ELSE IF component is sub-concern of single feature → create in /[feature]/[sub-concern]/
  ELSE → create as /[feature]/[name].[purpose].ts
  ```
- **Subfolder creation criteria:**
  - Multiple files of same concern type (>3 validators → `/validation/` subfolder)
  - Complex sub-features with >5 related files
  - Feature-specific implementations not used elsewhere

#### 15. **Exception Handling**

**Classes are ONLY allowed when:**

1. Framework requires it (with documented reason)
2. Third-party library inheritance (with no functional alternative)
3. Performance-critical stateful operations (with benchmarks proving 20%+ improvement)

**Exception documentation:**

```typescript
/**
 * @exception CLASS_BASED_COMPONENT
 * @reason React Native requires class components for ErrorBoundary
 * @functional-alternative none available in framework version 0.72
 * @reevaluate 2025-Q2
 */
```

#### 16. **Anti-patterns to Avoid**

- Creating "function bags" (objects with function properties mimicking classes)
- Backward compatibility class wrappers
- Over-using closures leading to memory leaks
- Mixing concerns in a single function
- Hidden side effects in seemingly pure functions
- Partial refactoring (leaving some methods in classes)
- Default exports (always use named exports)

#### 17. **Performance Optimizations**

**When refactoring, apply these optimizations:**

- Use function composition over method chaining
- Leverage currying for partial application
- Consider memoization for expensive pure functions
- Use lazy evaluation where appropriate
- Prefer `const` functions over `function` declarations

#### 18. **Enforcement**

- **Block operations that:**
  - Create new classes without documented exceptions
  - Create compatibility wrappers
  - Leave original files after refactoring
  - Complete refactoring with stale imports
  - Mix paradigms (functional + class in same module)
- **Auto-fix when possible:**
  - Convert simple classes to functions
  - Update import paths
  - Remove empty compatibility files
