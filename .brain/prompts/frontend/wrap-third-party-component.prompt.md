# 🔄 Wrap External UI Component (Mantine Example)

**Purpose:**  
Encapsulate a third-party UI component (e.g. from Mantine) inside a local atomic design wrapper for better control, reuse, and long-term maintainability.

---

## Instructions to the Agent:

1. **Create a Local Wrapper Component**
   - Use the appropriate atomic layer (`atoms/`, `molecules/`, `organisms/`)
   - Export the wrapper using our internal naming convention (e.g. `AppButton`, `BaseInput`)

2. **Apply Sensible Defaults**
   - Mirror Mantine’s defaults but allow internal extension
   - Allow props passthrough via `...props` spread (typed carefully)

3. **Add Documentation**
   - Include JSDoc above the wrapper with:
     - Description
     - Key props or behaviors
     - Links to original Mantine docs (if needed)

4. **Create a Storybook Entry**
   - Basic usage story
   - All major visual variants (e.g., color, size, state)

5. **Optional: Add a Functional Test**
   - Verify that core usage works as expected
   - Optional interaction or accessibility check

---

## Input (Required):
- Name of component from Mantine (e.g. `Button`, `TextInput`)
- Any project-specific constraints (e.g. default size, design token usage)

---

## Output:
- A fully working local wrapper component (e.g. `components/atoms/AppButton.tsx`)
- A matching `.stories.tsx` file
- Optional `.test.tsx` file if applicable

---

## Example Input:
