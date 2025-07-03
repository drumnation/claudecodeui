# React Component Standards & Patterns

## Component Structure & Organization

### File Organization

* Each component should have its own folder.
* Structure components as follows:

  ```
  ComponentName/
  ├── index.ts              # Barrel export
  ├── ComponentName.tsx       # Main component with JSX (imports Emotion‑styled Tailwind primitives)
  ├── ComponentName.types.ts    # TypeScript interfaces/types
  ├── ComponentName.hook.ts     # Stateful logic (custom hooks)
  ├── ComponentName.logic.ts    # Pure business logic
  ├── ComponentName.stories.tsx # Storybook stories
  └── components/         # If needed for large components
      └── ...               # Follow same pattern for sub-components
  ```
* Keep components under 500 lines (300 lines preferred).
* When exceeding size limits, extract logic to hooks/logic files or create sub-components.

### Component Hierarchy

* **Location structure:**

  * root: `src/shared-components`
  * atoms: `src/shared-components/atoms`
  * molecules: `src/shared-components/molecules`
  * organisms: `src/shared-components/organisms`
  * templates: `src/shared-components/templates`

### Export Standardsw

* Use barrel exports via `index.ts`.
* Use named exports (not default).
* Type exports are required.
* Props interface naming: `{ComponentName}Props`.

---

## Styling & Theming Standards

* **Combine Tailwind tokens with `@emotion/styled` via `twin.macro` for semantic, component‑scoped styling.**
* *All component appearance rules live in* `ComponentName.styles.ts` *as Emotion‑styled primitives using* `tw` *utility tokens.*
* The JSX file **imports these primitives**; avoid placing raw Tailwind strings in `className` except for **tiny, token‑level tweaks ≤ 40 chars**.
* Use `clsx`, `tailwind-merge`, or `class-variance-authority` **inside** `.styles.ts` (or in a dedicated variants file) to construct conditional token sets; keep JSX declarative and semantic.
* Avoid inline styles (`style={...}`) completely.
* Theming (e.g., dark/light mode) is handled by the `ThemeProvider` context, which adds a `dark` class to the `<html>` element. Use Tailwind's `dark:` variants inside `tw` blocks for dark mode styling. (`style={...}`) completely.
* Theming (e.g., dark/light mode) is handled by the `ThemeProvider` context, which adds a `dark` class to the `<html>` element. Use Tailwind's `dark:` variants for dark mode styling.

### Tailwind‑to‑@emotion/styled Extraction Guidelines (Addendum ‑ 2025‑07‑03)

> **Purpose:** enable semantic component names while retaining Tailwind token usage by relocating long `className` strings to `@emotion/styled` definitions inside `ComponentName.styles.ts`.

1. **Dependencies**

   ```bash
   pnpm add -w @emotion/react @emotion/styled twin.macro clsx tailwind-merge
   ```

   *`twin.macro` compiles Tailwind tokens at build‑time and works seamlessly with Emotion.*

2. **File layout update**
   Each component folder now includes:

   ```
   ComponentName/
   ├── ComponentName.styles.ts   # Tailwind tokens converted to Emotion styled primitives ✅
   └── ComponentName.tsx         # JSX only – no direct Tailwind strings
   ```

3. **Authoring pattern**

   ```tsx
   // ComponentName.styles.ts
   import styled from '@emotion/styled';
   import tw from 'twin.macro';

   export const Wrapper   = styled.div`${tw`flex flex-col gap-4`}`;
   export const Header    = styled.h2`${tw`text-xl font-semibold`}`;
   export const List      = styled.ul`${tw`space-y-2`}`;
   export const ListItem  = styled.li`${tw`px-3 py-2 rounded hover:bg-gray-50`}`;
   ```

   ```tsx
   // ComponentName.tsx
   import * as S from './ComponentName.styles';

   export const ComponentName = ({ items }: { items: string[] }) => (
     <S.Wrapper>
       <S.Header>Items</S.Header>
       <S.List>
         {items.map(item => (
           <S.ListItem key={item}>{item}</S.ListItem>
         ))}
       </S.List>
     </S.Wrapper>
   );
   ```

4. **Migration criteria**

   * Move any `className` string **> 40 characters** or containing **layout utilities** (`flex`, `grid`, `gap`, `order`, etc.) to `*.styles.ts`.
   * Retain small, purely token‑level classes (e.g., `text-red-600`) inline **only if** the line stays under 40 chars.

5. **Lint rules**

   * Enable custom ESLint rule `no-long-tailwind` (fails when `className` exceeds 40 chars).
   * Permit Tailwind strings **only** inside `*.styles.ts`.

6. **CI enforcement**

   * Husky pre‑commit hook: `pnpm lint && pnpm test && pnpm twin:compile` to guarantee diagrams compile and styles stay in sync.

7. **Rationale**

   * **Semantic names & LLM clarity:** `<PrimaryButton>` conveys intent; styles sit one hop away for both humans and AI assistants.
   * **Zero runtime overhead:** `twin.macro` converts Tailwind tokens at build time; Emotion injects only scoped CSS.
   * **Clean diffs:** style changes live in `*.styles.ts`, keeping JSX commits small and readable.

---

## Component Architecture

### Logic Separation

* Extract inline functions to named handlers.
* Move complex business logic to dedicated `.logic.ts` files.
* Implement stateful logic in `.hook.ts` custom hooks.
* Use `useCallback` for event handlers.
* Use `useMemo` for expensive computations.
* Include all dependencies in hook dependency arrays.

### State Management Strategy

* **Local State:** Use `useState` and `useReducer` for state confined to a single component.
* **Shared State (Context):** Use React Context for state that needs to be shared across a limited part of the component tree (e.g., the provided `ThemeProvider`).
* **Global State (Redux):** For complex, application-wide state, use **Redux Toolkit**. For data fetching, caching, and server state management, use **RTK Query**.

### TypeScript Best Practices

* A props interface is required for all components.
* Avoid type assertions (`as`) in component code.
* Implement proper generic types for reusable components.
* Maintain a strict TypeScript configuration.
* Export types through barrel files.

### UI Patterns

* Use Next.js `<Image />` component instead of the HTML `<img>` tag when applicable.
* Use camelCase for component properties.
* Implement React error boundaries at appropriate levels.
* Add user-friendly error states and feedback.
* Ensure loading states are handled gracefully.
* Ensure proper accessibility attributes.

---

## Storybook Standards

* Stories should be located in `ComponentName.stories.tsx`.
* For reusable atomic components:

  * Use `autodocs`.
  * Define every variation of the component's props as a separate story.
* For non-reusable composed components:

  * Only a default story is necessary.
  * `autodocs` are not required.
* Align story content with the main application.
* **ALWAYS** trust and use the `preview.tsx` for any global providers.
* **DO NOT** define providers in individual stories.

---

## Component Refactoring Workflow

### 1. Analysis Phase

* Review component purpose and identify responsibilities.
* Document current behavior for regression testing.
* Identify code smells specific to component architecture.

### 2. Extraction Strategy

* Start with types (`.types.ts`).
* Extract business logic (`.logic.ts`).
* Extract stateful logic (`.hook.ts`).
* Simplify the main component file, leaving it with JSX that imports Emotion‑styled Tailwind primitives **as per the addendum**.

### 3. Error Handling Implementation

* Add appropriate error boundaries.
* Implement graceful fallbacks.
* Add user feedback for errors.

### 4. Documentation Updates

* Update or create Storybook stories.
* Document component props with JSDoc comments.
* Ensure accessibility attributes and documentation are complete.

---

## Anti-Patterns to Avoid

* Prop drilling (use Context or Redux Toolkit instead).
* Mixing UI rendering with complex business logic in the component file.
* Inline styles (`style={...}`).
* Using raw CSS‑in‑JS without Tailwind tokens (e.g., bare `styled-components` or Emotion without `tw`).
* Overly large components (>300 lines).
* Using generic HTML elements without proper semantics.
* Default exports.
* Type assertions (`as`).
* Missing dependency arrays in hooks.
* Defining providers in individual stories instead of `preview.tsx`.
