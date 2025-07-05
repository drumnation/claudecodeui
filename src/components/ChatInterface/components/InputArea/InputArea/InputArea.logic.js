/**
 * InputArea logic functions
 * Contains validation and helper functions for the InputArea component
 */

/**
 * Validates if the input is ready to be submitted
 * @param {string} input - The current input value
 * @param {boolean} isLoading - Whether the chat is currently loading
 * @returns {boolean} Whether the input can be submitted
 */
export const canSubmitInput = (input, isLoading) => {
  return input.trim().length > 0 && !isLoading;
};

/**
 * Extracts file reference from input at cursor position
 * @param {string} input - The current input value
 * @param {number} cursorPosition - Current cursor position
 * @returns {Object} Object containing fileSearch query and position info
 */
export const extractFileReference = (input, cursorPosition) => {
  // Find the last @ symbol before cursor
  const beforeCursor = input.substring(0, cursorPosition);
  const lastAtIndex = beforeCursor.lastIndexOf('@');
  
  if (lastAtIndex === -1) {
    return { query: '', position: -1 };
  }
  
  // Extract the search query after @
  const afterAt = beforeCursor.substring(lastAtIndex + 1);
  
  // Check if there's a space after @ (which would end the file reference)
  if (afterAt.includes(' ')) {
    return { query: '', position: -1 };
  }
  
  return {
    query: afterAt,
    position: lastAtIndex
  };
};

/**
 * Extracts command from input at cursor position
 * @param {string} input - The current input value
 * @param {number} cursorPosition - Current cursor position
 * @returns {Object} Object containing command query and position info
 */
export const extractCommand = (input, cursorPosition) => {
  const beforeCursor = input.substring(0, cursorPosition);
  
  // Only show commands if slash is at the beginning
  if (!beforeCursor.startsWith('/')) {
    return { query: '', position: -1 };
  }
  
  // Check if there's a space after / (which would end the command)
  if (beforeCursor.includes(' ')) {
    return { query: '', position: -1 };
  }
  
  // Extract command without the slash
  const command = beforeCursor.substring(1);
  
  return {
    query: command,
    position: 0
  };
};

/**
 * Filters files based on search query
 * @param {Array} fileList - List of all files
 * @param {string} query - Search query
 * @returns {Array} Filtered list of files
 */
export const filterFiles = (fileList, query) => {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  return fileList
    .filter(file => 
      file.name.toLowerCase().includes(lowerQuery) ||
      file.path.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 10); // Limit to 10 results
};

/**
 * Filters commands based on search query
 * @param {Array} commands - List of all commands
 * @param {string} query - Search query
 * @returns {Array} Filtered list of commands
 */
export const filterCommands = (commands, query) => {
  if (!commands || commands.length === 0) return [];
  
  const lowerQuery = query.toLowerCase();
  return commands
    .filter(cmd => 
      cmd.name.toLowerCase().includes(lowerQuery) ||
      (cmd.description && cmd.description.toLowerCase().includes(lowerQuery))
    )
    .slice(0, 10); // Limit to 10 results
};

/**
 * Calculates if textarea should be considered expanded
 * @param {HTMLElement} textareaElement - The textarea DOM element
 * @returns {boolean} Whether the textarea is expanded
 */
export const isTextareaExpanded = (textareaElement) => {
  if (!textareaElement) return false;
  
  const lineHeight = parseInt(window.getComputedStyle(textareaElement).lineHeight);
  return textareaElement.scrollHeight > lineHeight * 2;
};

/**
 * Auto-resizes textarea based on content
 * @param {HTMLElement} textareaElement - The textarea DOM element
 */
export const autoResizeTextarea = (textareaElement) => {
  if (!textareaElement) return;
  
  // Reset height to auto to get the correct scrollHeight
  textareaElement.style.height = 'auto';
  // Set height to scrollHeight
  textareaElement.style.height = textareaElement.scrollHeight + 'px';
};

/**
 * Inserts text at cursor position and updates input
 * @param {string} currentInput - Current input value
 * @param {number} position - Position to insert at
 * @param {string} textToInsert - Text to insert
 * @param {string} textToReplace - Text to replace (optional)
 * @returns {Object} New input value and cursor position
 */
export const insertTextAtPosition = (currentInput, position, textToInsert, textToReplace = '') => {
  let beforePosition = currentInput.substring(0, position);
  let afterPosition = currentInput.substring(position + textToReplace.length);
  
  // If we're replacing text (like a partial file/command name), adjust the position
  if (textToReplace) {
    const replaceStart = position;
    const replaceEnd = position + textToReplace.length;
    beforePosition = currentInput.substring(0, replaceStart);
    afterPosition = currentInput.substring(replaceEnd);
  }
  
  const newInput = beforePosition + textToInsert + afterPosition;
  const newCursorPosition = position + textToInsert.length;
  
  return {
    input: newInput,
    cursorPosition: newCursorPosition
  };
};

/**
 * Handles keyboard navigation for dropdown menus
 * @param {KeyboardEvent} event - The keyboard event
 * @param {Object} state - Current state object
 * @returns {Object} Updated state for navigation
 */
export const handleDropdownNavigation = (event, state) => {
  const { key } = event;
  const { 
    showFileDropdown, 
    showCommandMenu, 
    filteredFiles, 
    filteredCommands,
    selectedFileIndex,
    selectedCommandIndex
  } = state;
  
  if (showFileDropdown && filteredFiles.length > 0) {
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        return {
          selectedFileIndex: Math.min(selectedFileIndex + 1, filteredFiles.length - 1)
        };
      case 'ArrowUp':
        event.preventDefault();
        return {
          selectedFileIndex: Math.max(selectedFileIndex - 1, 0)
        };
      case 'Tab':
      case 'Enter':
        if (selectedFileIndex >= 0) {
          event.preventDefault();
          return { shouldSelectFile: true };
        }
        break;
      case 'Escape':
        event.preventDefault();
        return { 
          showFileDropdown: false,
          selectedFileIndex: -1
        };
    }
  }
  
  if (showCommandMenu && filteredCommands.length > 0) {
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        return {
          selectedCommandIndex: Math.min(selectedCommandIndex + 1, filteredCommands.length - 1)
        };
      case 'ArrowUp':
        event.preventDefault();
        return {
          selectedCommandIndex: Math.max(selectedCommandIndex - 1, 0)
        };
      case 'Tab':
      case 'Enter':
        if (selectedCommandIndex >= 0) {
          event.preventDefault();
          return { shouldSelectCommand: true };
        }
        break;
      case 'Escape':
        event.preventDefault();
        return {
          showCommandMenu: false,
          selectedCommandIndex: -1
        };
    }
  }
  
  return null;
};

/**
 * Resets the textarea to its initial state
 * @param {HTMLElement} textareaElement - The textarea DOM element
 */
export const resetTextarea = (textareaElement) => {
  if (!textareaElement) return;
  
  textareaElement.style.height = 'auto';
  textareaElement.focus();
};