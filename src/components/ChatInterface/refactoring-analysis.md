# ChatInterface Refactoring Analysis

## Component Structure Requirements
Each component should have the following files:
- `index.js` - Re-export file
- `ComponentName.jsx` - Main component file
- `ComponentName.styles.js` - Styled components/styles
- `ComponentName.hook.js` - Custom hooks
- `ComponentName.logic.js` - Business logic
- `ComponentName.stories.jsx` - Storybook stories

## Current Components Analysis

### 1. ChatInterface (Root Component)
**Path**: `/src/components/ChatInterface/`
- ✅ `index.jsx` (exists - needs to be split into index.js + ChatInterface.jsx)
- ❌ `ChatInterface.jsx` (missing)
- ❌ `ChatInterface.styles.js` (missing)
- ❌ `ChatInterface.hook.js` (missing)
- ❌ `ChatInterface.logic.js` (missing)
- ❌ `ChatInterface.stories.jsx` (missing)

### 2. HintTexts
**Path**: `/src/components/ChatInterface/components/HintTexts/`
- ✅ `index.jsx` (exists - needs to be split into index.js + HintTexts.jsx)
- ❌ `HintTexts.jsx` (missing)
- ❌ `HintTexts.styles.js` (missing)
- ❌ `HintTexts.hook.js` (missing)
- ❌ `HintTexts.logic.js` (missing)
- ❌ `HintTexts.stories.jsx` (missing)

### 3. InputArea
**Path**: `/src/components/ChatInterface/components/InputArea/`
- ✅ `index.jsx` (exists - needs to be split into index.js + InputArea.jsx)
- ❌ `InputArea.jsx` (missing)
- ❌ `InputArea.styles.js` (missing)
- ❌ `InputArea.hook.js` (missing)
- ❌ `InputArea.logic.js` (missing)
- ❌ `InputArea.stories.jsx` (missing)

### 4. Message
**Path**: `/src/components/ChatInterface/components/Message/`
- ✅ `index.jsx` (exists - needs to be split into index.js + Message.jsx)
- ❌ `Message.jsx` (missing)
- ❌ `Message.styles.js` (missing)
- ❌ `Message.hook.js` (missing)
- ❌ `Message.logic.js` (missing)
- ❌ `Message.stories.jsx` (missing)

#### Message Sub-components:
- **AssistantMessage** (directory exists, no files)
- **InteractivePromptMessage** (directory exists, no files)
- **MarkdownContent** (directory exists, no files)
- **ToolResultDisplay** (directory exists, no files)
- **ToolUseMessage** (directory exists, no files)
- **UserMessage** (directory exists, no files)

### 5. MessageStates
**Path**: `/src/components/ChatInterface/components/MessageStates/`
- ✅ `index.jsx` (exists - needs to be split into index.js + MessageStates.jsx)
- ❌ `MessageStates.jsx` (missing)
- ❌ `MessageStates.styles.js` (missing)
- ❌ `MessageStates.hook.js` (missing)
- ❌ `MessageStates.logic.js` (missing)
- ❌ `MessageStates.stories.jsx` (missing)

### 6. MessagesArea
**Path**: `/src/components/ChatInterface/components/MessagesArea/`
- ✅ `index.jsx` (exists - needs to be split into index.js + MessagesArea.jsx)
- ❌ `MessagesArea.jsx` (missing)
- ❌ `MessagesArea.styles.js` (missing)
- ❌ `MessagesArea.hook.js` (missing)
- ❌ `MessagesArea.logic.js` (missing)
- ❌ `MessagesArea.stories.jsx` (missing)

### 7. NoProjectSelected
**Path**: `/src/components/ChatInterface/components/NoProjectSelected/`
- ✅ `index.jsx` (exists - needs to be split into index.js + NoProjectSelected.jsx)
- ❌ `NoProjectSelected.jsx` (missing)
- ❌ `NoProjectSelected.styles.js` (missing)
- ❌ `NoProjectSelected.hook.js` (missing)
- ❌ `NoProjectSelected.logic.js` (missing)
- ❌ `NoProjectSelected.stories.jsx` (missing)

### 8. ScrollToBottomButton
**Path**: `/src/components/ChatInterface/components/ScrollToBottomButton/`
- ✅ `index.jsx` (exists - needs to be split into index.js + ScrollToBottomButton.jsx)
- ❌ `ScrollToBottomButton.jsx` (missing)
- ❌ `ScrollToBottomButton.styles.js` (missing)
- ❌ `ScrollToBottomButton.hook.js` (missing)
- ❌ `ScrollToBottomButton.logic.js` (missing)
- ❌ `ScrollToBottomButton.stories.jsx` (missing)

### 9. Tools Components
**Path**: `/src/components/ChatInterface/components/Tools/`
All tool components need to be created:
- **BashTool** (directory exists, no files)
- **DefaultTool** (directory exists, no files)
- **EditTool** (directory exists, no files)
- **GlobTool** (directory exists, no files)
- **GrepTool** (directory exists, no files)
- **LSTool** (directory exists, no files)
- **MultiEditTool** (directory exists, no files)
- **ReadTool** (directory exists, no files)
- **TaskTool** (directory exists, no files)
- **TodoWriteTool** (directory exists, no files)
- **WebFetchTool** (directory exists, no files)
- **WebSearchTool** (directory exists, no files)
- **WriteTool** (directory exists, no files)

## Summary

### Existing Files That Need Refactoring:
1. All `index.jsx` files need to be split into:
   - `index.js` (re-export only)
   - `ComponentName.jsx` (actual component code)

### Total Files to Create:
- **Main Components**: 8 components × 6 files each = 48 files
- **Message Sub-components**: 6 components × 6 files each = 36 files
- **Tool Components**: 13 components × 6 files each = 78 files
- **Total**: 162 new files

### Refactoring Priority:
1. **High Priority**: Core components (ChatInterface, Message, InputArea, MessagesArea)
2. **Medium Priority**: Support components (HintTexts, MessageStates, NoProjectSelected, ScrollToBottomButton)
3. **Low Priority**: Tool components and Message sub-components

### Additional Considerations:
- The `/lib` directory contains utility functions that may need to be integrated into component logic files
- Empty component directories suggest incomplete implementation or planned features
- Consider whether all Tool components are necessary or if they can be consolidated