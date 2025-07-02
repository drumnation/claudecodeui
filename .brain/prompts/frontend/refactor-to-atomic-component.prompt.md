# Prompt: Refactor to Atomic Component

## Objective:
Refactor all directly used third-party UI components (e.g., from Mantine) in this file into atomic components located in the project's shared component library.

## Why:
Wrapping 3rd-party components in our own atomic components improves long-term maintainability by:
- Allowing us to update the underlying library usage in one place
- Enabling custom behavior or theming extensions in our own wrapper
- Protecting the app from ripple effects of syntax changes or prop renames
- Enforcing consistent prop naming, defaults, and structure across the UI

## Instructions:
1. **Scan the file for third-party UI component imports.**
   - Look for components imported from `@mantine/core`, `@mantine/hooks`, etc.
   - Identify which of these components are rendered directly in JSX.

2. **For each directly used component:**
   - Create a new wrapper component in our shared library:
     - Location: `@/components/atoms/[ComponentName]/[ComponentName].tsx`
     - Example: `TextInput` → `@/components/atoms/TextInput/TextInput.tsx`
   - The wrapper should:
     - Accept the same props as the original component (`ComponentProps<typeof X>`)
     - Optionally rename or retype certain props for standardization
     - Apply any app-wide default props or variants (if applicable)
     - Include `displayName = 'ProjectTextInput'` for debugging
   - Replace the original usage with the atomic component import:
     ```tsx
     import { TextInput } from '@/components/atoms/TextInput';
     ```

3. **Ensure all JSX references are updated to the new atomic wrapper.**

4. **Do not attempt to refactor components inside 3rd-party dependencies, only those rendered in our own codebase.**

## Example Transformation:
```tsx
// BEFORE
import { TextInput } from '@mantine/core';

function MyForm() {
  return <TextInput label="Name" />;
}
tsx
Copy
Edit
// AFTER
import { TextInput } from '@/components/atoms/TextInput';

function MyForm() {
  return <TextInput label="Name" />;
}
Output:
The file refactored with all wrapped components in place

All new atomic wrapper components scaffolded and implemented

Only import from our component library (no direct Mantine imports)

✅ Tip: If you find repeated props or patterns, you may suggest shared default props or variants to add to the atomic component.