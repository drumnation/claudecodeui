// API Calls
export const loadSessionMessages = async (projectName, sessionId) => {
  if (!projectName || !sessionId) return [];
  
  try {
    const response = await fetch(`/api/projects/${projectName}/sessions/${sessionId}/messages`);
    if (!response.ok) {
      throw new Error('Failed to load session messages');
    }
    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Error loading session messages:', error);
    return [];
  }
};

export const fetchProjectFiles = async (projectName) => {
  try {
    const response = await fetch(`/api/projects/${projectName}/files`);
    if (response.ok) {
      const files = await response.json();
      return flattenFileTree(files);
    }
  } catch (error) {
    console.error('Error fetching files:', error);
  }
  return [];
};

export const fetchSlashCommands = async () => {
  try {
    const response = await fetch('/api/slash-commands');
    if (response.ok) {
      const data = await response.json();
      return data.commands || [];
    }
  } catch (error) {
    console.error('Error fetching slash commands:', error);
  }
  return [];
};

// Helper Functions
export const flattenFileTree = (files, basePath = '') => {
  let result = [];
  for (const file of files) {
    const fullPath = basePath ? `${basePath}/${file.name}` : file.name;
    if (file.type === 'directory' && file.children) {
      result = result.concat(flattenFileTree(file.children, fullPath));
    } else if (file.type === 'file') {
      result.push({
        name: file.name,
        path: fullPath,
        relativePath: file.path
      });
    }
  }
  return result;
};

export const getToolsSettings = () => {
  try {
    const savedSettings = localStorage.getItem('claude-tools-settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading tools settings:', error);
  }
  return {
    allowedTools: [],
    disallowedTools: [],
    skipPermissions: false
  };
};

// Input handling utilities
export const selectCommand = (command, input, slashPosition, textareaRef, setInput, setShowCommandMenu, setSlashPosition, setCursorPosition) => {
  const textBeforeSlash = input.slice(0, slashPosition);
  const textAfterSlashQuery = input.slice(slashPosition);
  const spaceIndex = textAfterSlashQuery.indexOf(' ');
  const textAfterQuery = spaceIndex !== -1 ? textAfterSlashQuery.slice(spaceIndex) : '';
  
  const newInput = textBeforeSlash + command.command + ' ' + textAfterQuery;
  setInput(newInput);
  setShowCommandMenu(false);
  setSlashPosition(-1);
  
  // Focus back to textarea and set cursor position
  if (textareaRef.current) {
    textareaRef.current.focus();
    const newCursorPos = textBeforeSlash.length + command.command.length + 1;
    setTimeout(() => {
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      setCursorPosition(newCursorPos);
    }, 0);
  }
};

export const selectFile = (file, input, atSymbolPosition, textareaRef, setInput, setShowFileDropdown, setAtSymbolPosition, setCursorPosition) => {
  const textBeforeAt = input.slice(0, atSymbolPosition);
  const textAfterAtQuery = input.slice(atSymbolPosition);
  const spaceIndex = textAfterAtQuery.indexOf(' ');
  const textAfterQuery = spaceIndex !== -1 ? textAfterAtQuery.slice(spaceIndex) : '';
  
  const newInput = textBeforeAt + '@' + file.path + textAfterQuery;
  setInput(newInput);
  setShowFileDropdown(false);
  setAtSymbolPosition(-1);
  
  // Focus back to textarea and set cursor position
  if (textareaRef.current) {
    textareaRef.current.focus();
    const newCursorPos = textBeforeAt.length + 1 + file.path.length;
    setTimeout(() => {
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      setCursorPosition(newCursorPos);
    }, 0);
  }
};

export const handleKeyDown = (e, {
  showCommandMenu,
  filteredCommands,
  selectedCommandIndex,
  setSelectedCommandIndex,
  selectCommandCallback,
  showFileDropdown,
  filteredFiles,
  selectedFileIndex,
  setSelectedFileIndex,
  selectFileCallback,
  setShowCommandMenu,
  setShowFileDropdown,
  handleSubmit
}) => {
  // Handle command menu navigation
  if (showCommandMenu && filteredCommands.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCommandIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCommandIndex(prev => 
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
      return;
    }
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      if (selectedCommandIndex >= 0) {
        selectCommandCallback(filteredCommands[selectedCommandIndex]);
      } else if (filteredCommands.length > 0) {
        selectCommandCallback(filteredCommands[0]);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowCommandMenu(false);
      return;
    }
  }
  
  // Handle file dropdown navigation
  if (showFileDropdown && filteredFiles.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedFileIndex(prev => 
        prev < filteredFiles.length - 1 ? prev + 1 : 0
      );
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedFileIndex(prev => 
        prev > 0 ? prev - 1 : filteredFiles.length - 1
      );
      return;
    }
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      if (selectedFileIndex >= 0) {
        selectFileCallback(filteredFiles[selectedFileIndex]);
      } else if (filteredFiles.length > 0) {
        selectFileCallback(filteredFiles[0]);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowFileDropdown(false);
      return;
    }
  }
  
  // Handle Enter key: Ctrl+Enter (Cmd+Enter on Mac) sends, Shift+Enter creates new line
  if (e.key === 'Enter') {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      // Ctrl+Enter or Cmd+Enter: Send message
      e.preventDefault();
      handleSubmit(e);
    } else if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      // Plain Enter: Also send message (keeping original behavior)
      e.preventDefault();
      handleSubmit(e);
    }
    // Shift+Enter: Allow default behavior (new line)
  }
};

export const handleSubmit = (e, {
  input,
  isLoading,
  selectedProject,
  setChatMessages,
  setIsLoading,
  setCanAbortSession,
  setClaudeStatus,
  scrollToBottom,
  currentSessionId,
  onSessionActive,
  sendMessage,
  setInput,
  setIsTextareaExpanded
}) => {
  e.preventDefault();
  if (!input.trim() || isLoading || !selectedProject) return;

  const userMessage = {
    type: 'user',
    content: input,
    timestamp: new Date()
  };

  setChatMessages(prev => [...prev, userMessage]);
  setIsLoading(true);
  setCanAbortSession(true);
  // Set a default status when starting
  setClaudeStatus({
    text: 'Processing',
    tokens: 0,
    can_interrupt: true
  });
  
  // Always scroll to bottom when user sends a message
  setTimeout(() => scrollToBottom(), 0);

  // Session Protection: Mark session as active
  const sessionToActivate = currentSessionId || `new-session-${Date.now()}`;
  if (onSessionActive) {
    onSessionActive(sessionToActivate);
  }

  const toolsSettings = getToolsSettings();

  // Send command to Claude CLI via WebSocket
  sendMessage({
    type: 'claude-command',
    command: input,
    options: {
      projectPath: selectedProject.path,
      cwd: selectedProject.fullPath,
      sessionId: currentSessionId,
      resume: !!currentSessionId,
      toolsSettings: toolsSettings
    }
  });

  setInput('');
  setIsTextareaExpanded(false);
  // Clear the saved draft since message was sent
  if (selectedProject) {
    localStorage.removeItem(`draft_input_${selectedProject.name}`);
  }
};

export const handleAbortSession = (currentSessionId, canAbortSession, sendMessage) => {
  if (currentSessionId && canAbortSession) {
    sendMessage({
      type: 'abort-session',
      sessionId: currentSessionId
    });
  }
};

export const handleInputChange = (e, setInput, setCursorPosition) => {
  setInput(e.target.value);
  setCursorPosition(e.target.selectionStart);
};

export const handleTextareaClick = (e, setCursorPosition) => {
  setCursorPosition(e.target.selectionStart);
};