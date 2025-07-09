import React, {memo, useMemo} from 'react';
import {ClaudeStatus} from '@/features/chat/components/ClaudeStatus';
import {MicButton} from '@/shared-components/MicButton';
import {CommandMenu} from '@/features/chat/components/CommandMenu';
import {useInputArea} from './InputArea.hook';
import {InputAreaProps} from './InputArea.types';
import {useRenderCount, useMemoryLeakDetector} from '@/utils/performance';
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
  HintTextMobile,
} from './InputArea.styles';

const InputArea = memo<InputAreaProps>(
  ({
    input,
    isInputFocused,
    setIsInputFocused,
    textareaExpanded,
    setTextareaExpanded,
    isLoading,
    claudeStatus,
    connectionHealth,
    lastUpdateTime,
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
    setSelectedCommandIndex = () => {},
    messageQueue = [],
  }) => {
    useRenderCount('InputArea');
    useMemoryLeakDetector('InputArea');
    const {
      handleSubmit,
      handleInputChange,
      handleTextareaClick,
      handleTextareaInput,
      handleKeyDown,
      selectFile,
      selectCommand,
      handleClear,
      canSubmit,
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
      textareaExpanded,
      setTextareaExpanded,
      handleSubmit: parentHandleSubmit,
      handleInputChange: parentHandleInputChange,
      handleKeyDown: parentHandleKeyDown,
      selectCommand: parentSelectCommand,
      selectFile: parentSelectFile,
    });

    // Memoize expensive computations
    const hintTextDesktop = useMemo(() => {
      return isLoading
        ? `Messages will be queued while Claude is processing${messageQueue.length > 0 ? ` (${messageQueue.length} queued)` : ''} • @ to reference files • / for commands`
        : 'Press Enter to send • Shift+Enter for new line • @ to reference files • / for commands';
    }, [isLoading, messageQueue.length]);

    const hintTextMobile = useMemo(() => {
      return isLoading
        ? `Messages queued${messageQueue.length > 0 ? ` (${messageQueue.length})` : ''} • @ for files • / for commands`
        : 'Enter to send • @ for files • / for commands';
    }, [isLoading, messageQueue.length]);

    const showClearButton = useMemo(() => input.trim().length > 0, [input]);
    const showCommandMenuDropdown = useMemo(
      () => showCommandMenu && filteredCommands.length > 0,
      [showCommandMenu, filteredCommands.length],
    );
    const showFileDropdownMenu = useMemo(
      () => showFileDropdown && filteredFiles.length > 0,
      [showFileDropdown, filteredFiles.length],
    );

    return (
      <InputAreaContainer isInputFocused={isInputFocused}>
        {/* Claude Working Status - positioned above the input form */}
        <ClaudeStatus
          status={claudeStatus}
          isLoading={isLoading}
          onAbort={handleAbortSession}
          connectionHealth={connectionHealth}
          lastUpdateTime={lastUpdateTime}
        />

        <StyledForm onSubmit={handleSubmit}>
          <InputWrapper isExpanded={textareaExpanded}>
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
              disabled={false}
              rows={1}
            />

            {/* Clear button - shown when there's text */}
            {showClearButton && (
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
            {showCommandMenuDropdown && (
              <CommandMenuWrapper>
                <CommandMenu
                  commands={filteredCommands}
                  selectedIndex={selectedCommandIndex}
                  onSelectCommand={selectCommand}
                  position={{
                    bottom: 'auto',
                    left: 0,
                    right: 0,
                  }}
                />
              </CommandMenuWrapper>
            )}

            {/* File dropdown */}
            {showFileDropdownMenu && (
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
          <HintTextDesktop>{hintTextDesktop}</HintTextDesktop>
          <HintTextMobile isInputFocused={isInputFocused}>
            {hintTextMobile}
          </HintTextMobile>
        </StyledForm>
      </InputAreaContainer>
    );
  },
);

InputArea.displayName = 'InputArea';

export {InputArea};
