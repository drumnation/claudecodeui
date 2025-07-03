# Debugging Tool Rendering Issues

## Current Status

The tool messages are being displayed as raw JSON instead of using the special tool rendering components.

## What I've Fixed So Far

1. **Updated MessageComponent.tsx** to check both `message.isToolUse` and `message.type === 'tool_use'`
2. **Added special tool rendering** for Edit, Write, and TodoWrite tools
3. **Added logging** to help debug the message structure

## The Issue

From your screenshot, I can see that the tool data is being displayed as raw JSON text. This means one of these scenarios:

1. The message is coming through as a plain assistant message with JSON content (not as a structured tool message)
2. The frontend is not properly parsing the claude-response format
3. The backend is not sending the correct message structure

## Next Steps to Debug

1. **Check Browser Console**: Look for the log message "Processing claude-response - FULL DATA:" which will show the exact structure

2. **Expected Structure**: The frontend expects messages like:
   ```json
   {
     "type": "claude-response",
     "data": {
       "type": "message",
       "role": "assistant",
       "content": [
         {
           "type": "tool_use",
           "name": "TodoWrite",
           "input": { ... }
         }
       ]
     }
   }
   ```

3. **If the structure is different**, we need to update the parsing logic to handle the actual format

## Temporary Workaround

If you need to see the tool rendering working immediately, you can manually create a test message in the browser console:

```javascript
// In browser console, find the ChatInterface component in React DevTools
// Then manually add a test message to see the rendering:
const testMessage = {
  type: 'tool_use',
  content: '',
  id: 'test-tool-1',
  timestamp: new Date().toISOString(),
  tool_name: 'TodoWrite',
  toolName: 'TodoWrite',
  tool_input: {
    todos: [
      { content: "Test todo 1", status: "completed", priority: "high", id: "1" },
      { content: "Test todo 2", status: "in_progress", priority: "medium", id: "2" },
      { content: "Test todo 3", status: "pending", priority: "low", id: "3" }
    ]
  },
  isToolUse: true
};

// Add to messages array to test rendering
```