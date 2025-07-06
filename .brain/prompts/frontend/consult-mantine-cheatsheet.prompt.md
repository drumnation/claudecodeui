# Prompt: Consult Mantine UI Cheatsheet

## Purpose:
Before beginning UI layout or component design using Mantine, consult the available cheatsheet to understand:

- Which Mantine components are available
- How they are intended to be used responsively
- Which atomic wrappers should be used instead of direct usage

## Instructions to the Agent:

1. **Access Cheatsheet:** Read the full Mantine UI cheatsheet located at:
   `@.brain/knowledge/frontend/mantine-ui-component-cheatsheet.rules.md`

2. **Do Not Use Raw Mantine Components Directly.**
   - All components must be wrapped in atomic design wrappers.
   - Reference only the wrapper component names when suggesting implementation.

3. **Use Mobile-First Responsive Props:**
   - Ensure your usage examples follow Mantine’s mobile-first conventions (`{ base: ..., md: ... }`).

4. **If unsure whether a wrapper exists:**
   - Ask the user what the naming convention is or propose one that matches established naming conventions (e.g. `AppCard`, `FormTextInput`, `LayoutStack`).

## When to Use:
- When creating new components or pages
- When updating layout or spacing for existing UI
- When reviewing code for Mantine usage inconsistencies
- When composing a responsive layout using Mantine primitives

## Related Rules:
- `@.brain/rules/frontend/mantine-ui-wrapper-best-practice.rules.mdc`
- `@.brain/rules/frontend/atomic-component-refactor.rules.mdc`
