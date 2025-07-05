import React from 'react';
import { ClaudeStatus } from '@/features/chat/components/ClaudeStatus';
import { MicButton } from '@/shared-components/MicButton';
import CommandMenu from '@/features/chat/components/CommandMenu';
import { useInputArea } from './InputArea.hook';
import {
  InputAreaContainer,
  StyledForm,
  InputWrapper,
  StyledTextarea,
  ClearButton,
  ClearButtonIcon,
  MicButtonWrapper,
  SendButton,
  SendButtonIcon,
  CommandMenuWrapper,
  FileDropdown,
  FileDropdownItem,
  FileDropdownItemName,
  FileDropdownItemPath,
  HintTextDesktop,
  HintTextMobile
} from './InputArea.styles';

const InputArea = ({
  input,
  isInputFocused,
  setIsInputFocused,
  isTextareaExpanded,
  setIsTextareaExpanded,
  isLoading,
  claudeStatus,
  showCommandMenu,
  filteredCommands,
  showFileDropdown,
  filteredFiles,
  selectedFileIndex,
  selectedCommandIndex,
  textareaRef,
  handleSubmit: parentHandleSubmit,
  handleInputChange: parentHandleInputChange,
  handleTextareaClick: parentHandleTextareaClick,
  handleKeyDown: parentHandleKeyDown,
  handleTranscript,
  handleAbortSession,
  selectCommand: parentSelectCommand,
  selectFile: parentSelectFile,
  setInput,
  setCursorPosition,
  // Additional props that might be passed from parent
  fileList = [],
  slashCommands = [],
  cursorPosition = 0,
  atSymbolPosition = -1,
  setAtSymbolPosition = () => {},
  slashPosition = -1,
  setSlashPosition = () => {},
  setShowFileDropdown = () => {},
  setShowCommandMenu = () => {},
  setFilteredFiles = () => {},
  setFilteredCommands = () => {},
  setSelectedFileIndex = () => {},
  setSelectedCommandIndex = () => {}
}) => {
  const {
    handleSubmit,
    handleInputChange,
    handleTextareaClick,
    handleTextareaInput,
    handleKeyDown,
    selectFile,
    selectCommand,
    handleClear,
    canSubmit
  } = useInputArea({
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
  });

  return (
    <InputAreaContainer isInputFocused={isInputFocused}>
      {/* Claude Working Status - positioned above the input form */}
      <ClaudeStatus 
        status={claudeStatus}
        isLoading={isLoading}
        onAbort={handleAbortSession}
      />
      
      <StyledForm onSubmit={handleSubmit}>
        <InputWrapper isExpanded={isTextareaExpanded}>
          <StyledTextarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onClick={handleTextareaClick}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onInput={handleTextareaInput}
            placeholder="Ask Claude to help with your code... (@ to reference files)"
            disabled={isLoading}
            rows={1}
          />
          
          {/* Clear button - shown when there's text */}
          {input.trim() && (
            <ClearButton
              type="button"
              onClick={handleClear}
              onTouchEnd={handleClear}
              title="Clear input"
            >
              <ClearButtonIcon 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </ClearButtonIcon>
            </ClearButton>
          )}
          
          {/* Mic button */}
          <MicButtonWrapper>
            <MicButton 
              onTranscript={handleTranscript}
              className="w-10 h-10"
            />
          </MicButtonWrapper>
          
          {/* Send button */}
          <SendButton
            type="submit"
            disabled={!canSubmit}
            onMouseDown={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            <SendButtonIcon 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
              />
            </SendButtonIcon>
          </SendButton>
          
          {/* Command menu */}
          {showCommandMenu && filteredCommands.length > 0 && (
            <CommandMenuWrapper>
              <CommandMenu
                commands={filteredCommands}
                selectedIndex={selectedCommandIndex}
                onSelectCommand={selectCommand}
                position={{
                  bottom: 'auto',
                  left: 0,
                  right: 0
                }}
              />
            </CommandMenuWrapper>
          )}
          
          {/* File dropdown */}
          {showFileDropdown && filteredFiles.length > 0 && (
            <FileDropdown>
              {filteredFiles.map((file, index) => (
                <FileDropdownItem
                  key={file.path}
                  isSelected={index === selectedFileIndex}
                  onClick={() => selectFile(file)}
                >
                  <FileDropdownItemName>{file.name}</FileDropdownItemName>
                  <FileDropdownItemPath>{file.path}</FileDropdownItemPath>
                </FileDropdownItem>
              ))}
            </FileDropdown>
          )}
        </InputWrapper>
        
        {/* Hint text */}
        <HintTextDesktop>
          Press Enter to send • Shift+Enter for new line • @ to reference files • / for commands
        </HintTextDesktop>
        <HintTextMobile isInputFocused={isInputFocused}>
          Enter to send • @ for files • / for commands
        </HintTextMobile>
      </StyledForm>
    </InputAreaContainer>
  );
};

export { InputArea };