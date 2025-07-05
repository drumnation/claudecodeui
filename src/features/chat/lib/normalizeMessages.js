/**
 * Convert raw session messages to normalized format
 * Handles tool results, user messages, and assistant messages
 * @param {Array} rawMessages - Array of raw message objects from API
 * @returns {Array} Array of normalized message objects
 */
const normalizeMessages = (rawMessages) => {
  const converted = [];
  const toolResults = new Map(); // Map tool_use_id to tool result
  
  // First pass: collect all tool results
  for (const msg of rawMessages) {
    if (msg.message?.role === 'user' && Array.isArray(msg.message?.content)) {
      for (const part of msg.message.content) {
        if (part.type === 'tool_result') {
          toolResults.set(part.tool_use_id, {
            content: part.content,
            isError: part.is_error,
            timestamp: new Date(msg.timestamp || Date.now())
          });
        }
      }
    }
  }
  
  // Second pass: process messages and attach tool results to tool uses
  for (const msg of rawMessages) {
    // Handle user messages
    if (msg.message?.role === 'user' && msg.message?.content) {
      let content = '';
      let messageType = 'user';
      
      if (Array.isArray(msg.message.content)) {
        // Handle array content, but skip tool results (they're attached to tool uses)
        const textParts = [];
        
        for (const part of msg.message.content) {
          if (part.type === 'text') {
            textParts.push(part.text);
          }
          // Skip tool_result parts - they're handled in the first pass
        }
        
        content = textParts.join('\n');
      } else if (typeof msg.message.content === 'string') {
        content = msg.message.content;
      } else {
        content = String(msg.message.content);
      }
      
      // Skip command messages and empty content
      if (content && !content.startsWith('<command-name>') && !content.startsWith('[Request interrupted')) {
        converted.push({
          type: messageType,
          content: content,
          timestamp: msg.timestamp || new Date().toISOString()
        });
      }
    }
    
    // Handle assistant messages
    else if (msg.message?.role === 'assistant' && msg.message?.content) {
      if (Array.isArray(msg.message.content)) {
        for (const part of msg.message.content) {
          if (part.type === 'text') {
            converted.push({
              type: 'assistant',
              content: part.text,
              timestamp: msg.timestamp || new Date().toISOString()
            });
          } else if (part.type === 'tool_use') {
            // Get the corresponding tool result
            const toolResult = toolResults.get(part.id);
            
            converted.push({
              type: 'assistant',
              content: '',
              timestamp: msg.timestamp || new Date().toISOString(),
              isToolUse: true,
              toolName: part.name,
              toolInput: JSON.stringify(part.input),
              toolResult: toolResult ? (typeof toolResult.content === 'string' ? toolResult.content : JSON.stringify(toolResult.content)) : null,
              toolError: toolResult?.isError || false,
              toolResultTimestamp: toolResult?.timestamp || new Date()
            });
          }
        }
      } else if (typeof msg.message.content === 'string') {
        converted.push({
          type: 'assistant',
          content: msg.message.content,
          timestamp: msg.timestamp || new Date().toISOString()
        });
      }
    }
  }
  
  return converted;
};

export default normalizeMessages;