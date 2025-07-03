/**
 * Tool Execution Hook - Managing Claude Code tool execution state
 * Following Bulletproof React pattern for state management
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLogger } from '@kit/logger/react';
import type { Logger } from '@kit/logger/types';
import { toolsAPI } from '../api';
import type { 
  ToolUse, 
  ToolResult, 
  ToolExecutionState, 
  ToolDisplayConfig,
  ToolPermissions,
  ToolMessage
} from '../types';

interface UseToolExecutionProps {
  sessionId?: string;
  projectName?: string;
  displayConfig: ToolDisplayConfig;
  onToolConfirmation?: (toolUse: ToolUse) => Promise<boolean>;
}

interface UseToolExecutionReturn {
  executionState: ToolExecutionState;
  permissions: ToolPermissions;
  processToolMessage: (message: ToolMessage) => void;
  confirmToolExecution: (toolId: string) => Promise<void>;
  cancelToolExecution: (toolId: string) => void;
  clearExecutionHistory: () => void;
  getToolMetrics: () => any[];
  updatePermissions: (newPermissions: ToolPermissions) => Promise<void>;
}

export function useToolExecution({
  sessionId,
  projectName,
  displayConfig,
  onToolConfirmation
}: UseToolExecutionProps): UseToolExecutionReturn {
  const logger: Logger = useLogger({ scope: 'ToolExecution' });
  const toolLogger = useRef<Logger>(logger);

  // Update tool logger when session changes
  useEffect(() => {
    if (sessionId) {
      toolLogger.current = logger.child({ sessionId, projectName });
    } else {
      toolLogger.current = logger;
    }
  }, [sessionId, projectName, logger]);

  const [executionState, setExecutionState] = useState<ToolExecutionState>({
    activeTools: new Map(),
    completedTools: new Map(),
    isExecuting: false,
    executionQueue: []
  });

  const [permissions, setPermissions] = useState<ToolPermissions>({
    allowedTools: [],
    disallowedTools: [],
    skipPermissions: false,
    requireConfirmation: []
  });

  // Load permissions on mount
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      const loadedPermissions = await toolsAPI.loadToolPermissions();
      setPermissions(loadedPermissions);
      
      toolLogger.current.debug('Tool permissions loaded', {
        allowedCount: loadedPermissions.allowedTools.length,
        disallowedCount: loadedPermissions.disallowedTools.length,
        skipPermissions: loadedPermissions.skipPermissions
      });
    } catch (error) {
      toolLogger.current.error('Failed to load tool permissions', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }, []);

  const processToolMessage = useCallback((message: ToolMessage) => {
    if (message.type === 'tool_use') {
      const toolUse = toolsAPI.parseToolUse(message);
      if (toolUse) {
        toolLogger.current.info('Processing tool use', {
          toolId: toolUse.id,
          toolName: toolUse.tool_name,
          inputKeys: Object.keys(toolUse.tool_input)
        });

        setExecutionState(prev => {
          const newState = { ...prev };
          newState.activeTools.set(toolUse.id, toolUse);
          newState.isExecuting = true;
          return newState;
        });

        // Check if tool requires confirmation
        if (toolsAPI.requiresConfirmation(toolUse.tool_name, toolUse.tool_input, permissions)) {
          handleToolConfirmation(toolUse);
        } else {
          // Tool is auto-approved
          setExecutionState(prev => {
            const updated = { ...prev };
            const tool = updated.activeTools.get(toolUse.id);
            if (tool) {
              tool.status = 'running';
              updated.activeTools.set(toolUse.id, tool);
            }
            return updated;
          });
        }
      }
    } else if (message.type === 'tool_result') {
      const toolResult = toolsAPI.parseToolResult(message);
      if (toolResult) {
        toolLogger.current.info('Processing tool result', {
          resultId: toolResult.id,
          toolUseId: toolResult.tool_use_id,
          toolName: toolResult.tool_name,
          success: toolResult.success
        });

        setExecutionState(prev => {
          const newState = { ...prev };
          
          // Move from active to completed
          const toolUse = newState.activeTools.get(toolResult.tool_use_id);
          if (toolUse) {
            toolUse.status = toolResult.success ? 'completed' : 'error';
            newState.activeTools.delete(toolResult.tool_use_id);
          }
          
          newState.completedTools.set(toolResult.id, toolResult);
          newState.isExecuting = newState.activeTools.size > 0;
          
          return newState;
        });
      }
    }
  }, [permissions]);

  const handleToolConfirmation = useCallback(async (toolUse: ToolUse) => {
    try {
      if (onToolConfirmation) {
        const approved = await onToolConfirmation(toolUse);
        
        if (approved) {
          toolLogger.current.info('Tool execution approved by user', {
            toolId: toolUse.id,
            toolName: toolUse.tool_name
          });
          
          setExecutionState(prev => {
            const updated = { ...prev };
            const tool = updated.activeTools.get(toolUse.id);
            if (tool) {
              tool.status = 'running';
              updated.activeTools.set(toolUse.id, tool);
            }
            return updated;
          });
        } else {
          toolLogger.current.info('Tool execution denied by user', {
            toolId: toolUse.id,
            toolName: toolUse.tool_name
          });
          
          cancelToolExecution(toolUse.id);
        }
      }
    } catch (error) {
      toolLogger.current.error('Tool confirmation failed', {
        toolId: toolUse.id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      cancelToolExecution(toolUse.id);
    }
  }, [onToolConfirmation]);

  const confirmToolExecution = useCallback(async (toolId: string) => {
    setExecutionState(prev => {
      const updated = { ...prev };
      const tool = updated.activeTools.get(toolId);
      if (tool) {
        tool.status = 'running';
        updated.activeTools.set(toolId, tool);
        
        toolLogger.current.info('Tool execution confirmed', {
          toolId,
          toolName: tool.tool_name
        });
      }
      return updated;
    });
  }, []);

  const cancelToolExecution = useCallback((toolId: string) => {
    setExecutionState(prev => {
      const updated = { ...prev };
      const tool = updated.activeTools.get(toolId);
      
      if (tool) {
        toolLogger.current.info('Tool execution cancelled', {
          toolId,
          toolName: tool.tool_name
        });
        
        updated.activeTools.delete(toolId);
        updated.isExecuting = updated.activeTools.size > 0;
      }
      
      return updated;
    });
  }, []);

  const clearExecutionHistory = useCallback(() => {
    toolLogger.current.debug('Clearing tool execution history');
    
    setExecutionState({
      activeTools: new Map(),
      completedTools: new Map(),
      isExecuting: false,
      executionQueue: []
    });
  }, []);

  const getToolMetrics = useCallback(() => {
    return toolsAPI.getToolMetrics();
  }, []);

  const updatePermissions = useCallback(async (newPermissions: ToolPermissions) => {
    try {
      await toolsAPI.saveToolPermissions(newPermissions);
      setPermissions(newPermissions);
      
      toolLogger.current.info('Tool permissions updated', {
        allowedCount: newPermissions.allowedTools.length,
        disallowedCount: newPermissions.disallowedTools.length,
        skipPermissions: newPermissions.skipPermissions
      });
    } catch (error) {
      toolLogger.current.error('Failed to update tool permissions', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }, []);

  return {
    executionState,
    permissions,
    processToolMessage,
    confirmToolExecution,
    cancelToolExecution,
    clearExecutionHistory,
    getToolMetrics,
    updatePermissions
  };
}