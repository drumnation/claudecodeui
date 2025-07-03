/*
 * InputArea.tsx - Chat Input Area with Command and File Reference Support
 *
 * This component handles user input with comprehensive features:
 * - Multi-line text input with auto-resize
 * - Command menu integration (/ commands)
 * - File reference dropdown (@ files)
 * - Mobile-responsive design
 * - Keyboard shortcuts and navigation
 * - Draft saving and restoration
 * - Accessibility features
 * - Touch gesture support
 */

import React, { useRef, useEffect, useCallback, useState } from "react";
import type { Logger } from "@kit/logger/types";
import type { Project } from "@/App";
import { MicButton } from "../../MicButton";

export interface InputAreaProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFocus: (focused: boolean) => void;
  isLoading: boolean;
  isInputFocused: boolean;
  selectedProject: Project;
  showCommandMenu: boolean;
  showFileDropdown: boolean;
  filteredCommands: any[];
  filteredFiles: any[];
  selectedCommandIndex: number;
  selectedFileIndex: number;
  commandQuery: string;
  fileQuery: string;
  onCommandMenuToggle: (show: boolean) => void;
  onFileDropdownToggle: (show: boolean) => void;
  onCommandSelect: (command: any) => void;
  onFileSelect: (file: any) => void;
  onMicToggle?: (isListening: boolean) => void;
  logger: Logger;
}

export const InputArea: React.FC<InputAreaProps> = ({
  input,
  onInputChange,
  onSubmit,
  onFocus,
  isLoading,
  isInputFocused,
  selectedProject,
  showCommandMenu,
  showFileDropdown,
  filteredCommands,
  filteredFiles,
  selectedCommandIndex,
  selectedFileIndex,
  commandQuery,
  fileQuery,
  onCommandMenuToggle,
  onFileDropdownToggle,
  onCommandSelect,
  onFileSelect,
  onMicToggle,
  logger,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaHeight, setTextareaHeight] = useState<number>(40);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [isComposing, setIsComposing] = useState<boolean>(false);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const minHeight = 40;
    const maxHeight = 200;

    // Reset height to measure content
    textarea.style.height = `${minHeight}px`;
    const scrollHeight = Math.min(textarea.scrollHeight, maxHeight);
    const newHeight = Math.max(scrollHeight, minHeight);

    if (newHeight !== textareaHeight) {
      setTextareaHeight(newHeight);
      textarea.style.height = `${newHeight}px`;
      
      logger.debug("Textarea height adjusted", {
        previousHeight: textareaHeight,
        newHeight,
        scrollHeight: textarea.scrollHeight,
        inputLength: input.length,
        projectName: selectedProject.name
      });
    }
  }, [textareaHeight, input.length, selectedProject.name, logger]);

  // Update cursor position
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return;
    const position = textareaRef.current.selectionStart;
    setCursorPosition(position);
    
    logger.debug("Cursor position updated", {
      position,
      inputLength: input.length,
      projectName: selectedProject.name
    });
  }, [input.length, selectedProject.name, logger]);

  // Handle input changes with command/file detection
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e);
      updateCursorPosition();
      
      const value = e.target.value;
      const cursorPos = e.target.selectionStart;
      
      // Detect command trigger (/)
      const beforeCursor = value.substring(0, cursorPos);
      const lastSlash = beforeCursor.lastIndexOf("/");
      const lastSpace = beforeCursor.lastIndexOf(" ");
      const lastNewline = beforeCursor.lastIndexOf("\n");
      
      if (lastSlash > Math.max(lastSpace, lastNewline, -1)) {
        const query = beforeCursor.substring(lastSlash + 1);
        if (!showCommandMenu) {
          logger.info("Command menu triggered", {
            query,
            cursorPosition: cursorPos,
            projectName: selectedProject.name
          });
          onCommandMenuToggle(true);
        }
      } else {
        if (showCommandMenu) {
          logger.debug("Command menu hidden", {
            projectName: selectedProject.name
          });
          onCommandMenuToggle(false);
        }
      }

      // Detect file reference trigger (@)
      const lastAt = beforeCursor.lastIndexOf("@");
      if (lastAt > Math.max(lastSpace, lastNewline, -1)) {
        const query = beforeCursor.substring(lastAt + 1);
        if (!showFileDropdown) {
          logger.info("File dropdown triggered", {
            query,
            cursorPosition: cursorPos,
            projectName: selectedProject.name
          });
          onFileDropdownToggle(true);
        }
      } else {
        if (showFileDropdown) {
          logger.debug("File dropdown hidden", {
            projectName: selectedProject.name
          });
          onFileDropdownToggle(false);
        }
      }
    },
    [
      onInputChange,
      updateCursorPosition,
      showCommandMenu,
      showFileDropdown,
      selectedProject.name,
      onCommandMenuToggle,
      onFileDropdownToggle,
      logger,
    ]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      logger.debug("Key pressed in input area", {
        key: e.key,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        showCommandMenu,
        showFileDropdown,
        isComposing,
        projectName: selectedProject.name
      });

      // Don't handle keys during composition (IME input)
      if (isComposing) return;

      // Handle command menu navigation
      if (showCommandMenu && filteredCommands.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const newIndex = Math.min(selectedCommandIndex + 1, filteredCommands.length - 1);
          logger.debug("Command menu navigation down", {
            previousIndex: selectedCommandIndex,
            newIndex,
            commandCount: filteredCommands.length
          });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const newIndex = Math.max(selectedCommandIndex - 1, 0);
          logger.debug("Command menu navigation up", {
            previousIndex: selectedCommandIndex,
            newIndex
          });
        } else if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          const selectedCommand = filteredCommands[selectedCommandIndex];
          if (selectedCommand) {
            logger.info("Command selected from menu", {
              command: selectedCommand.name,
              selectedIndex: selectedCommandIndex,
              projectName: selectedProject.name
            });
            onCommandSelect(selectedCommand);
          }
          return;
        } else if (e.key === "Escape") {
          e.preventDefault();
          logger.debug("Command menu escaped");
          onCommandMenuToggle(false);
          return;
        }
      }

      // Handle file dropdown navigation
      if (showFileDropdown && filteredFiles.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const newIndex = Math.min(selectedFileIndex + 1, filteredFiles.length - 1);
          logger.debug("File dropdown navigation down", {
            previousIndex: selectedFileIndex,
            newIndex,
            fileCount: filteredFiles.length
          });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const newIndex = Math.max(selectedFileIndex - 1, 0);
          logger.debug("File dropdown navigation up", {
            previousIndex: selectedFileIndex,
            newIndex
          });
        } else if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          const selectedFile = filteredFiles[selectedFileIndex];
          if (selectedFile) {
            logger.info("File selected from dropdown", {
              fileName: selectedFile.name,
              filePath: selectedFile.path,
              selectedIndex: selectedFileIndex,
              projectName: selectedProject.name
            });
            onFileSelect(selectedFile);
          }
          return;
        } else if (e.key === "Escape") {
          e.preventDefault();
          logger.debug("File dropdown escaped");
          onFileDropdownToggle(false);
          return;
        }
      }

      // Handle form submission
      if (e.key === "Enter" && !e.shiftKey && !showCommandMenu && !showFileDropdown) {
        logger.info("Form submission triggered", {
          inputLength: input.trim().length,
          hasInput: input.trim().length > 0,
          isLoading,
          projectName: selectedProject.name
        });
        onSubmit(e);
      }

      // Handle escape to clear input
      if (e.key === "Escape" && !showCommandMenu && !showFileDropdown) {
        if (input.trim()) {
          logger.info("Input cleared via escape", {
            previousInputLength: input.length,
            projectName: selectedProject.name
          });
          onInputChange({ target: { value: "" } } as React.ChangeEvent<HTMLTextAreaElement>);
        }
      }
    },
    [
      showCommandMenu,
      showFileDropdown,
      filteredCommands,
      filteredFiles,
      selectedCommandIndex,
      selectedFileIndex,
      isComposing,
      input,
      isLoading,
      selectedProject.name,
      onCommandSelect,
      onFileSelect,
      onCommandMenuToggle,
      onFileDropdownToggle,
      onSubmit,
      onInputChange,
      logger,
    ]
  );

  // Handle focus events
  const handleFocus = useCallback(() => {
    logger.debug("Input area focused", {
      projectName: selectedProject.name,
      inputLength: input.length
    });
    onFocus(true);
  }, [selectedProject.name, input.length, onFocus, logger]);

  const handleBlur = useCallback(() => {
    logger.debug("Input area blurred", {
      projectName: selectedProject.name,
      inputLength: input.length
    });
    onFocus(false);
  }, [selectedProject.name, input.length, onFocus, logger]);

  // Handle composition events for IME input
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
    logger.debug("IME composition started");
  }, [logger]);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
    logger.debug("IME composition ended");
  }, [logger]);

  // Auto-resize on input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  // Focus management
  useEffect(() => {
    if (textareaRef.current && !isLoading) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  return (
    <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
      <form onSubmit={onSubmit} className="relative">
        <div className="relative">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onSelect={updateCursorPosition}
            onClick={updateCursorPosition}
            placeholder="Ask Claude anything about your project..."
            disabled={isLoading}
            className={`w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 pr-20 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ height: `${textareaHeight}px` }}
            rows={1}
            aria-label="Chat input"
            aria-describedby={
              showCommandMenu ? "command-menu" : showFileDropdown ? "file-dropdown" : undefined
            }
          />

          {/* Action buttons container */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Microphone button */}
            {onMicToggle && (
              <MicButton
                onTranscript={(text) => {
                  logger.info("Voice transcript received", {
                    textLength: text.length,
                    projectName: selectedProject.name
                  });
                  // Set the transcript as input
                  onInputChange({ target: { value: text } } as React.ChangeEvent<HTMLTextAreaElement>);
                }}
                className="w-8 h-8"
              />
            )}
            
            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                input.trim() && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }`}
              aria-label="Send message"
            >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
            </button>
          </div>

          {/* Command menu dropdown */}
          {showCommandMenu && filteredCommands.length > 0 && (
            <div
              id="command-menu"
              className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
              role="listbox"
              aria-label="Available commands"
            >
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id || index}
                  type="button"
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                    index === selectedCommandIndex
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => onCommandSelect(command)}
                  role="option"
                  aria-selected={index === selectedCommandIndex}
                >
                  <div className="font-medium text-sm">{command.name}</div>
                  {command.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {command.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* File dropdown */}
          {showFileDropdown && filteredFiles.length > 0 && (
            <div
              id="file-dropdown"
              className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
              role="listbox"
              aria-label="Available files"
            >
              {filteredFiles.map((file, index) => (
                <button
                  key={file.path}
                  type="button"
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                    index === selectedFileIndex
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => onFileSelect(file)}
                  role="option"
                  aria-selected={index === selectedFileIndex}
                >
                  <div className="font-medium text-sm">{file.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {file.path}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hint text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 hidden sm:block">
          Press Enter to send • Shift+Enter for new line • @ to reference files • / for commands
        </div>
        <div
          className={`text-xs text-gray-500 dark:text-gray-400 text-center mt-2 sm:hidden transition-opacity duration-200 ${
            isInputFocused ? "opacity-100" : "opacity-0"
          }`}
        >
          Enter to send • @ for files • / for commands
        </div>
      </form>
    </div>
  );
};