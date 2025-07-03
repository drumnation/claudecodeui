# Debug Instructions for Tool Rendering

## Setup Complete

I've added a debug helper to your app. You should now see a small panel in the bottom-right corner with these buttons:
- **Check Sessions** - Shows session info
- **Log Test Tool** - Logs a test tool structure
- **Show Captured** - Shows captured WebSocket messages
- **Clear Capture** - Clears the capture buffer

## How to Debug the Tool Rendering Issue

1. **Start Fresh**
   - Refresh your browser
   - Open the browser console (F12)
   - Click "Clear Capture" to start with a clean buffer

2. **Trigger a Tool Use**
   - Send a message to Claude that will trigger a tool, like:
     - "Create a todo list with 3 items"
     - "Edit the README file"
     - "Write a new test file"

3. **Check the Console**
   - Look for messages starting with `🎯 CLAUDE-RESPONSE CAPTURED:`
   - These show the exact structure of messages from the backend
   - If you see `🔧 TOOL USE DETECTED IN MESSAGE!`, the parser found it

4. **Use Show Captured Button**
   - Click "Show Captured" to see the last 5 claude-response messages
   - This shows the full message structure

5. **What to Look For**
   The tool data might be in one of these formats:

   ```json
   // Format A: Direct tool_use
   {
     "type": "claude-response",
     "data": {
       "type": "tool_use",
       "name": "TodoWrite",
       "input": {...}
     }
   }

   // Format B: Nested in message content
   {
     "type": "claude-response", 
     "data": {
       "type": "message",
       "message": {
         "role": "assistant",
         "content": [
           {
             "type": "tool_use",
             "name": "TodoWrite",
             "input": {...}
           }
         ]
       }
     }
   }

   // Format C: As a string that needs parsing
   {
     "type": "claude-response",
     "data": {
       "content": "{\"type\":\"tool_use\",\"name\":\"TodoWrite\"...}"
     }
   }
   ```

## Once You Find the Format

Share the console output with me, particularly:
1. The full structure from `🎯 CLAUDE-RESPONSE CAPTURED:`
2. Whether `🔧 TOOL USE DETECTED IN MESSAGE!` appears
3. The output from clicking "Show Captured"

With this information, I can update the parser to handle the exact format your backend is sending.

## Test Buttons Still Work?

The test buttons in the chat interface prove the rendering works. If they still show the todo list and file edit visualizations correctly, then we know it's purely a parsing issue.