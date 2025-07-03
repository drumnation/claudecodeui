/*
 * ChatInterface.tsx - Enhanced Chat Component with Session Protection Integration
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
 *
 * ARCHITECTURAL IMPROVEMENTS:
 * ==========================
 * 
 * - Enhanced with comprehensive logging using @kit/logger/react
 * - Modularized into smaller sub-components for better maintainability
 * - Session protection system integration with detailed monitoring
 * - WebSocket message processing with detailed logging
 * - Tool use visualization with interaction tracking
 * - Mobile touch interactions and gesture tracking
 * - Auto-scroll functionality with behavior logging
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import { useLogger } from "@kit/logger/react";
import type { Logger } from "@kit/logger/types";
import { useChatSession } from "../../hooks/useChatSession";
import { MessageComponent } from "./components/MessageComponent";
import { InputArea } from "./components/InputArea";
import { ToolDisplay } from "./components/ToolDisplay";
import { TodoList } from "@/components/molecules";
import { CommandMenu } from "@/components/molecules";
import { ClaudeLogo } from "../ClaudeLogo";
import { ClaudeStatus, type ClaudeStatusData } from "../ClaudeStatus";
import type { Project, Session } from "@/App";
import type { WSMessage } from "@/utils/websocket";
import { TestToolButton } from "../TestToolButton";

// Chat message types
export interface ChatMessage {
  type: "user" | "assistant" | "tool_use" | "tool_result" | "error";
  content: any;
  isToolUse?: boolean;
  isInteractivePrompt?: boolean;
  timestamp?: string | number | Date;
  id?: string;
  tool_name?: string;
  toolName?: string; // Alternative property name used in some places
  toolId?: string;
  tool_input?: any;
  toolInput?: any; // Alternative property name
  tool_result?: any;
  toolResult?: any; // Alternative property name
  toolError?: boolean;
  toolResultTimestamp?: string | number | Date;
  inline?: boolean;
}

export interface ChatInterfaceProps {
  selectedProject: Project | null;
  selectedSession: Session | null;
  ws: WebSocket | null;
  sendMessage: (message: WSMessage) => void;
  messages: WSMessage[];
  onFileOpen: (
    filePath: string,
    diffOptions?: { old_string: string; new_string: string },
  ) => void;
  onInputFocusChange: (focused: boolean) => void;
  onSessionActive: (sessionId: string) => void;
  onSessionInactive: (sessionId: string) => void;
  onReplaceTemporarySession: (realSessionId: string) => void;
  onNavigateToSession: (sessionId: string) => void;
  onShowSettings: () => void;
  autoExpandTools: boolean;
  showRawParameters: boolean;
  autoScrollToBottom: boolean;
}

// ChatInterface: Enhanced main chat component with Session Protection System integration
//
// Session Protection System prevents automatic project updates from interrupting active conversations:
// - onSessionActive: Called when user sends message to mark session as protected
// - onSessionInactive: Called when conversation completes/aborts to re-enable updates
// - onReplaceTemporarySession: Called to replace temporary session ID with real WebSocket session ID
//
// This ensures uninterrupted chat experience by pausing sidebar refreshes during conversations.
function ChatInterface({
  selectedProject,
  selectedSession,
  ws,
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
  autoScrollToBottom,
}: ChatInterfaceProps) {
  const logger: Logger = useLogger({ 
    component: "ChatInterface",
    scope: "features/chat"
  });

  // State management with comprehensive logging
  const [input, setInput] = useState<string>(() => {
    if (typeof window !== "undefined" && selectedProject) {
      const savedInput = localStorage.getItem(`draft_input_${selectedProject.name}`) ?? "";
      logger.debug("Restored draft input from localStorage", {
        projectName: selectedProject.name,
        inputLength: savedInput.length,
        hasInput: savedInput.length > 0
      });
      return savedInput;
    }
    return "";
  });

  // Use the proper chat session hook for message management
  const {
    chatMessages,
    isLoading: chatIsLoading,
    sendUserMessage,
    handleIncomingMessage
  } = useChatSession({
    selectedProject,
    selectedSession,
    ws,
    sendMessage,
    messages,
    sessionProtection: {
      onSessionActive,
      onSessionInactive,
      onReplaceTemporarySession
    },
    config: {
      autoExpandTools,
      showRawParameters,
      autoScrollToBottom
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Use chat hook's loading state when available
  const effectiveIsLoading = chatIsLoading || isLoading;
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    selectedSession?.id || null,
  );
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [todoMessages, setTodoMessages] = useState<Array<{ id: string; content: string; project: string; session: string; timestamp: string; }>>([]);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState<boolean>(true);
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);
  const [showCommandMenu, setShowCommandMenu] = useState<boolean>(false);
  const [showFileDropdown, setShowFileDropdown] = useState<boolean>(false);
  const [filteredCommands, setFilteredCommands] = useState<any[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState<number>(0);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [commandQuery, setCommandQuery] = useState<string>("");
  const [fileQuery, setFileQuery] = useState<string>("");

  // Refs for DOM manipulation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Session protection logging
  useEffect(() => {
    logger.info("ChatInterface mounted with session protection", {
      hasProject: !!selectedProject,
      hasSession: !!selectedSession,
      hasWebSocket: !!ws,
      messageCount: messages.length,
      projectName: selectedProject?.name,
      sessionId: selectedSession?.id,
      sessionProtectionActive: currentSessionId !== null,
      autoExpandTools,
      showRawParameters,
      autoScrollToBottom
    });
  }, [selectedProject, selectedSession, ws, messages.length, currentSessionId, autoExpandTools, showRawParameters, autoScrollToBottom]);

  // Session change logging
  useEffect(() => {
    if (selectedSession?.id !== currentSessionId) {
      logger.info("Session changed", {
        previousSessionId: currentSessionId,
        newSessionId: selectedSession?.id,
        projectName: selectedProject?.name,
        messageCount: messages.length
      });
      setCurrentSessionId(selectedSession?.id || null);
    }
  }, [selectedSession, currentSessionId, selectedProject, messages.length]);

  // The useChatSession hook now handles all message processing

  // Auto-scroll functionality with behavior logging
  useEffect(() => {
    if (!autoScrollToBottom || !messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const shouldAutoScroll = isScrolledToBottom && !isUserScrollingRef.current;

    if (shouldAutoScroll) {
      logger.debug("Auto-scrolling to bottom", {
        sessionId: currentSessionId,
        messageCount: chatMessages.length,
        containerHeight: container.scrollHeight,
        scrollTop: container.scrollTop
      });
      
      container.scrollTop = container.scrollHeight;
      setIsScrolledToBottom(true);
    }
  }, [chatMessages, autoScrollToBottom, isScrolledToBottom, currentSessionId]);

  // Scroll behavior monitoring
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    logger.debug("Scroll behavior detected", {
      scrollTop,
      scrollHeight,
      clientHeight,
      isAtBottom,
      wasAtBottom: isScrolledToBottom,
      sessionId: currentSessionId
    });

    setIsScrolledToBottom(isAtBottom);
    setLastScrollTop(scrollTop);

    // Detect user scrolling
    if (Math.abs(scrollTop - lastScrollTop) > 5) {
      isUserScrollingRef.current = true;
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
        logger.debug("User scrolling timeout expired", {
          sessionId: currentSessionId,
          isAtBottom: isScrolledToBottom
        });
      }, 1000);
    }
  }, [lastScrollTop, isScrolledToBottom, currentSessionId]);

  // Input focus change with logging
  const handleInputFocus = useCallback((focused: boolean) => {
    logger.debug("Input focus changed", {
      focused,
      sessionId: currentSessionId,
      projectName: selectedProject?.name,
      inputLength: input.length
    });
    setIsInputFocused(focused);
    onInputFocusChange(focused);
  }, [input.length, currentSessionId, selectedProject, onInputFocusChange]);

  // Message submission with session protection
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || effectiveIsLoading || !selectedProject) return;

    const messageContent = input.trim();
    logger.info("Submitting message via chat session hook", {
      messageLength: messageContent.length,
      projectName: selectedProject.name,
      hasWebSocket: !!ws
    });

    // Clear input and draft
    setInput("");
    localStorage.removeItem(`draft_input_${selectedProject.name}`);

    // Use the hook's sendUserMessage method which handles session protection
    sendUserMessage(messageContent);

    // Auto-scroll after sending
    if (autoScrollToBottom) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          logger.debug("Auto-scrolled after message send");
        }
      }, 100);
    }
  }, [input, effectiveIsLoading, selectedProject, ws, sendUserMessage, autoScrollToBottom]);

  // Input change with draft saving
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    
    // Save draft to localStorage
    if (selectedProject) {
      if (newInput.trim()) {
        localStorage.setItem(`draft_input_${selectedProject.name}`, newInput);
      } else {
        localStorage.removeItem(`draft_input_${selectedProject.name}`);
      }
    }

    logger.debug("Input changed", {
      inputLength: newInput.length,
      hasDraft: newInput.trim().length > 0,
      projectName: selectedProject?.name
    });
  }, [selectedProject]);

  // Create diff function for tool use visualization
  const createDiff = useCallback((oldStr: string, newStr: string) => {
    logger.debug("Creating diff for tool use visualization", {
      oldLength: oldStr.length,
      newLength: newStr.length,
      sessionId: currentSessionId
    });
    
    // This would typically use a diff library, but for now returning a simple structure
    return [
      { type: "unchanged" as const, content: oldStr, lineNum: 1 },
      { type: "added" as const, content: newStr, lineNum: 2 }
    ];
  }, [currentSessionId]);

  // Render loading state
  if (!selectedProject) {
    logger.debug("Rendering no project selected state");
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No Project Selected
          </h2>
          <p className="text-gray-500 dark:text-gray-500">
            Select a project from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  // Reduce render logging frequency for performance
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && chatMessages.length > 50) {
      // Only log every 10th render for large sessions
      renderCount.current++;
      if (renderCount.current % 10 === 0) {
        logger.debug("ChatInterface render (reduced frequency)", {
          messageCount: chatMessages.length,
          sessionId: currentSessionId,
          renderNumber: renderCount.current
        });
      }
    }
  }, [chatMessages.length, currentSessionId]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <ClaudeLogo className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedProject.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedSession?.name || "New Chat"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ClaudeStatus 
              data={{
                status: isLoading ? "thinking" : "ready",
                messageCount: chatMessages.length,
                sessionId: currentSessionId
              } as ClaudeStatusData}
            />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        onScroll={handleScroll}
      >
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ClaudeLogo className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Ask Claude anything about your project
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message, index) => (
              <MessageComponent
                key={message.id || index}
                message={message}
                index={index}
                prevMessage={index > 0 ? chatMessages[index - 1] : null}
                createDiff={createDiff}
                onFileOpen={onFileOpen}
                onShowSettings={onShowSettings}
                autoExpandTools={autoExpandTools}
                showRawParameters={showRawParameters}
                logger={logger}
              />
            ))}
            
            {/* Tool displays */}
            {chatMessages.some(msg => msg.isToolUse === true) && (
              <ToolDisplay
                messages={chatMessages}
                onFileOpen={onFileOpen}
                showRawParameters={showRawParameters}
                logger={logger}
              />
            )}
          </>
        )}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* TODO List */}
      {todoMessages.length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
          <TodoList 
            todos={todoMessages}
            onToggle={(id) => {
              logger.info("TODO item toggled", {
                todoId: id,
                sessionId: currentSessionId,
                projectName: selectedProject.name
              });
            }}
            onDelete={(id) => {
              logger.info("TODO item deleted", {
                todoId: id,
                sessionId: currentSessionId,
                projectName: selectedProject.name
              });
              setTodoMessages(prev => prev.filter(todo => todo.id !== id));
            }}
          />
        </div>
      )}

      {/* Test Tool Button - TEMPORARY FOR DEBUGGING */}
      {process.env.NODE_ENV === 'development' && (
        <TestToolButton 
          onAddTestMessage={(message) => {
            logger.info('Adding test tool message', { message });
            handleIncomingMessage(message);
          }}
        />
      )}

      {/* Input Area */}
      <InputArea
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onFocus={handleInputFocus}
        isLoading={effectiveIsLoading}
        isInputFocused={isInputFocused}
        selectedProject={selectedProject}
        showCommandMenu={showCommandMenu}
        showFileDropdown={showFileDropdown}
        filteredCommands={filteredCommands}
        filteredFiles={filteredFiles}
        selectedCommandIndex={selectedCommandIndex}
        selectedFileIndex={selectedFileIndex}
        commandQuery={commandQuery}
        fileQuery={fileQuery}
        onCommandMenuToggle={setShowCommandMenu}
        onFileDropdownToggle={setShowFileDropdown}
        onCommandSelect={(command) => {
          logger.info("Command selected", {
            command: command.name,
            sessionId: currentSessionId,
            projectName: selectedProject.name
          });
          setShowCommandMenu(false);
          // Handle command selection
        }}
        onFileSelect={(file) => {
          logger.info("File selected for reference", {
            fileName: file.name,
            filePath: file.path,
            sessionId: currentSessionId,
            projectName: selectedProject.name
          });
          setShowFileDropdown(false);
          // Handle file selection
        }}
        onMicToggle={(isListening) => {
          logger.info("Microphone toggled", {
            isListening,
            sessionId: currentSessionId,
            projectName: selectedProject?.name
          });
        }}
        logger={logger}
      />

      {/* Command Menu */}
      {showCommandMenu && filteredCommands.length > 0 && (
        <CommandMenu
          commands={filteredCommands}
          selectedIndex={selectedCommandIndex}
          onSelectCommand={(command) => {
            logger.info("Command menu selection", {
              command: command.name,
              sessionId: currentSessionId
            });
            setShowCommandMenu(false);
          }}
          position={{ x: 0, y: 0 }}
        />
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Claude is thinking...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ChatInterface);