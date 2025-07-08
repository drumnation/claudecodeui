/*
 * ChatInterface.jsx - Chat Component with Session Protection Integration
 * 
 * SESSION PROTECTION INTEGRATION:
 * ===============================
 * 
 * This component integrates with the Session Protection System to prevent project updates
 * from interrupting active conversations:
 * 
 * Key Integration Points:
 * 1. handleSubmit() - Marks session as active when user sends message (including temp ID for new sessions)
 * 2. session-created handler - Replaces temporary session ID with real WebSocket session ID  
 * 3. claude-complete handler - Marks session as inactive when conversation finishes
 * 4. session-aborted handler - Marks session as inactive when conversation is aborted
 * 
 * This ensures uninterrupted chat experience by coordinating with App.jsx to pause sidebar updates.
 */

import { memo, useCallback } from 'react';
import { NoProjectSelected } from '@/features/chat/components/NoProjectSelected';
import MessagesArea from '@/features/chat/components/MessagesArea';
import { InputArea } from '@/features/chat/components/InputArea';
import { useChatInterface } from '@/features/chat/ChatInterface.hook';
import { 
  selectCommand as selectCommandLogic, 
  selectFile as selectFileLogic,
  handleKeyDown as handleKeyDownLogic,
  handleSubmit as handleSubmitLogic,
  handleAbortSession as handleAbortSessionLogic,
  handleInputChange as handleInputChangeLogic,
  handleTextareaClick as handleTextareaClickLogic
} from '@/features/chat/ChatInterface.logic';
import { ChatInterfaceContainer, ChatInterfaceStyles } from '@/features/chat/ChatInterface.styles';
import { ErrorBoundary } from '@/shared-components/ErrorBoundary';

export const ChatInterface = memo(({ 
  selectedProject, 
  selectedSession, 
  sendMessage, 
  messages, 
  onFileOpen, 
  onInputFocusChange, 
  onSessionActive, 
  onSessionInactive, 
  onReplaceTemporarySession, 
  onNavigateToSession, 
  onShowSettings, 
  autoExpandTools, 
  showRawParameters, 
  autoScrollToBottom 
}) => {
  const {
    // State
    input,
    setInput,
    chatMessages,
    setChatMessages,
    isLoading,
    setIsLoading,
    currentSessionId,
    isInputFocused,
    setIsInputFocused,
    isLoadingSessionMessages,
    isStreaming,
    isSessionTransitioning,
    textareaExpanded,
    setTextareaExpanded,
    showFileDropdown,
    setShowFileDropdown,
    filteredFiles,
    selectedFileIndex,
    setSelectedFileIndex,
    cursorPosition,
    setCursorPosition,
    atSymbolPosition,
    setAtSymbolPosition,
    canAbortSession,
    setCanAbortSession,
    isUserScrolledUp,
    showCommandMenu,
    setShowCommandMenu,
    filteredCommands,
    selectedCommandIndex,
    setSelectedCommandIndex,
    slashPosition,
    setSlashPosition,
    claudeStatus,
    setClaudeStatus,
    messageQueue,
    setMessageQueue,
    fileList,
    slashCommands,
    
    // Refs
    messagesEndRef,
    textareaRef,
    scrollContainerRef,
    
    // Memoized values
    createDiff,
    visibleMessages,
    
    // Callbacks
    scrollToBottom,
    handleTranscript
  } = useChatInterface({
    selectedProject,
    selectedSession,
    messages,
    sendMessage,
    onInputFocusChange,
    onSessionActive,
    onSessionInactive,
    onReplaceTemporarySession,
    onNavigateToSession,
    autoScrollToBottom
  });
  
  // Create callback wrappers for logic functions
  const selectCommand = useCallback((command) => {
    selectCommandLogic(
      command, 
      input, 
      slashPosition, 
      textareaRef, 
      setInput, 
      setShowCommandMenu, 
      setSlashPosition, 
      setCursorPosition
    );
  }, [input, slashPosition, setInput, setShowCommandMenu, setSlashPosition, setCursorPosition]);
  
  const selectFile = useCallback((file) => {
    selectFileLogic(
      file,
      input,
      atSymbolPosition,
      textareaRef,
      setInput,
      setShowFileDropdown,
      setAtSymbolPosition,
      setCursorPosition
    );
  }, [input, atSymbolPosition, setInput, setShowFileDropdown, setAtSymbolPosition, setCursorPosition]);
  
  const handleSubmit = useCallback((e) => {
    handleSubmitLogic(e, {
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
      setTextareaExpanded,
      messageQueue,
      setMessageQueue
    });
  }, [
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
    setTextareaExpanded,
    messageQueue,
    setMessageQueue
  ]);
  
  const handleKeyDown = useCallback((e) => {
    handleKeyDownLogic(e, {
      showCommandMenu,
      filteredCommands,
      selectedCommandIndex,
      setSelectedCommandIndex,
      selectCommandCallback: selectCommand,
      showFileDropdown,
      filteredFiles,
      selectedFileIndex,
      setSelectedFileIndex,
      selectFileCallback: selectFile,
      setShowCommandMenu,
      setShowFileDropdown,
      handleSubmit
    });
  }, [
    showCommandMenu,
    filteredCommands,
    selectedCommandIndex,
    setSelectedCommandIndex,
    selectCommand,
    showFileDropdown,
    filteredFiles,
    selectedFileIndex,
    setSelectedFileIndex,
    selectFile,
    setShowCommandMenu,
    setShowFileDropdown,
    handleSubmit
  ]);
  
  const handleAbortSession = useCallback(() => {
    handleAbortSessionLogic(currentSessionId, canAbortSession, sendMessage);
  }, [currentSessionId, canAbortSession, sendMessage]);
  
  const handleInputChange = useCallback((e) => {
    handleInputChangeLogic(e, setInput, setCursorPosition);
  }, [setInput, setCursorPosition]);
  
  const handleTextareaClick = useCallback((e) => {
    handleTextareaClickLogic(e, setCursorPosition);
  }, [setCursorPosition]);

  // Don't render if no project is selected
  if (!selectedProject) {
    return <NoProjectSelected />;
  }

  return (
    <ErrorBoundary level="component" showDetails={process.env.NODE_ENV === 'development'}>
      <ChatInterfaceStyles />
      <ChatInterfaceContainer>
        <MessagesArea 
          chatMessages={chatMessages}
          isLoadingSessionMessages={isLoadingSessionMessages}
          visibleMessages={visibleMessages}
          isUserScrolledUp={isUserScrolledUp}
          scrollToBottom={scrollToBottom}
          onFileOpen={onFileOpen}
          onShowSettings={onShowSettings}
          autoExpandTools={autoExpandTools}
          showRawParameters={showRawParameters}
          createDiff={createDiff}
          scrollContainerRef={scrollContainerRef}
          messagesEndRef={messagesEndRef}
          isStreaming={isStreaming}
          isSessionTransitioning={isSessionTransitioning}
        />

        <InputArea
          input={input}
          isInputFocused={isInputFocused}
          setIsInputFocused={setIsInputFocused}
          textareaExpanded={textareaExpanded}
          setTextareaExpanded={setTextareaExpanded}
          isLoading={isLoading}
          claudeStatus={claudeStatus}
          showCommandMenu={showCommandMenu}
          filteredCommands={filteredCommands}
          showFileDropdown={showFileDropdown}
          filteredFiles={filteredFiles}
          selectedFileIndex={selectedFileIndex}
          selectedCommandIndex={selectedCommandIndex}
          textareaRef={textareaRef}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          handleTextareaClick={handleTextareaClick}
          handleKeyDown={handleKeyDown}
          handleTranscript={handleTranscript}
          handleAbortSession={handleAbortSession}
          selectCommand={selectCommand}
          selectFile={selectFile}
          setInput={setInput}
          setCursorPosition={setCursorPosition}
          // Additional props needed by refactored component
          fileList={fileList}
          slashCommands={slashCommands}
          cursorPosition={cursorPosition}
          atSymbolPosition={atSymbolPosition}
          setAtSymbolPosition={setAtSymbolPosition}
          slashPosition={slashPosition}
          setSlashPosition={setSlashPosition}
          setShowFileDropdown={setShowFileDropdown}
          setShowCommandMenu={setShowCommandMenu}
          setSelectedFileIndex={setSelectedFileIndex}
          setSelectedCommandIndex={setSelectedCommandIndex}
          messageQueue={messageQueue}
        />
      </ChatInterfaceContainer>
    </ErrorBoundary>
  );
});