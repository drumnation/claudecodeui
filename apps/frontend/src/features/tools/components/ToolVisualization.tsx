/**
 * Tool Visualization Component - Displays Claude Code tool results
 * Following atomic design pattern within tools feature
 */

import React, { memo, useMemo } from 'react';
import { useLogger } from '@kit/logger/react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/atoms/Button';
import { ChevronDown, ChevronRight, Copy, ExternalLink, Eye, EyeOff } from 'lucide-react';
import type { ToolResult, ToolDisplayConfig } from '../types';
import { toolsAPI } from '../api';

interface ToolVisualizationProps {
  toolResult: ToolResult;
  displayConfig: ToolDisplayConfig;
  onFileOpen?: (filePath: string, diffOptions?: any) => void;
  className?: string;
}

export const ToolVisualization = memo(function ToolVisualization({
  toolResult,
  displayConfig,
  onFileOpen,
  className = ''
}: ToolVisualizationProps) {
  const logger = useLogger({ scope: 'ToolVisualization' });
  const [isExpanded, setIsExpanded] = React.useState(displayConfig.autoExpandTools);
  const [showRaw, setShowRaw] = React.useState(false);

  // Format the tool result for display
  const formattedResult = useMemo(() => {
    return toolsAPI.formatToolResult(toolResult.tool_name, toolResult.tool_result);
  }, [toolResult.tool_name, toolResult.tool_result]);

  // Extract file paths for file operation tools
  const filePaths = useMemo(() => {
    if (['Edit', 'Write', 'Read', 'MultiEdit'].includes(toolResult.tool_name)) {
      try {
        // Look for file paths in the result
        const resultText = typeof toolResult.tool_result === 'string' 
          ? toolResult.tool_result 
          : JSON.stringify(toolResult.tool_result);
        
        const filePathRegex = /(?:file|path):\s*([^\s\n]+)/gi;
        const matches = [...resultText.matchAll(filePathRegex)];
        return matches.map(match => match[1]);
      } catch (error) {
        logger.debug('Failed to extract file paths', { error });
        return [];
      }
    }
    return [];
  }, [toolResult.tool_name, toolResult.tool_result, logger]);

  const handleCopyResult = () => {
    navigator.clipboard.writeText(formattedResult.content).then(() => {
      logger.debug('Tool result copied to clipboard', {
        toolName: toolResult.tool_name,
        resultId: toolResult.id
      });
    });
  };

  const handleFileOpen = (filePath: string) => {
    if (onFileOpen) {
      logger.debug('Opening file from tool result', {
        filePath,
        toolName: toolResult.tool_name
      });
      onFileOpen(filePath);
    }
  };

  const renderResultContent = () => {
    if (showRaw || !displayConfig.showRawParameters) {
      return (
        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
          {formattedResult.content}
        </pre>
      );
    }

    // Enhanced display based on tool type and result format
    switch (formattedResult.type) {
      case 'bash':
        return (
          <div className="space-y-2">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded">
              {formattedResult.content}
            </pre>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {formattedResult.content}
            </div>
            {filePaths.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filePaths.map((filePath, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileOpen(filePath)}
                    className="text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {filePath.split('/').pop()}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      case 'list':
        const items = formattedResult.content.split('\n').filter(Boolean);
        return (
          <div className="space-y-1">
            {items.map((item, index) => (
              <div
                key={index}
                className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                {item}
              </div>
            ))}
          </div>
        );

      case 'json':
        try {
          const parsed = JSON.parse(formattedResult.content);
          return (
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-x-auto">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          );
        } catch {
          return (
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
              {formattedResult.content}
            </pre>
          );
        }

      case 'web':
        return (
          <div className="space-y-2">
            <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
              {formattedResult.content}
            </ReactMarkdown>
          </div>
        );

      case 'todo':
        const todos = formattedResult.content.split('\n').filter(Boolean);
        return (
          <div className="space-y-2">
            {todos.map((todo, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="flex-shrink-0">
                  {todo.startsWith('✅') ? '✅' : '⏳'}
                </span>
                <span>{todo.replace(/^[✅⏳]\s*/, '')}</span>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {formattedResult.content}
          </div>
        );
    }
  };

  const getStatusColor = () => {
    if (toolResult.success) {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusIcon = () => {
    if (toolResult.success) {
      return '✅';
    }
    return '❌';
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Tool Header */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {toolResult.tool_name}
              </span>
              <span className={`text-xs ${getStatusColor()}`}>
                {getStatusIcon()}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {displayConfig.showExecutionTime && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(toolResult.timestamp).toLocaleTimeString()}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRaw(!showRaw)}
              className="text-xs"
              title={showRaw ? 'Show formatted view' : 'Show raw output'}
            >
              {showRaw ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyResult}
              className="text-xs"
              title="Copy result"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tool Result Content */}
      {isExpanded && (
        <div className="p-4">
          {toolResult.error ? (
            <div className="text-red-600 dark:text-red-400 text-sm">
              <div className="font-medium mb-2">Error:</div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                {toolResult.error}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {renderResultContent()}
            </div>
          )}
        </div>
      )}
    </div>
  );
});