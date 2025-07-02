Here is the updated version of your React component standards.

-----

## description: Standards for React component structure, styling, types, logic, and stories using Tailwind CSS. globs: \*.tsx alwaysApply: false

# React Component Standards & Patterns

## Component Structure & Organization

### File Organization

  - Each component should have its own folder.
  - Structure components as follows:
    ```
    ComponentName/
    ├── index.ts              # Barrel export
    ├── ComponentName.tsx       # Main component with Tailwind classes
    ├── ComponentName.types.ts    # TypeScript interfaces/types
    ├── ComponentName.hook.ts     # Stateful logic (custom hooks)
    ├── ComponentName.logic.ts    # Pure business logic
    ├── ComponentName.stories.tsx # Storybook stories
    └── components/         # If needed for large components
        └── ...               # Follow same pattern for sub-components
    ```
  - Keep components under 500 lines (300 lines preferred).
  - When exceeding size limits, extract logic to hooks/logic files or create sub-components.

### Component Hierarchy

  - **Location structure:**
      - root: `src/shared-components`
      - atoms: `src/shared-components/atoms`
      - molecules: `src/shared-components/molecules`
      - organisms: `src/shared-components/organisms`
      - templates: `src/shared-components/templates`

### Export Standardsw

  - Use barrel exports via `index.ts`.
  - Use named exports (not default).
  - Type exports are required.
  - Props interface naming: `{ComponentName}Props`.

-----

## Styling & Theming Standards

  - **USE TAILWIND CSS, NOT STYLED COMPONENTS.**
  - All styling should be done via Tailwind utility classes directly in the component's JSX.
  - Use libraries like `clsx`, `tailwind-merge`, and `class-variance-authority` to conditionally apply and merge classes for component variants.
  - Avoid inline styles (`style={...}`) completely.
  - Theming (e.g., dark/light mode) is handled by the `ThemeProvider` context, which adds a `dark` class to the `<html>` element. Use Tailwind's `dark:` variants for dark mode styling.

-----

## Component Architecture

### Logic Separation

  - Extract inline functions to named handlers.
  - Move complex business logic to dedicated `.logic.ts` files.
  - Implement stateful logic in `.hook.ts` custom hooks.
  - Use `useCallback` for event handlers.
  - Use `useMemo` for expensive computations.
  - Include all dependencies in hook dependency arrays.

### State Management Strategy

  - **Local State:** Use `useState` and `useReducer` for state confined to a single component.
  - **Shared State (Context):** Use React Context for state that needs to be shared across a limited part of the component tree (e.g., the provided `ThemeProvider`).
  - **Global State (Redux):** For complex, application-wide state, use **Redux Toolkit**. For data fetching, caching, and server state management, use **RTK Query**.

### TypeScript Best Practices

  - A props interface is required for all components.
  - Avoid type assertions (`as`) in component code.
  - Implement proper generic types for reusable components.
  - Maintain a strict TypeScript configuration.
  - Export types through barrel files.

### UI Patterns

  - Use Next.js `<Image />` component instead of the HTML `<img>` tag when applicable.
  - Use camelCase for component properties.
  - Implement React error boundaries at appropriate levels.
  - Add user-friendly error states and feedback.
  - Ensure loading states are handled gracefully.
  - Ensure proper accessibility attributes.

-----

## Storybook Standards

  - Stories should be located in `ComponentName.stories.tsx`.
  - For reusable atomic components:
      - Use `autodocs`.
      - Define every variation of the component's props as a separate story.
  - For non-reusable composed components:
      - Only a default story is necessary.
      - `autodocs` are not required.
  - Align story content with the main application.
  - **ALWAYS** trust and use the `preview.tsx` for any global providers.
  - **DO NOT** define providers in individual stories.

-----

## Component Refactoring Workflow

### 1\. Analysis Phase

  - Review component purpose and identify responsibilities.
  - Document current behavior for regression testing.
  - Identify code smells specific to component architecture.

### 2\. Extraction Strategy

  - Start with types (`.types.ts`).
  - Extract business logic (`.logic.ts`).
  - Extract stateful logic (`.hook.ts`).
  - Simplify the main component file, leaving it with JSX and Tailwind classes.

### 3\. Error Handling Implementation

  - Add appropriate error boundaries.
  - Implement graceful fallbacks.
  - Add user feedback for errors.

### 4\. Documentation Updates

  - Update or create Storybook stories.
  - Document component props with JSDoc comments.
  - Ensure accessibility attributes and documentation are complete.

-----

## Anti-Patterns to Avoid

  - Prop drilling (use Context or Redux Toolkit instead).
  - Mixing UI rendering with complex business logic in the component file.
  - Inline styles (`style={...}`).
  - Using `styled-components`.
  - Overly large components (\>300 lines).
  - Using generic HTML elements without proper semantics.
  - Default exports.
  - Type assertions (`as`).
  - Missing dependency arrays in hooks.
  - Defining providers in individual stories instead of `preview.tsx`.