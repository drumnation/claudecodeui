/*
 * MessageComponent.tsx - Individual Message Rendering with Tool Use Visualization
 *
 * This component handles the rendering of individual chat messages with comprehensive logging
 * and tool use visualization. It includes:
 * - User and assistant message rendering
 * - Tool use message display with parameter visualization
 * - Interactive prompt handling
 * - Error message rendering
 * - Diff highlighting for tool results
 * - Mobile responsiveness
 * - Accessibility features
 */

import React, { useRef, useState, useEffect, memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Logger } from "@kit/logger/types";
import { ClaudeLogo } from "../../ClaudeLogo";
import type { ChatMessage } from "../ChatInterface";

export interface MessageComponentProps {
  message: ChatMessage;
  index: number;
  prevMessage: ChatMessage | null;
  createDiff: (
    oldStr: string,
    newStr: string,
  ) => Array<{
    type: "added" | "removed" | "unchanged";
    content: string;
    lineNum: number;
  }>;
  onFileOpen: (
    filePath: string,
    diffOptions?: { old_string: string; new_string: string },
  ) => void;
  onShowSettings: () => void;
  autoExpandTools: boolean;
  showRawParameters: boolean;
  logger: Logger;
}

// Helper function to render image content
const renderImageContent = (content: any): React.ReactNode => {
  if (!content) return null;
  
  // Handle structured image object format
  if (content.type === 'image' && content.source) {
    const { source } = content;
    if (source.type === 'base64' && source.media_type && source.data) {
      const imageUrl = `data:${source.media_type};base64,${source.data}`;
      return (
        <div className="my-2">
          <img
            src={imageUrl}
            alt="Image content"
            className="max-w-full h-auto rounded border border-gray-300 dark:border-gray-600"
            style={{ maxHeight: '600px' }}
          />
        </div>
      );
    }
  }
  
  // Handle direct base64 URL format
  if (typeof content === 'string' && content.includes('data:image/') && content.includes('base64,')) {
    return (
      <div className="my-2">
        <img
          src={content}
          alt="Image content"
          className="max-w-full h-auto rounded border border-gray-300 dark:border-gray-600"
          style={{ maxHeight: '600px' }}
        />
      </div>
    );
  }
  
  return null;
};

// Helper function to extract images from content
const extractImagesFromContent = (content: any): React.ReactNode[] => {
  const images: React.ReactNode[] = [];
  
  if (!content) return images;
  
  // If content is an array, check each item for images
  if (Array.isArray(content)) {
    content.forEach((item, idx) => {
      const img = renderImageContent(item);
      if (img) {
        images.push(<div key={`img-${idx}`}>{img}</div>);
      }
    });
  } else if (typeof content === 'object') {
    // Check if the content itself is an image
    const img = renderImageContent(content);
    if (img) {
      images.push(<div key="img-0">{img}</div>);
    }
    
    // Check nested content
    if (content.content) {
      const nestedImages = extractImagesFromContent(content.content);
      images.push(...nestedImages);
    }
  }
  
  return images;
};

// Memoized message component to prevent unnecessary re-renders
// Helper function to safely extract content string from message
const extractMessageContent = (content: any): string => {
  // Handle null/undefined early
  if (content === null || content === undefined) {
    return "";
  }

  // Handle string content directly
  if (typeof content === "string") {
    return content;
  }

  // Handle primitive types
  if (typeof content === "number" || typeof content === "boolean") {
    return String(content);
  }

  // Handle objects with comprehensive error handling
  if (content && typeof content === "object") {
    try {
      // Handle objects with nested content (e.g., {role: "user", content: "..."})
      if (content.hasOwnProperty("content") && content.content !== undefined) {
        // Recursively extract if content is also an object
        return extractMessageContent(content.content);
      }
      
      // Handle objects with text property
      if (content.hasOwnProperty("text") && content.text !== undefined) {
        return String(content.text);
      }
      
      // Handle objects with message property (WebSocket message wrapper)
      if (content.hasOwnProperty("message") && content.message !== undefined) {
        return extractMessageContent(content.message);
      }
      
      // Handle objects with data property
      if (content.hasOwnProperty("data") && content.data !== undefined) {
        return extractMessageContent(content.data);
      }
      
      // Handle array of content objects
      if (Array.isArray(content)) {
        try {
          // Extract only text content from array, skip images and tool uses
          const textParts = content
            .filter(item => item && typeof item === 'object' && item.type === 'text')
            .map(item => item.text || '')
            .filter(str => str && str.length > 0);
          
          if (textParts.length > 0) {
            return textParts.join('\n');
          }
          
          // If no text parts, return empty string
          return '';
        } catch (arrayError) {
          console.warn('MessageComponent: Error processing array content:', arrayError);
          return '';
        }
      }
      
      // Handle Claude API response format with role/content structure
      if (content.hasOwnProperty("role") && content.hasOwnProperty("content")) {
        return extractMessageContent(content.content);
      }
      
      // Handle tool use content that might have nested structure
      if (content.hasOwnProperty("type") && content.type === "text" && content.hasOwnProperty("text")) {
        return String(content.text);
      }

      // Handle common message formats from WebSocket
      if (content.hasOwnProperty("payload") && content.payload !== undefined) {
        return extractMessageContent(content.payload);
      }

      // Handle streaming message formats
      if (content.hasOwnProperty("delta") && content.delta !== undefined) {
        return extractMessageContent(content.delta);
      }

      // Handle nested message formats
      if (content.hasOwnProperty("choices") && Array.isArray(content.choices) && content.choices.length > 0) {
        return extractMessageContent(content.choices[0]);
      }

      // Handle OpenAI-style response format
      if (content.hasOwnProperty("message") && content.message?.hasOwnProperty("content")) {
        return extractMessageContent(content.message.content);
      }
      
      // Handle tool use messages specifically
      if (content.hasOwnProperty("type") && content.type === "tool_use") {
        // Tool messages should have empty content
        return "";
      }
      
      // Handle tool input/output that might be objects
      if (content.hasOwnProperty("input") || content.hasOwnProperty("output")) {
        // Tool data should not be displayed as message content
        return "";
      }
      
      // Fallback to JSON string representation for debugging
      console.warn('MessageComponent: Unhandled content structure, using JSON fallback:', {
        contentType: typeof content,
        contentKeys: content ? Object.keys(content) : [],
        content: content,
        isArray: Array.isArray(content),
        contentStringified: JSON.stringify(content, null, 2)
      });
      
      try {
        return JSON.stringify(content, null, 2);
      } catch (jsonError) {
        console.error('MessageComponent: Error stringifying content:', jsonError);
        return String(content);
      }
    } catch (error) {
      console.error('MessageComponent: Error processing object content:', error, {
        content,
        contentType: typeof content,
        isArray: Array.isArray(content)
      });
      return String(content);
    }
  }
  
  // Final fallback - attempt to convert to string safely
  try {
    return String(content);
  } catch (error) {
    console.error('MessageComponent: Critical error converting content to string:', error);
    return "[Invalid content]";
  }
};

export const MessageComponent = memo(
  ({
    message,
    index,
    prevMessage,
    createDiff,
    onFileOpen,
    onShowSettings,
    autoExpandTools,
    showRawParameters,
    logger,
  }: MessageComponentProps) => {
    const isGrouped =
      prevMessage &&
      prevMessage.type === message.type &&
      prevMessage.type === "assistant" &&
      !prevMessage.isToolUse &&
      !message.isToolUse;

    const messageRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand tool use messages when they come into view
    useEffect(() => {
      if (!autoExpandTools || !messageRef.current || !message.isToolUse) return;

      logger.debug("Setting up auto-expand observer for tool use message", {
        messageIndex: index,
        messageId: message.id,
        toolName: message.tool_name || message.toolName,
        autoExpandTools
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isExpanded) {
              logger.info("Auto-expanding tool use message", {
                messageIndex: index,
                messageId: message.id,
                toolName: message.tool_name || message.toolName,
                intersectionRatio: entry.intersectionRatio
              });
              
              setIsExpanded(true);
              // Find all details elements and open them
              if (messageRef.current) {
                const details = messageRef.current.querySelectorAll("details");
                details.forEach((detail: HTMLDetailsElement) => {
                  detail.open = true;
                });
                
                logger.debug("Opened tool detail sections", {
                  messageIndex: index,
                  detailsCount: details.length,
                  toolName: message.tool_name || message.toolName
                });
              }
            }
          });
        },
        { threshold: 0.1 },
      );

      observer.observe(messageRef.current);

      return () => {
        if (messageRef.current) {
          observer.unobserve(messageRef.current);
        }
      };
    }, [autoExpandTools, isExpanded, message.isToolUse, message.tool_name, message.toolName, message.id, index, logger]);

    // Only log on debug level when needed (removed excessive render logging)

    // Parse tool input safely
    const parseToolInput = (toolInput: any) => {
      if (typeof toolInput === 'string') {
        try {
          return JSON.parse(toolInput);
        } catch {
          return null;
        }
      }
      return toolInput;
    };

    // Handle tool use message rendering with enhanced functionality from old version
    const renderToolUseMessage = () => {
      if (!message.isToolUse) return null;

      const toolName = message.tool_name || message.toolName || "Unknown Tool";
      const rawToolInput = message.tool_input || message.toolInput;
      const toolInput = parseToolInput(rawToolInput);
      const toolResult = message.tool_result || message.toolResult;
      const hasError = message.toolError;

      logger.debug("Rendering tool use message", {
        messageIndex: index,
        toolName,
        hasInput: !!toolInput,
        hasResult: !!toolResult,
        hasError,
        showRawParameters
      });

      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {toolName}
              </span>
              {toolInput?.toolId && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                  ({toolInput.toolId})
                </span>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              aria-label={isExpanded ? "Collapse tool details" : "Expand tool details"}
            >
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
            </button>
          </div>

          {/* Special handling for different tool types */}
          {(() => {
            // Handle Edit tool with inline diff
            if (toolName === 'Edit' && toolInput?.file_path && toolInput?.old_string && toolInput?.new_string) {
              return (
                <details className="mt-2" open={isExpanded || autoExpandTools}>
                  <summary className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 transition-transform details-chevron"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    ✏️ Editing file:
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onFileOpen(toolInput.file_path, {
                          old_string: toolInput.old_string,
                          new_string: toolInput.new_string,
                        });
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-mono"
                    >
                      {toolInput.file_path.split('/').pop()}
                    </button>
                  </summary>
                  <div className="mt-3">
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() =>
                            onFileOpen(toolInput.file_path, {
                              old_string: toolInput.old_string,
                              new_string: toolInput.new_string,
                            })
                          }
                          className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate underline cursor-pointer"
                        >
                          {toolInput.file_path}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {createDiff(toolInput.old_string, toolInput.new_string).filter(d => d.type !== 'unchanged').length} changes
                        </span>
                      </div>
                      <div className="text-xs font-mono">
                        {createDiff(toolInput.old_string, toolInput.new_string).map(
                          (diffLine, i) => (
                            <div key={i} className="flex">
                              <span
                                className={`w-8 text-center border-r ${
                                  diffLine.type === 'removed'
                                    ? 'bg-red-200/50 dark:bg-red-800/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                                    : diffLine.type === 'added'
                                    ? 'bg-green-200/50 dark:bg-green-800/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700'
                                }`}
                              >
                                {diffLine.lineNum}
                              </span>
                              <span
                                className={`px-2 py-0.5 flex-1 whitespace-pre-wrap ${
                                  diffLine.type === 'removed'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                    : diffLine.type === 'added'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {diffLine.type === 'removed' ? '- ' : diffLine.type === 'added' ? '+ ' : '  '}
                                {diffLine.content}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </details>
              );
            }

            // Handle Write tool
            if (toolName === 'Write' && toolInput?.file_path && toolInput?.content !== undefined) {
              return (
                <details className="mt-2" open={isExpanded || autoExpandTools}>
                  <summary className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 transition-transform details-chevron"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    📄 Creating new file:
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onFileOpen(toolInput.file_path, {
                          old_string: '',
                          new_string: toolInput.content,
                        });
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-mono"
                    >
                      {toolInput.file_path.split('/').pop()}
                    </button>
                  </summary>
                  <div className="mt-3">
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() =>
                            onFileOpen(toolInput.file_path, {
                              old_string: '',
                              new_string: toolInput.content,
                            })
                          }
                          className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate underline cursor-pointer"
                        >
                          {toolInput.file_path}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          New File
                        </span>
                      </div>
                      <div className="text-xs font-mono">
                        {createDiff('', toolInput.content).map(
                          (diffLine, i) => (
                            <div key={i} className="flex">
                              <span
                                className={`w-8 text-center border-r ${
                                  diffLine.type === 'removed'
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                                }`}
                              >
                                {diffLine.type === 'removed' ? '-' : '+'}
                              </span>
                              <span
                                className={`px-2 py-0.5 flex-1 whitespace-pre-wrap ${
                                  diffLine.type === 'removed'
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                                    : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                }`}
                              >
                                {diffLine.content}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </details>
              );
            }

            // Handle TodoWrite tool
            if (toolName === 'TodoWrite' && toolInput?.todos && Array.isArray(toolInput.todos)) {
              return (
                <details className="mt-2" open={isExpanded || autoExpandTools}>
                  <summary className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 transition-transform details-chevron"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    Updating Todo List
                  </summary>
                  <div className="mt-3 space-y-2">
                    {toolInput.todos.map((todo: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-2 rounded ${
                          todo.status === 'completed'
                            ? 'bg-gray-50 dark:bg-gray-800/50'
                            : todo.status === 'in_progress'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                            : 'bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            todo.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : todo.status === 'in_progress'
                              ? 'bg-yellow-500 border-yellow-500'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {todo.status === 'completed' && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          {todo.status === 'in_progress' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span
                          className={`flex-1 text-sm ${
                            todo.status === 'completed'
                              ? 'text-gray-500 dark:text-gray-400 line-through'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {todo.content}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            todo.priority === 'high'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : todo.priority === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {todo.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              );
            }

            // Default tool input display
            if (toolInput) {
              return (
                <details open={isExpanded || autoExpandTools} className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
                    Tool Parameters
                  </summary>
                  <pre className="mt-2 text-xs bg-blue-100 dark:bg-blue-800/30 p-2 rounded whitespace-pre-wrap break-words overflow-hidden text-blue-900 dark:text-blue-100">
                    {showRawParameters ? JSON.stringify(toolInput, null, 2) : JSON.stringify(toolInput, null, 2)}
                  </pre>
                </details>
              );
            }
            return null;
          })()}

          {/* Tool Result */}
          {toolResult && (
            <details open={isExpanded || autoExpandTools}>
              <summary className="cursor-pointer text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
                Result
              </summary>
              {(() => {
                const content = String(toolResult);
                
                // Special handling for TodoWrite/TodoRead results
                if ((toolName === 'TodoWrite' || toolName === 'TodoRead') &&
                    (content.includes('Todos have been modified successfully') ||
                     content.includes('Todo list') ||
                     (content.startsWith('[') && content.includes('"content"') && content.includes('"status"')))) {
                  
                  try {
                    // Try to parse if it looks like todo JSON data
                    let todos = null;
                    if (content.startsWith('[')) {
                      todos = JSON.parse(content);
                    } else if (content.includes('Todos have been modified successfully')) {
                      // For TodoWrite success messages, we don't have the data in the result
                      return (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">
                              Todo list has been updated successfully
                            </span>
                          </div>
                        </div>
                      );
                    }

                    if (todos && Array.isArray(todos)) {
                      return (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-medium">
                              Current Todo List
                            </span>
                          </div>
                          <div className="space-y-2">
                            {todos.map((todo: any, idx: number) => (
                              <div
                                key={idx}
                                className={`flex items-center gap-3 p-2 rounded ${
                                  todo.status === 'completed'
                                    ? 'bg-gray-50 dark:bg-gray-800/50'
                                    : todo.status === 'in_progress'
                                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                                    : 'bg-white dark:bg-gray-800'
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    todo.status === 'completed'
                                      ? 'bg-green-500 border-green-500'
                                      : todo.status === 'in_progress'
                                      ? 'bg-yellow-500 border-yellow-500'
                                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                                  }`}
                                >
                                  {todo.status === 'completed' && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                  {todo.status === 'in_progress' && (
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  )}
                                </div>
                                <span
                                  className={`flex-1 text-sm ${
                                    todo.status === 'completed'
                                      ? 'text-gray-500 dark:text-gray-400 line-through'
                                      : 'text-gray-800 dark:text-gray-200'
                                  }`}
                                >
                                  {todo.content}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                                    todo.priority === 'high'
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                      : todo.priority === 'medium'
                                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {todo.priority}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  } catch (e) {
                    // Fall back to regular display
                  }
                }

                // Special handling for file update results
                if ((toolName === 'Edit' || toolName === 'Write') && content.includes('has been updated')) {
                  const fileMatch = content.match(/The file (.+?) has been updated\./);
                  if (fileMatch) {
                    return (
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm text-green-800 dark:text-green-200">
                            File updated successfully
                          </span>
                        </div>
                        <button
                          onClick={() => onFileOpen(fileMatch[1])}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                        >
                          Open file
                        </button>
                      </div>
                    );
                  }
                }

                // Check if the result contains base64 image data
                if (content.includes('data:image/') && content.includes('base64,')) {
                  // Extract base64 image URL(s)
                  const imageRegex = /data:image\/[^;]+;base64,[^\s"']+/g;
                  const imageMatches = content.match(imageRegex);
                  
                  if (imageMatches) {
                    return (
                      <div className="mt-2 space-y-2">
                        {imageMatches.map((imageUrl, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Screenshot ${idx + 1}`}
                              className="max-w-full h-auto rounded border border-gray-300 dark:border-gray-600"
                              style={{ maxHeight: '600px' }}
                            />
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Screenshot {idx + 1} {toolName === 'Read' && '(from Read tool)'}
                            </div>
                          </div>
                        ))}
                        {/* If there's other text content besides the image, show it */}
                        {content.replace(imageRegex, '').trim() && (
                          <pre className="mt-2 text-xs bg-blue-100 dark:bg-blue-800/30 p-2 rounded whitespace-pre-wrap break-words overflow-hidden text-blue-900 dark:text-blue-100">
                            {content.replace(imageRegex, '[Image displayed above]').trim()}
                          </pre>
                        )}
                      </div>
                    );
                  }
                }
                
                // Default result display
                return (
                  <pre className="mt-2 text-xs bg-blue-100 dark:bg-blue-800/30 p-2 rounded whitespace-pre-wrap break-words overflow-hidden text-blue-900 dark:text-blue-100">
                    {content}
                  </pre>
                );
              })()}
            </details>
          )}




        </div>
      );
    };

    // Handle interactive prompt rendering
    const renderInteractivePrompt = () => {
      if (!message.isInteractivePrompt || typeof message.content !== "string") return null;

      logger.debug("Rendering interactive prompt", {
        messageIndex: index,
        messageId: message.id,
        contentLength: message.content.length
      });

      const content = message.content;
      const lines = content.split("\n");
      const questionLine = lines.find((line: string) => line.includes("?")) ?? lines[0] ?? "";
      const options: Array<{ number: string; text: string; isSelected?: boolean }> = [];

      // Parse the menu options
      lines.forEach((line: string) => {
        const optionMatch = /[❯\s]*(\d+)\.\s+(.+)/.exec(line);
        if (optionMatch) {
          const isSelected = line.includes("❯");
          options.push({
            number: optionMatch[1] ?? "",
            text: optionMatch[2]?.trim() ?? "",
            isSelected,
          });
        }
      });

      logger.debug("Parsed interactive prompt options", {
        messageIndex: index,
        questionLine,
        optionCount: options.length,
        selectedOptions: options.filter(opt => opt.isSelected).length
      });

      return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-2">
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
            {questionLine}
          </p>

          {/* Option buttons */}
          <div className="space-y-2 mb-4">
            {options.map((option) => (
              <button
                key={option.number}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  option.isSelected
                    ? "bg-amber-600 dark:bg-amber-700 text-white border-amber-600 dark:border-amber-700 shadow-md"
                    : "bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700"
                } cursor-not-allowed opacity-75`}
                disabled
                aria-label={`Option ${option.number}: ${option.text}${option.isSelected ? " (selected)" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      option.isSelected
                        ? "bg-white/20"
                        : "bg-amber-100 dark:bg-amber-800/50"
                    }`}
                  >
                    {option.number}
                  </span>
                  <span className="text-sm sm:text-base font-medium flex-1">
                    {option.text}
                  </span>
                  {option.isSelected && (
                    <span className="text-lg" aria-hidden="true">❯</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="bg-amber-100 dark:bg-amber-800/30 rounded-lg p-3">
            <p className="text-amber-900 dark:text-amber-100 text-sm font-medium mb-1">
              ⏳ Waiting for your response in the CLI
            </p>
            <p className="text-amber-800 dark:text-amber-200 text-xs">
              Please select an option in your terminal where Claude is running.
            </p>
          </div>
        </div>
      );
    };

    // Render regular content
    const renderRegularContent = () => {
      if (message.isToolUse || message.isInteractivePrompt) return null;

      // Debug log message content with detailed structure analysis
      logger.debug('Rendering message content', {
        messageIndex: index,
        messageId: message.id,
        messageType: message.type,
        hasContent: !!message.content,
        contentType: typeof message.content,
        contentLength: message.content?.length || 0,
        contentPreview: String(message.content || '').substring(0, 100),
        isToolUse: message.isToolUse,
        isInteractivePrompt: message.isInteractivePrompt,
        // Add detailed content structure analysis
        rawContent: message.content,
        contentKeys: message.content && typeof message.content === 'object' ? Object.keys(message.content) : null,
        extractedContent: extractMessageContent(message.content),
        extractedContentLength: extractMessageContent(message.content).length
      });

      return (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {message.type === "assistant" ? (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-gray [&_code]:!bg-transparent [&_code]:!p-0">
              {/* Render any images found in the content */}
              {extractImagesFromContent(message.content)}
              <ReactMarkdown
                components={{
                  code: ({
                    node: _node,
                    inline,
                    className: _className,
                    children,
                    ...props
                  }: any) => {
                    return inline ? (
                      <strong
                        className="text-blue-600 dark:text-blue-400 font-bold not-prose"
                        {...props}
                      >
                        {children}
                      </strong>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-hidden my-2">
                        <code
                          className="text-gray-800 dark:text-gray-200 text-sm font-mono block whitespace-pre-wrap break-words"
                          {...props}
                        >
                          {children}
                        </code>
                      </div>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-2">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  p: ({ children }) => {
                    // Check if the paragraph contains base64 image data
                    const childrenString = String(children);
                    if (childrenString.includes('data:image/') && childrenString.includes('base64,')) {
                      const imageRegex = /data:image\/[^;]+;base64,[^\s"']+/g;
                      const parts = childrenString.split(imageRegex);
                      const images = childrenString.match(imageRegex) || [];
                      
                      return (
                        <div className="mb-2 last:mb-0">
                          {parts.map((text, idx) => (
                            <React.Fragment key={idx}>
                              {text && <span>{text}</span>}
                              {images[idx] && (
                                <img
                                  src={images[idx]}
                                  alt="Embedded image"
                                  className="max-w-full h-auto rounded my-2 border border-gray-300 dark:border-gray-600"
                                  style={{ maxHeight: '600px' }}
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      );
                    }
                    return <div className="mb-2 last:mb-0">{children}</div>;
                  },
                  img: ({ src, alt, ...props }) => {
                    // Handle both regular images and base64 images
                    return (
                      <img
                        src={src}
                        alt={alt || 'Image'}
                        className="max-w-full h-auto rounded my-2 border border-gray-300 dark:border-gray-600"
                        style={{ maxHeight: '600px' }}
                        {...props}
                      />
                    );
                  },
                }}
              >
                {extractMessageContent(message.content)}
              </ReactMarkdown>
            </div>
          ) : (
            // User messages: render markdown if it contains markdown syntax, otherwise plain text
            <div className="whitespace-pre-wrap">
              {(() => {
                const content = extractMessageContent(message.content);
                const hasMarkdown = /[*_`#\[\]]/g.test(content);
                
                if (hasMarkdown && message.type === "user") {
                  return (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-gray [&_code]:!bg-transparent [&_code]:!p-0">
                      <ReactMarkdown
                        components={{
                          code: ({
                            node: _node,
                            inline,
                            className: _className,
                            children,
                            ...props
                          }: any) => {
                            return inline ? (
                              <strong
                                className="text-blue-600 dark:text-blue-400 font-bold not-prose"
                                {...props}
                              >
                                {children}
                              </strong>
                            ) : (
                              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-hidden my-2">
                                <code
                                  className="text-gray-800 dark:text-gray-200 text-sm font-mono block whitespace-pre-wrap break-words"
                                  {...props}
                                >
                                  {children}
                                </code>
                              </div>
                            );
                          },
                          p: ({ children }) => (
                            <div className="mb-2 last:mb-0">{children}</div>
                          ),
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  );
                }
                return content;
              })()}
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        ref={messageRef}
        className={`chat-message ${message.type} ${isGrouped ? "grouped" : ""} ${
          message.type === "user" ? "flex justify-end px-3 sm:px-0" : "px-3 sm:px-0"
        }`}
        data-testid={`message-${index}`}
        role={message.type === "user" ? "log" : "region"}
        aria-label={`${message.type} message`}
      >
        {message.type === "user" ? (
          /* User message bubble on the right */
          <div className="flex items-end space-x-0 sm:space-x-3 w-full sm:w-auto sm:max-w-[85%] md:max-w-md lg:max-w-lg xl:max-w-xl">
            <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-3 sm:px-4 py-2 shadow-sm flex-1 sm:flex-initial">
              <div className="text-sm whitespace-pre-wrap break-words">
                {extractMessageContent(message.content)}
              </div>
              <div className="text-xs text-blue-100 mt-1 text-right">
                {message.timestamp
                  ? new Date(message.timestamp).toLocaleTimeString()
                  : ""}
              </div>
            </div>
            {!isGrouped && (
              <img
                src="/icons/user.jpg"
                alt="User"
                className="hidden sm:block w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            )}
          </div>
        ) : (
          /* Claude/Error messages on the left */
          <div className="w-full">
            {!isGrouped && (
              <div className="flex items-center space-x-3 mb-2">
                {message.type === "error" ? (
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                    !
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 p-1">
                    <ClaudeLogo className="w-full h-full" />
                  </div>
                )}
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {message.type === "error" ? "Error" : "Claude"}
                </div>
              </div>
            )}

            <div className={`${isGrouped ? "ml-11" : ""}`}>
              {/* Render special message types */}
              {message.isInteractivePrompt && renderInteractivePrompt()}
              {message.isToolUse && renderToolUseMessage()}
              
              {/* Render regular content */}
              {renderRegularContent()}

              <div
                className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                  isGrouped ? "opacity-0 group-hover:opacity-100" : ""
                }`}
              >
                {message.timestamp
                  ? new Date(message.timestamp).toLocaleTimeString()
                  : ""}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

MessageComponent.displayName = "MessageComponent";