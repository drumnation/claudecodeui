/**
 * Tool Use Display Component - Shows tool execution with parameters
 * Following atomic design pattern within tools feature
 */

import React, { memo, useMemo, useState } from 'react';
import { useLogger } from '@kit/logger/react';
import { Button } from '@/components/atoms/Button';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Square, 
  Eye, 
  EyeOff,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { ToolUse, ToolDisplayConfig, ToolParameter } from '../types';
import { toolsAPI } from '../api';

interface ToolUseDisplayProps {
  toolUse: ToolUse;
  displayConfig: ToolDisplayConfig;
  onConfirm?: (toolId: string) => void;
  onCancel?: (toolId: string) => void;
  className?: string;
}

export const ToolUseDisplay = memo(function ToolUseDisplay({
  toolUse,
  displayConfig,
  onConfirm,
  onCancel,
  className = ''
}: ToolUseDisplayProps) {
  const logger = useLogger({ scope: 'ToolUseDisplay' });
  const [isExpanded, setIsExpanded] = useState(displayConfig.autoExpandTools);
  const [showRawParams, setShowRawParams] = useState(false);

  // Extract tool parameters for display
  const parameters = useMemo(() => {
    return toolsAPI.extractToolParameters(toolUse.tool_input);
  }, [toolUse.tool_input]);

  const handleConfirm = () => {
    if (onConfirm) {
      logger.info('Tool execution confirmed by user', {
        toolId: toolUse.id,
        toolName: toolUse.tool_name
      });
      onConfirm(toolUse.id);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      logger.info('Tool execution cancelled by user', {
        toolId: toolUse.id,
        toolName: toolUse.tool_name
      });
      onCancel(toolUse.id);
    }
  };

  const getStatusIcon = () => {
    switch (toolUse.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'running':
        return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (toolUse.status) {
      case 'pending':
        return 'Pending approval';
      case 'running':
        return 'Executing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (toolUse.status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'running':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };

  const renderParameterValue = (param: ToolParameter) => {
    if (param.sensitive) {
      return (
        <span className="text-gray-500 dark:text-gray-400 italic">
          ••••••••
        </span>
      );
    }

    if (param.type === 'object' || param.type === 'array') {
      const jsonString = JSON.stringify(param.value, null, 2);
      if (jsonString.length > 100 && !showRawParams) {
        return (
          <div className="space-y-2">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {param.type === 'array' ? `Array (${param.value.length} items)` : 'Object'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawParams(true)}
              className="text-xs"
            >
              Show details
            </Button>
          </div>
        );
      }
      return (
        <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
          {jsonString}
        </pre>
      );
    }

    if (typeof param.value === 'string' && param.value.length > 200 && !showRawParams) {
      return (
        <div className="space-y-2">
          <div className="text-gray-700 dark:text-gray-300">
            {param.value.substring(0, 200)}...
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRawParams(true)}
            className="text-xs"
          >
            Show full content
          </Button>
        </div>
      );
    }

    return (
      <span className="text-gray-700 dark:text-gray-300 break-words">
        {String(param.value)}
      </span>
    );
  };

  const renderParameters = () => {
    if (parameters.length === 0) {
      return (
        <div className="text-gray-500 dark:text-gray-400 text-sm italic">
          No parameters
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {parameters.map((param, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {param.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                {param.type}
              </span>
              {param.required && (
                <span className="text-xs text-red-500">required</span>
              )}
            </div>
            {param.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {param.description}
              </div>
            )}
            <div className="text-sm">
              {renderParameterValue(param)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Tool Header */}
      <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="font-mono">
                {toolUse.tool_name}
              </span>
            </button>
            
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm">
                {getStatusText()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {displayConfig.showExecutionTime && (
              <span className="text-xs opacity-75">
                {new Date(toolUse.timestamp).toLocaleTimeString()}
              </span>
            )}

            {toolUse.status === 'pending' && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleConfirm}
                  className="text-xs text-green-600 hover:text-green-700 dark:text-green-400"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <Square className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            )}

            {toolUse.status === 'running' && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <Square className="w-3 h-3 mr-1" />
                Abort
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tool Parameters */}
      {isExpanded && (
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Parameters
              </h4>
              {displayConfig.showRawParameters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRawParams(!showRawParams)}
                  className="text-xs"
                  title={showRawParams ? 'Show formatted view' : 'Show raw parameters'}
                >
                  {showRawParams ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
              )}
            </div>

            {showRawParams ? (
              <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                {JSON.stringify(toolUse.tool_input, null, 2)}
              </pre>
            ) : (
              renderParameters()
            )}
          </div>
        </div>
      )}
    </div>
  );
});