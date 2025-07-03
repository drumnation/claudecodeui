/*
 * ToolDisplay.tsx - Tool Use Results and Aggregated Display Component
 *
 * This component provides aggregated visualization of tool usage across the chat session:
 * - Summary of all tools used in the conversation
 * - File operations with diff highlighting
 * - Tool performance metrics
 * - Interactive tool result exploration
 * - Error tracking and reporting
 */

import React, { useMemo, useState, useCallback } from "react";
import type { Logger } from "@kit/logger/types";
import type { ChatMessage } from "../ChatInterface";

export interface ToolDisplayProps {
  messages: ChatMessage[];
  onFileOpen: (
    filePath: string,
    diffOptions?: { old_string: string; new_string: string },
  ) => void;
  showRawParameters: boolean;
  logger: Logger;
}

interface ToolUsageStats {
  toolName: string;
  count: number;
  successCount: number;
  errorCount: number;
  filesModified: string[];
  lastUsed: string | number | Date;
  averageExecutionTime?: number;
}

export const ToolDisplay: React.FC<ToolDisplayProps> = ({
  messages,
  onFileOpen,
  showRawParameters,
  logger,
}) => {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Analyze tool usage across all messages
  const toolStats = useMemo(() => {
    const stats: Record<string, ToolUsageStats> = {};
    const toolMessages = messages.filter(msg => msg.isToolUse === true);

    logger.debug("Analyzing tool usage statistics", {
      totalMessages: messages.length,
      toolMessages: toolMessages.length
    });

    toolMessages.forEach((msg, index) => {
      const toolName = msg.tool_name || msg.toolName || "Unknown Tool";
      const hasError = msg.toolError;
      const toolInput = msg.tool_input || msg.toolInput;
      const filePath = toolInput?.file_path || toolInput?.path;

      if (!stats[toolName]) {
        stats[toolName] = {
          toolName,
          count: 0,
          successCount: 0,
          errorCount: 0,
          filesModified: [],
          lastUsed: msg.timestamp || new Date(),
        };
      }

      stats[toolName].count += 1;
      stats[toolName].lastUsed = msg.timestamp || new Date();

      if (hasError) {
        stats[toolName].errorCount += 1;
      } else {
        stats[toolName].successCount += 1;
      }

      if (filePath && !stats[toolName].filesModified.includes(filePath)) {
        stats[toolName].filesModified.push(filePath);
      }

      logger.debug("Processed tool usage", {
        messageIndex: index,
        toolName,
        hasError,
        filePath,
        totalCount: stats[toolName].count
      });
    });

    const sortedStats = Object.values(stats).sort((a, b) => b.count - a.count);
    
    logger.info("Tool usage analysis complete", {
      uniqueTools: sortedStats.length,
      totalToolCalls: sortedStats.reduce((sum, stat) => sum + stat.count, 0),
      mostUsedTool: sortedStats[0]?.toolName,
      toolsWithErrors: sortedStats.filter(stat => stat.errorCount > 0).length
    });

    return sortedStats;
  }, [messages, logger]);

  // Get file operations for diff visualization
  const fileOperations = useMemo(() => {
    const operations = messages
      .filter(msg => 
        msg.isToolUse === true && 
        (msg.tool_name?.toLowerCase().includes("edit") || 
         msg.toolName?.toLowerCase().includes("edit") ||
         msg.tool_name?.toLowerCase().includes("write") ||
         msg.toolName?.toLowerCase().includes("write"))
      )
      .map(msg => {
        const toolInput = msg.tool_input || msg.toolInput;
        return {
          id: msg.id,
          toolName: msg.tool_name || msg.toolName || "Unknown",
          filePath: toolInput?.file_path || toolInput?.path,
          oldString: toolInput?.old_string,
          newString: toolInput?.new_string,
          timestamp: msg.timestamp,
          hasError: msg.toolError,
          content: toolInput?.content,
        };
      })
      .filter(op => op.filePath);

    logger.debug("Identified file operations", {
      operationCount: operations.length,
      uniqueFiles: new Set(operations.map(op => op.filePath)).size,
      operationsWithDiffs: operations.filter(op => op.oldString && op.newString).length
    });

    return operations;
  }, [messages, logger]);

  const handleToolExpand = useCallback((toolName: string) => {
    const newExpanded = expandedTool === toolName ? null : toolName;
    setExpandedTool(newExpanded);
    
    logger.info("Tool details toggled", {
      toolName,
      expanded: newExpanded !== null,
      previouslyExpanded: expandedTool
    });
  }, [expandedTool, logger]);

  const handleFileOperation = useCallback((operation: any) => {
    logger.info("Opening file from tool display", {
      filePath: operation.filePath,
      toolName: operation.toolName,
      hasDiff: !!(operation.oldString && operation.newString),
      operationId: operation.id
    });

    onFileOpen(
      operation.filePath,
      operation.oldString && operation.newString
        ? { old_string: operation.oldString, new_string: operation.newString }
        : undefined
    );
  }, [onFileOpen, logger]);

  // Don't render if no tools were used
  if (toolStats.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">🔧</span>
          Tool Usage Summary
        </h3>
        <button
          onClick={() => setShowStats(!showStats)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
        >
          {showStats ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Tool Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {toolStats.map((stat) => (
          <div
            key={stat.toolName}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {stat.toolName}
              </h4>
              <button
                onClick={() => handleToolExpand(stat.toolName)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                aria-label={`${expandedTool === stat.toolName ? "Collapse" : "Expand"} ${stat.toolName} details`}
              >
                {expandedTool === stat.toolName ? "▼" : "▶"}
              </button>
            </div>
            
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Total calls:</span>
                <span className="font-medium">{stat.count}</span>
              </div>
              <div className="flex justify-between">
                <span>Success:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {stat.successCount}
                </span>
              </div>
              {stat.errorCount > 0 && (
                <div className="flex justify-between">
                  <span>Errors:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {stat.errorCount}
                  </span>
                </div>
              )}
              {stat.filesModified.length > 0 && (
                <div className="flex justify-between">
                  <span>Files modified:</span>
                  <span className="font-medium">{stat.filesModified.length}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Last used:</span>
                <span className="font-medium">
                  {new Date(stat.lastUsed).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Expanded tool details */}
            {expandedTool === stat.toolName && showStats && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Success Rate: {((stat.successCount / stat.count) * 100).toFixed(1)}%
                  </div>
                  
                  {stat.filesModified.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Modified Files:
                      </div>
                      <div className="space-y-1">
                        {stat.filesModified.slice(0, 3).map((file, idx) => (
                          <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                            {file.split("/").pop()}
                          </div>
                        ))}
                        {stat.filesModified.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            +{stat.filesModified.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* File Operations */}
      {fileOperations.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">📝</span>
            File Operations ({fileOperations.length})
          </h4>
          
          <div className="space-y-2">
            {fileOperations.slice(0, showStats ? fileOperations.length : 5).map((operation) => (
              <div
                key={operation.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {operation.toolName}
                    </span>
                    {operation.hasError && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded-full">
                        Error
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate">
                    {operation.filePath}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(operation.timestamp || "").toLocaleString()}
                  </div>
                </div>
                
                <button
                  onClick={() => handleFileOperation(operation)}
                  className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  Open
                  {operation.oldString && operation.newString && (
                    <span className="ml-1 text-xs bg-blue-500 px-1 py-0.5 rounded">
                      diff
                    </span>
                  )}
                </button>
              </div>
            ))}
            
            {!showStats && fileOperations.length > 5 && (
              <button
                onClick={() => setShowStats(true)}
                className="w-full p-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 border border-gray-200 dark:border-gray-600 rounded"
              >
                Show {fileOperations.length - 5} more operations...
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overall Statistics */}
      {showStats && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Session Statistics
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-3">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {toolStats.reduce((sum, stat) => sum + stat.count, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Tools Used</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-3">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {toolStats.reduce((sum, stat) => sum + stat.successCount, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Successful</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-3">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {toolStats.reduce((sum, stat) => sum + stat.errorCount, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Errors</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-3">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {new Set(toolStats.flatMap(stat => stat.filesModified)).size}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Files Modified</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};