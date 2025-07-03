# Fixes to Implement

## 1. Message Parsing (URGENT)
The test buttons work, proving the rendering is correct. We need to fix the message parsing.

### Current Issue:
- Tool messages from Claude are being displayed as raw JSON text
- Test buttons create messages with `type: 'tool_use'` which work perfectly
- Real messages from Claude must be in a different format

### Solution Needed:
- Get console output showing the actual message structure
- Update the parser in `chatAPI.processIncomingMessage()` to handle that format

## 2. Sidebar Styling Differences

### Original Styling (from Sidebar.original.jsx):
1. **Project Item Container**:
   - Original: `w-8 h-8 rounded-lg flex items-center justify-center transition-colors`
   - Expanded state: `bg-primary/10`
   - Collapsed state: `bg-muted`

2. **Input Fields**:
   - Original: `border-2 border-primary/40 focus:border-primary shadow-sm focus:shadow-md transition-all duration-200`
   - Current: Basic border styling

3. **Hover States**:
   - Original has more sophisticated hover states with transitions
   - Shadow effects on hover

4. **Icon Containers**:
   - Original uses rounded-lg containers with background colors for icons
   - Better visual hierarchy

### Key Missing Features:
- Touch handler for iPad (`handleTouchClick`)
- Project editing inline
- New project creation flow
- Better loading states

## 3. ChatInterface Message Bubbles

### Original Features to Verify:
- User messages: `bg-blue-600 text-white rounded-2xl rounded-br-md shadow-sm`
- Assistant messages: Proper grouping and spacing
- Tool messages: Already fixed with test buttons

## Implementation Plan

1. **First Priority**: Fix message parsing
   - Need console output to see actual structure
   - Update parser accordingly

2. **Second Priority**: Restore Sidebar styling
   - Update className strings to match original
   - Add missing hover/focus states
   - Restore icon containers

3. **Third Priority**: Verify ChatInterface styling
   - Message bubbles
   - Spacing and grouping
   - Overall layout