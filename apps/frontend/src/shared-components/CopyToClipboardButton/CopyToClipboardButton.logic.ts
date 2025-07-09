/**
 * Utility functions for CopyToClipboardButton component
 */

/**
 * Determines what text to copy based on message type and content
 * @param {Object} message - The message object
 * @returns {string} The text to copy to clipboard
 */
export const getTextToCopy = (message: any) => {
  if (!message) return '';

  // Handle different message types
  if (message.type === 'assistant') {
    // For assistant messages, we might have tool use content
    if (message.content && Array.isArray(message.content)) {
      // Extract text from content blocks
      const textBlocks = message.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n\n');

      // Extract tool use results if present
      const toolBlocks = message.content
        .filter((block: any) => block.type === 'tool_use')
        .map((block: any) => {
          const input = block.input ? JSON.stringify(block.input, null, 2) : '';
          return `Tool: ${block.name}\nInput: ${input}`;
        })
        .join('\n\n');

      // Combine text and tool content
      const parts = [textBlocks, toolBlocks].filter(Boolean);
      return parts.join('\n\n---\n\n');
    }

    // Fallback to raw content
    return typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content, null, 2);
  }

  if (message.type === 'human' || message.type === 'user') {
    return typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content, null, 2);
  }

  // Handle tool results
  if (message.type === 'tool_result') {
    const content = message.content || message.result || '';
    return typeof content === 'string'
      ? content
      : JSON.stringify(content, null, 2);
  }

  // Handle error messages
  if (message.error) {
    return typeof message.error === 'string'
      ? message.error
      : JSON.stringify(message.error, null, 2);
  }

  // Fallback: try to extract any text content
  const content = message.content || message.text || message.message || '';
  return typeof content === 'string'
    ? content
    : JSON.stringify(content, null, 2);
};

/**
 * Sanitizes text for clipboard by removing excessive whitespace and formatting properly
 * @param {string} text - The text to sanitize
 * @returns {string} Cleaned text
 */
export const sanitizeTextForClipboard = (text: any) => {
  if (!text || typeof text !== 'string') return '';

  return (
    text
      // Remove excessive whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim leading and trailing whitespace
      .trim()
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      // Remove trailing spaces from lines
      .replace(/ +$/gm, '')
  );
};

/**
 * Returns appropriate aria-label based on button state
 * @param {boolean} isSuccess - Whether copy was successful
 * @param {boolean} isCopying - Whether copy is in progress
 * @param {string|null} error - Error message if any
 * @returns {string} Appropriate aria-label
 */
export const getAriaLabel = (isSuccess: any, isCopying: any, error: any) => {
  if (error) return 'Failed to copy to clipboard';
  if (isCopying) return 'Copying to clipboard...';
  if (isSuccess) return 'Copied to clipboard successfully';
  return 'Copy message to clipboard';
};

/**
 * Gets the appropriate title attribute for the button
 * @param {boolean} isSuccess - Whether copy was successful
 * @param {boolean} isCopying - Whether copy is in progress
 * @param {string|null} error - Error message if any
 * @returns {string} Appropriate title
 */
export const getButtonTitle = (isSuccess: any, isCopying: any, error: any) => {
  if (error) return `Copy failed: ${error}`;
  if (isCopying) return 'Copying...';
  if (isSuccess) return 'Copied!';
  return 'Copy to clipboard';
};
