# Todo

1. Allow the user to upload their own image
2. Put border around timestamps
3. Markdown rendering in user's messages
4. User parsing of <local-command-stdout></local-command-stdout>


## Tool Components to Create

### Task

```
{"description":"Refactor ChatInterface Core","prompt":"You are RefactorRogue Agent #1 - Core ChatInterface Specialist\n\nYour mission: Refactor the main ChatInterface component following the bulletproof React architecture.\n\nCRITICAL FILES TO CREATE:\n1. src/components/ChatInterface/ChatInterface.jsx - Only JSX, import hook and styles\n2. src/components/ChatInterface/ChatInterface.hook.js - Extract ALL stateful logic (700+ lines)\n3. src/components/ChatInterface/ChatInterface.logic.js - Extract pure functions (flattenFileTree, etc.)\n4. src/components/ChatInterface/ChatInterface.styles.js - Convert ALL Tailwind to @emotion/styled\n5. src/components/ChatInterface/ChatInterface.stories.jsx - Comprehensive stories with autodocs\n6. src/components/ChatInterface/index.ts - Barrel export with named exports\n\nKEY REQUIREMENTS:\n- Preserve ALL performance optimizations (React.memo, useMemo, useCallback, message windowing)\n- Add ARIA attributes (role=\"main\", aria-label=\"Chat interface\")\n- Convert to named export: export const ChatInterface\n- Move 700+ lines of logic to the hook file\n- Extract the inline <style> block to styled components\n- Preserve WebSocket handling, session protection, error handling\n- Update src/components/MainContent.jsx import to use named import\n\nSTYLE CONVERSION EXAMPLE:\n```javascript\n// ChatInterface.styles.js\nimport styled from '@emotion/styled';\nimport tw from 'twin.macro';\n\nexport const Wrapper = styled.div`${tw`h-full flex flex-col`}`;\n```\n\nWork relentlessly and ensure zero deviation from the standards!"}
```

### 