/**
 * Tools Feature API Layer - Claude Code tool execution and management
 * Following Bulletproof React pattern for API organization
 */

import { defaultLogger as log } from '@kit/logger/browser';
import type { 
  ToolUse, 
  ToolResult, 
  ToolExecutionContext, 
  ToolPermissions,
  ToolMetrics,
  ClaudeCodeTool,
  ToolParameter
} from '../types';

/**
 * Tools API service for managing Claude Code tool execution
 */
export class ToolsAPI {
  private static instance: ToolsAPI;
  private logger = log.child({ scope: 'ToolsAPI' });
  private executionMetrics = new Map<string, ToolMetrics>();

  static getInstance(): ToolsAPI {
    if (!ToolsAPI.instance) {
      ToolsAPI.instance = new ToolsAPI();
    }
    return ToolsAPI.instance;
  }

  /**
   * Parse tool use from chat message
   */
  parseToolUse(message: any): ToolUse | null {
    try {
      if (message.type !== 'tool_use') {
        return null;
      }

      const toolUse: ToolUse = {
        id: message.id || `tool_${Date.now()}`,
        tool_name: message.tool_name || message.toolName,
        tool_input: message.tool_input || message.toolInput || {},
        timestamp: message.timestamp || Date.now(),
        status: 'pending',
        metadata: {
          messageIndex: message.index,
          inline: message.inline
        }
      };

      this.logger.debug('Parsed tool use', {
        toolId: toolUse.id,
        toolName: toolUse.tool_name,
        inputKeys: Object.keys(toolUse.tool_input)
      });

      return toolUse;
    } catch (error) {
      this.logger.error('Failed to parse tool use', {
        error: error instanceof Error ? error.message : String(error),
        message
      });
      return null;
    }
  }

  /**
   * Parse tool result from chat message
   */
  parseToolResult(message: any): ToolResult | null {
    try {
      if (message.type !== 'tool_result') {
        return null;
      }

      const toolResult: ToolResult = {
        id: message.id || `result_${Date.now()}`,
        tool_use_id: message.tool_use_id || message.toolId || '',
        tool_name: message.tool_name || message.toolName || '',
        tool_result: message.tool_result || message.toolResult,
        timestamp: message.toolResultTimestamp || message.timestamp || Date.now(),
        success: !message.toolError,
        error: message.toolError ? String(message.tool_result || message.toolResult) : undefined,
        metadata: {
          messageIndex: message.index,
          inline: message.inline
        }
      };

      this.logger.debug('Parsed tool result', {
        resultId: toolResult.id,
        toolUseId: toolResult.tool_use_id,
        toolName: toolResult.tool_name,
        success: toolResult.success
      });

      // Update metrics
      this.updateToolMetrics(toolResult);

      return toolResult;
    } catch (error) {
      this.logger.error('Failed to parse tool result', {
        error: error instanceof Error ? error.message : String(error),
        message
      });
      return null;
    }
  }

  /**
   * Extract tool parameters for display
   */
  extractToolParameters(toolInput: any): ToolParameter[] {
    if (!toolInput || typeof toolInput !== 'object') {
      return [];
    }

    return Object.entries(toolInput).map(([name, value]) => ({
      name,
      type: this.inferParameterType(value),
      value,
      required: true, // Assume required since it's provided
      sensitive: this.isSensitiveParameter(name),
      description: this.getParameterDescription(name)
    }));
  }

  /**
   * Format tool result for display
   */
  formatToolResult(toolName: string, result: any): {
    type: string;
    content: string;
    visualization?: any;
  } {
    try {
      // Handle different tool result formats
      switch (toolName) {
        case 'Bash':
          return this.formatBashResult(result);
        
        case 'Read':
        case 'Edit':
        case 'Write':
        case 'MultiEdit':
          return this.formatFileResult(result);
        
        case 'Glob':
        case 'Grep':
        case 'LS':
          return this.formatSearchResult(result);
        
        case 'WebFetch':
        case 'WebSearch':
          return this.formatWebResult(result);
        
        case 'TodoRead':
        case 'TodoWrite':
          return this.formatTodoResult(result);
        
        default:
          return this.formatGenericResult(result);
      }
    } catch (error) {
      this.logger.error('Failed to format tool result', {
        toolName,
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        type: 'error',
        content: `Failed to format result: ${error}`
      };
    }
  }

  /**
   * Load tool permissions from settings
   */
  async loadToolPermissions(): Promise<ToolPermissions> {
    try {
      const savedSettings = localStorage.getItem('claude-tools-settings');
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return {
          allowedTools: settings.allowedTools || [],
          disallowedTools: settings.disallowedTools || [],
          skipPermissions: settings.skipPermissions || false,
          requireConfirmation: settings.requireConfirmation || []
        };
      }

      // Default permissions
      return {
        allowedTools: [],
        disallowedTools: [],
        skipPermissions: false,
        requireConfirmation: ['Bash(rm:*)', 'Bash(sudo:*)', 'Write']
      };
    } catch (error) {
      this.logger.error('Failed to load tool permissions', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Return safe defaults
      return {
        allowedTools: [],
        disallowedTools: [],
        skipPermissions: false,
        requireConfirmation: []
      };
    }
  }

  /**
   * Save tool permissions to settings
   */
  async saveToolPermissions(permissions: ToolPermissions): Promise<void> {
    try {
      const settings = {
        allowedTools: permissions.allowedTools,
        disallowedTools: permissions.disallowedTools,
        skipPermissions: permissions.skipPermissions,
        requireConfirmation: permissions.requireConfirmation,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('claude-tools-settings', JSON.stringify(settings));

      this.logger.info('Tool permissions saved', {
        allowedCount: permissions.allowedTools.length,
        disallowedCount: permissions.disallowedTools.length,
        skipPermissions: permissions.skipPermissions
      });
    } catch (error) {
      this.logger.error('Failed to save tool permissions', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get tool execution metrics
   */
  getToolMetrics(): ToolMetrics[] {
    return Array.from(this.executionMetrics.values());
  }

  /**
   * Check if tool requires confirmation
   */
  requiresConfirmation(toolName: string, toolInput: any, permissions: ToolPermissions): boolean {
    if (permissions.skipPermissions) {
      return false;
    }

    // Check exact tool name
    if (permissions.requireConfirmation.includes(toolName)) {
      return true;
    }

    // Check pattern matches (e.g., "Bash(rm:*)")
    return permissions.requireConfirmation.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(`${toolName}(${this.getToolSignature(toolInput)})`);
      }
      return false;
    });
  }

  // Private helper methods

  private updateToolMetrics(result: ToolResult): void {
    const existing = this.executionMetrics.get(result.tool_name);
    
    if (existing) {
      existing.executionCount++;
      existing.lastUsed = new Date();
      if (!result.success) {
        existing.errorCount++;
      }
      existing.successRate = (existing.executionCount - existing.errorCount) / existing.executionCount;
    } else {
      this.executionMetrics.set(result.tool_name, {
        toolName: result.tool_name,
        executionCount: 1,
        averageExecutionTime: 0,
        successRate: result.success ? 1 : 0,
        lastUsed: new Date(),
        errorCount: result.success ? 0 : 1,
        popularParameters: {}
      });
    }
  }

  private inferParameterType(value: any): 'string' | 'number' | 'boolean' | 'object' | 'array' {
    if (Array.isArray(value)) return 'array';
    if (value === null || value === undefined) return 'string';
    return typeof value as any;
  }

  private isSensitiveParameter(name: string): boolean {
    const sensitiveParams = ['password', 'token', 'key', 'secret', 'auth', 'credential'];
    return sensitiveParams.some(param => name.toLowerCase().includes(param));
  }

  private getParameterDescription(name: string): string | undefined {
    // Tool parameter descriptions
    const descriptions: Record<string, string> = {
      command: 'Shell command to execute',
      file_path: 'Path to the file',
      content: 'File content',
      pattern: 'Search pattern or glob pattern',
      url: 'Web URL to fetch',
      query: 'Search query',
      old_string: 'Text to replace',
      new_string: 'Replacement text'
    };
    
    return descriptions[name];
  }

  private getToolSignature(toolInput: any): string {
    if (toolInput.command) return toolInput.command.split(' ')[0];
    if (toolInput.file_path) return toolInput.file_path;
    if (toolInput.pattern) return toolInput.pattern;
    return '';
  }

  private formatBashResult(result: any): { type: string; content: string } {
    if (typeof result === 'string') {
      return { type: 'bash', content: result };
    }
    
    if (result?.stdout || result?.stderr) {
      let content = '';
      if (result.stdout) content += result.stdout;
      if (result.stderr) content += result.stderr ? `\nSTDERR:\n${result.stderr}` : '';
      return { type: 'bash', content };
    }
    
    return { type: 'bash', content: String(result) };
  }

  private formatFileResult(result: any): { type: string; content: string } {
    if (typeof result === 'string') {
      return { type: 'file', content: result };
    }
    
    return { type: 'file', content: JSON.stringify(result, null, 2) };
  }

  private formatSearchResult(result: any): { type: string; content: string } {
    if (Array.isArray(result)) {
      return { type: 'list', content: result.join('\n') };
    }
    
    return { type: 'search', content: String(result) };
  }

  private formatWebResult(result: any): { type: string; content: string } {
    if (typeof result === 'string') {
      return { type: 'web', content: result };
    }
    
    return { type: 'web', content: JSON.stringify(result, null, 2) };
  }

  private formatTodoResult(result: any): { type: string; content: string } {
    if (Array.isArray(result)) {
      const todoList = result.map(todo => 
        `${todo.status === 'completed' ? '✅' : '⏳'} ${todo.content}`
      ).join('\n');
      return { type: 'todo', content: todoList };
    }
    
    return { type: 'todo', content: String(result) };
  }

  private formatGenericResult(result: any): { type: string; content: string } {
    if (typeof result === 'string') {
      return { type: 'text', content: result };
    }
    
    return { type: 'json', content: JSON.stringify(result, null, 2) };
  }
}

// Export singleton instance
export const toolsAPI = ToolsAPI.getInstance();