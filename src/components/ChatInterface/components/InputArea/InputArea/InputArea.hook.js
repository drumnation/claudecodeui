import { useEffect, useCallback } from 'react';
import {
  canSubmitInput,
  extractFileReference,
  extractCommand,
  filterFiles,
  filterCommands,
  isTextareaExpanded,
  autoResizeTextarea,
  insertTextAtPosition,
  handleDropdownNavigation,
  resetTextarea
} from './InputArea.logic';

export const useInputArea = ({
  input,
  setInput,
  isLoading,
  textareaRef,
  fileList,
  slashCommands,
  showFileDropdown,
  setShowFileDropdown,
  showCommandMenu,
  setShowCommandMenu,
  filteredFiles,
  setFilteredFiles,
  filteredCommands,
  setFilteredCommands,
  selectedFileIndex,
  setSelectedFileIndex,
  selectedCommandIndex,
  setSelectedCommandIndex,
  cursorPosition,
  setCursorPosition,
  atSymbolPosition,
  setAtSymbolPosition,
  slashPosition,
  setSlashPosition,
  isTextareaExpanded,
  setIsTextareaExpanded,
  handleSubmit: parentHandleSubmit,
  handleInputChange: parentHandleInputChange,
  handleKeyDown: parentHandleKeyDown,
  selectCommand: parentSelectCommand,
  selectFile: parentSelectFile
}) => {
  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canSubmitInput(input, isLoading)) {
      return;
    }
    
    parentHandleSubmit(e);
  }, [input, isLoading, parentHandleSubmit]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    
    // Call parent handler
    parentHandleInputChange(e);
    
    // Check for file reference (@)
    const fileRef = extractFileReference(newValue, newCursorPosition);
    if (fileRef.position !== -1) {
      setAtSymbolPosition(fileRef.position);
      const filtered = filterFiles(fileList, fileRef.query);
      setFilteredFiles(filtered);
      setShowFileDropdown(filtered.length > 0);
      setSelectedFileIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setShowFileDropdown(false);
      setAtSymbolPosition(-1);
    }
    
    // Check for command (/)
    const command = extractCommand(newValue, newCursorPosition);
    if (command.position !== -1) {
      setSlashPosition(command.position);
      const filtered = filterCommands(slashCommands, command.query);
      setFilteredCommands(filtered);
      setShowCommandMenu(filtered.length > 0);
      setSelectedCommandIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setShowCommandMenu(false);
      setSlashPosition(-1);
    }
  }, [
    fileList,
    slashCommands,
    parentHandleInputChange,
    setAtSymbolPosition,
    setFilteredFiles,
    setShowFileDropdown,
    setSelectedFileIndex,
    setSlashPosition,
    setFilteredCommands,
    setShowCommandMenu,
    setSelectedCommandIndex
  ]);

  // Handle textarea click
  const handleTextareaClick = useCallback((e) => {
    setCursorPosition(e.target.selectionStart);
  }, [setCursorPosition]);

  // Handle textarea input (for auto-resize)
  const handleTextareaInput = useCallback((e) => {
    autoResizeTextarea(e.target);
    setCursorPosition(e.target.selectionStart);
    
    // Check if textarea is expanded
    const isExpanded = isTextareaExpanded(e.target);
    setIsTextareaExpanded(isExpanded);
  }, [setCursorPosition, setIsTextareaExpanded]);

  // Handle key down events
  const handleKeyDown = useCallback((e) => {
    // Handle dropdown navigation
    const navigationResult = handleDropdownNavigation(e, {
      showFileDropdown,
      showCommandMenu,
      filteredFiles,
      filteredCommands,
      selectedFileIndex,
      selectedCommandIndex
    });
    
    if (navigationResult) {
      if (navigationResult.shouldSelectFile && selectedFileIndex >= 0) {
        parentSelectFile(filteredFiles[selectedFileIndex]);
        return;
      }
      if (navigationResult.shouldSelectCommand && selectedCommandIndex >= 0) {
        parentSelectCommand(filteredCommands[selectedCommandIndex]);
        return;
      }
      
      // Update navigation states
      if (navigationResult.selectedFileIndex !== undefined) {
        setSelectedFileIndex(navigationResult.selectedFileIndex);
      }
      if (navigationResult.selectedCommandIndex !== undefined) {
        setSelectedCommandIndex(navigationResult.selectedCommandIndex);
      }
      if (navigationResult.showFileDropdown !== undefined) {
        setShowFileDropdown(navigationResult.showFileDropdown);
      }
      if (navigationResult.showCommandMenu !== undefined) {
        setShowCommandMenu(navigationResult.showCommandMenu);
      }
      
      return;
    }
    
    // Call parent handler for other key events
    parentHandleKeyDown(e);
  }, [
    showFileDropdown,
    showCommandMenu,
    filteredFiles,
    filteredCommands,
    selectedFileIndex,
    selectedCommandIndex,
    setSelectedFileIndex,
    setSelectedCommandIndex,
    setShowFileDropdown,
    setShowCommandMenu,
    parentHandleKeyDown,
    parentSelectFile,
    parentSelectCommand
  ]);

  // Handle file selection
  const selectFile = useCallback((file) => {
    if (!file) return;
    
    const { input: newInput, cursorPosition: newCursorPosition } = insertTextAtPosition(
      input,
      atSymbolPosition,
      `@${file.path} `,
      input.substring(atSymbolPosition, cursorPosition)
    );
    
    setInput(newInput);
    setShowFileDropdown(false);
    setSelectedFileIndex(-1);
    setAtSymbolPosition(-1);
    
    // Focus and set cursor position
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(() => {
        textareaRef.current.selectionStart = newCursorPosition;
        textareaRef.current.selectionEnd = newCursorPosition;
      }, 0);
    }
    
    // Call parent handler if needed
    if (parentSelectFile) {
      parentSelectFile(file);
    }
  }, [
    input,
    atSymbolPosition,
    cursorPosition,
    setInput,
    setShowFileDropdown,
    setSelectedFileIndex,
    setAtSymbolPosition,
    textareaRef,
    parentSelectFile
  ]);

  // Handle command selection
  const selectCommand = useCallback((command) => {
    if (!command) return;
    
    const { input: newInput, cursorPosition: newCursorPosition } = insertTextAtPosition(
      input,
      slashPosition,
      `/${command.name} `,
      input.substring(slashPosition, cursorPosition)
    );
    
    setInput(newInput);
    setShowCommandMenu(false);
    setSelectedCommandIndex(-1);
    setSlashPosition(-1);
    
    // Focus and set cursor position
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(() => {
        textareaRef.current.selectionStart = newCursorPosition;
        textareaRef.current.selectionEnd = newCursorPosition;
      }, 0);
    }
    
    // Call parent handler if needed
    if (parentSelectCommand) {
      parentSelectCommand(command);
    }
  }, [
    input,
    slashPosition,
    cursorPosition,
    setInput,
    setShowCommandMenu,
    setSelectedCommandIndex,
    setSlashPosition,
    textareaRef,
    parentSelectCommand
  ]);

  // Handle clear button click
  const handleClear = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setInput('');
    resetTextarea(textareaRef.current);
    setIsTextareaExpanded(false);
  }, [setInput, textareaRef, setIsTextareaExpanded]);

  // Auto-resize textarea on mount and when input changes
  useEffect(() => {
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current);
    }
  }, [input, textareaRef]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target)) {
        setShowFileDropdown(false);
        setShowCommandMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [textareaRef, setShowFileDropdown, setShowCommandMenu]);

  return {
    handleSubmit,
    handleInputChange,
    handleTextareaClick,
    handleTextareaInput,
    handleKeyDown,
    selectFile,
    selectCommand,
    handleClear,
    canSubmit: canSubmitInput(input, isLoading)
  };
};