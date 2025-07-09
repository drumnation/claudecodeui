import { createLogger } from '@kit/logger/node';
import { StatusEnvelope, createStatusEnvelope, Phase, ToolStatus, TokenUsage } from '../types/status';

const logger = createLogger({ scope: 'status-parser' });

export interface ParserOptions {
  enableDebug?: boolean;
  fallbackOnError?: boolean;
  preserveRawOutput?: boolean;
}

export class StatusParser {
  private options: Required<ParserOptions>;
  
  // Improved regex patterns for various CLI output formats
  private patterns = {
    // JSON status pattern
    jsonStatus: /\{[^{}]*"(status|type|phase|message|text)"[^{}]*\}/,
    
    // ANSI escape sequences
    ansiCodes: /\x1b\[[0-9;]*m/g,
    
    // Token count patterns
    tokenCount: /(?:⚒\s*)?(\d+(?:,\d{3})*|\d+)\s*(?:tokens?|usage)/i,
    tokenDetails: /input[\s:]*(\d+).*output[\s:]*(\d+).*(?:total[\s:]*(\d+))?/i,
    cacheTokens: /cache[\s:]*(?:read[\s:]*(\d+))?.*(?:write[\s:]*(\d+))?/i,
    
    // Tool execution patterns
    toolRunning: /(?:running|executing|calling)[\s:]+(\w+)/i,
    toolComplete: /(?:completed|finished|done)[\s:]+(\w+)(?:.*?(\d+(?:\.\d+)?)\s*(?:ms|seconds?))?/i,
    toolError: /(?:error|failed)[\s:]+(\w+)[\s:]*(.*)/i,
    
    // Phase detection patterns
    phaseThinking: /thinking|pondering|considering|analyzing/i,
    phaseProcessing: /processing|working|handling|executing/i,
    phaseExecuting: /running|executing|calling|invoking/i,
    phaseComplete: /complete|finished|done|success/i,
    phaseError: /error|failed|failure|exception/i,
    
    // Context remaining pattern
    contextRemaining: /(?:context|remaining)[\s:]*(\d+(?:\.\d+)?%?)/i,
    
    // Interrupt/cancel pattern
    canInterrupt: /(?:can\s+)?(?:interrupt|cancel|stop)[\s:]*(?:yes|true|enabled)|esc to interrupt/i,
    
    // Multi-line status capture
    statusBlock: /^(?:status|update|info)[\s:]*(.+?)(?=^(?:status|update|info)|\z)/mis,
    
    // Claude CLI status line pattern (e.g., "✻ Working... (⚒ 250 tokens · esc to interrupt)")
    claudeStatus: /^[✻✹✸✶•]\s*([^(]*?)(?:\s*\(|$)/
  };
  
  constructor(options: ParserOptions = {}) {
    this.options = {
      enableDebug: options.enableDebug ?? false,
      fallbackOnError: options.fallbackOnError ?? true,
      preserveRawOutput: options.preserveRawOutput ?? false
    };
  }
  
  /**
   * Parse CLI output and extract status information
   */
  parseCliOutput(output: string, type: 'stdout' | 'stderr' = 'stdout'): StatusEnvelope | null {
    if (!output || typeof output !== 'string') {
      return null;
    }
    
    try {
      // Try JSON parsing first
      const jsonStatus = this.extractStatusFromJson(output);
      if (jsonStatus) {
        return jsonStatus;
      }
      
      // Fall back to text parsing
      const textStatus = this.extractStatusFromText(output);
      if (textStatus) {
        return textStatus;
      }
      
      // If no structured data found but we have output, create a basic status
      if (this.options.fallbackOnError && output.trim()) {
        return this.createBasicStatus(output, type);
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to parse CLI output', { error, outputLength: output.length });
      
      if (this.options.fallbackOnError) {
        return this.createBasicStatus(output, type);
      }
      
      return null;
    }
  }
  
  /**
   * Extract status from JSON format
   */
  extractStatusFromJson(output: string): StatusEnvelope | null {
    const match = output.match(this.patterns.jsonStatus);
    if (!match) {
      return null;
    }
    
    try {
      const jsonStr = match[0];
      const parsed = JSON.parse(jsonStr);
      
      // Map various JSON formats to our standard schema
      const status = createStatusEnvelope({
        phase: this.detectPhase(parsed.phase || parsed.type || parsed.status),
        message: parsed.message || parsed.text || parsed.status || '',
        tokens: this.extractTokensFromObject(parsed),
        toolStatus: this.extractToolStatusFromObject(parsed),
        canInterrupt: parsed.canInterrupt ?? parsed.canCancel ?? undefined,
        contextRemaining: parsed.contextRemaining ?? parsed.remainingContext ?? undefined
      });
      
      if (this.options.preserveRawOutput) {
        status.rawOutput = output;
      }
      
      if (this.options.enableDebug) {
        status.debug = { parsed, raw: jsonStr };
      }
      
      return status;
    } catch (error) {
      logger.debug('JSON parse failed', { error });
      return null;
    }
  }
  
  /**
   * Extract status from text format
   */
  extractStatusFromText(output: string): StatusEnvelope | null {
    // Remove ANSI codes for cleaner parsing
    const cleanOutput = this.sanitizeOutput(output);
    
    // Extract various components
    const phase = this.detectPhaseFromText(cleanOutput);
    const tokens = this.extractTokensFromText(cleanOutput);
    const toolStatus = this.extractToolStatusFromText(cleanOutput);
    const contextRemaining = this.extractContextRemaining(cleanOutput);
    const canInterrupt = this.patterns.canInterrupt.test(cleanOutput);
    
    // Extract main message
    let message = cleanOutput;
    
    // Try to extract from Claude CLI status line first
    const claudeStatusMatch = cleanOutput.match(this.patterns.claudeStatus);
    if (claudeStatusMatch) {
      message = claudeStatusMatch[1].trim();
    } else {
      // Fall back to status block
      const statusBlockMatch = cleanOutput.match(this.patterns.statusBlock);
      if (statusBlockMatch) {
        message = statusBlockMatch[1].trim();
      }
    }
    
    // If we have at least a phase or message, create status
    if (phase !== Phase.IDLE || message) {
      const status = createStatusEnvelope({
        phase,
        message,
        tokens,
        toolStatus,
        canInterrupt,
        contextRemaining
      });
      
      if (this.options.preserveRawOutput) {
        status.rawOutput = output;
      }
      
      if (this.options.enableDebug) {
        status.debug = { cleanOutput, extractedComponents: { phase, tokens, toolStatus } };
      }
      
      return status;
    }
    
    return null;
  }
  
  /**
   * Sanitize output by removing ANSI codes and normalizing whitespace
   */
  sanitizeOutput(output: string): string {
    return output
      .replace(this.patterns.ansiCodes, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();
  }
  
  /**
   * Create a status envelope from parsed data
   */
  createStatusEnvelope(data: Partial<StatusEnvelope>): StatusEnvelope {
    return createStatusEnvelope(data);
  }
  
  /**
   * Validate and enhance an existing status object
   */
  validateAndEnhanceStatus(status: any): StatusEnvelope {
    if (!status || typeof status !== 'object') {
      return createStatusEnvelope({
        phase: Phase.PROCESSING,
        message: 'Processing...'
      });
    }
    
    // Ensure all required fields are present
    const enhanced = createStatusEnvelope({
      phase: this.detectPhase(status.phase || status.type),
      message: status.message || status.text || status.status || 'Processing...',
      tokens: status.tokens || undefined,
      toolStatus: status.toolStatus || undefined,
      canInterrupt: status.canInterrupt ?? undefined,
      contextRemaining: status.contextRemaining ?? undefined
    });
    
    return enhanced;
  }
  
  private detectPhase(phaseStr?: string): Phase {
    if (!phaseStr) {
      return Phase.IDLE;
    }
    
    const phaseLower = phaseStr.toLowerCase();
    
    if (this.patterns.phaseError.test(phaseLower)) {
      return Phase.ERROR;
    }
    if (this.patterns.phaseComplete.test(phaseLower)) {
      return Phase.COMPLETE;
    }
    if (this.patterns.phaseThinking.test(phaseLower)) {
      return Phase.THINKING;
    }
    if (this.patterns.phaseExecuting.test(phaseLower)) {
      return Phase.EXECUTING;
    }
    if (this.patterns.phaseProcessing.test(phaseLower)) {
      return Phase.PROCESSING;
    }
    
    return Phase.PROCESSING; // Default
  }
  
  private detectPhaseFromText(text: string): Phase {
    if (this.patterns.phaseError.test(text)) {
      return Phase.ERROR;
    }
    if (this.patterns.phaseComplete.test(text)) {
      return Phase.COMPLETE;
    }
    if (this.patterns.phaseThinking.test(text)) {
      return Phase.THINKING;
    }
    if (this.patterns.phaseExecuting.test(text)) {
      return Phase.EXECUTING;
    }
    if (this.patterns.phaseProcessing.test(text)) {
      return Phase.PROCESSING;
    }
    
    return Phase.IDLE;
  }
  
  private extractTokensFromObject(obj: any): TokenUsage | undefined {
    if (!obj) {
      return undefined;
    }
    
    // Direct token object
    if (obj.tokens && typeof obj.tokens === 'object') {
      return {
        input: obj.tokens.input,
        output: obj.tokens.output,
        total: obj.tokens.total,
        cache: obj.tokens.cache
      };
    }
    
    // Flat structure
    const tokens: TokenUsage = {};
    if (typeof obj.inputTokens === 'number') tokens.input = obj.inputTokens;
    if (typeof obj.outputTokens === 'number') tokens.output = obj.outputTokens;
    if (typeof obj.totalTokens === 'number') tokens.total = obj.totalTokens;
    if (typeof obj.tokenCount === 'number') tokens.total = obj.tokenCount;
    if (typeof obj.tokens === 'number') tokens.total = obj.tokens;
    
    return Object.keys(tokens).length > 0 ? tokens : undefined;
  }
  
  private extractTokensFromText(text: string): TokenUsage | undefined {
    const tokens: TokenUsage = {};
    
    // Try detailed token extraction
    const detailMatch = text.match(this.patterns.tokenDetails);
    if (detailMatch) {
      if (detailMatch[1]) tokens.input = parseInt(detailMatch[1].replace(/,/g, ''));
      if (detailMatch[2]) tokens.output = parseInt(detailMatch[2].replace(/,/g, ''));
      if (detailMatch[3]) tokens.total = parseInt(detailMatch[3].replace(/,/g, ''));
    } else {
      // Try simple token count
      const countMatch = text.match(this.patterns.tokenCount);
      if (countMatch) {
        tokens.total = parseInt(countMatch[1].replace(/,/g, ''));
      }
    }
    
    // Try cache tokens
    const cacheMatch = text.match(this.patterns.cacheTokens);
    if (cacheMatch) {
      tokens.cache = {};
      if (cacheMatch[1]) tokens.cache.read = parseInt(cacheMatch[1].replace(/,/g, ''));
      if (cacheMatch[2]) tokens.cache.write = parseInt(cacheMatch[2].replace(/,/g, ''));
    }
    
    return Object.keys(tokens).length > 0 ? tokens : undefined;
  }
  
  private extractToolStatusFromObject(obj: any): ToolStatus | undefined {
    if (!obj) {
      return undefined;
    }
    
    // Direct tool status
    if (obj.toolStatus && typeof obj.toolStatus === 'object') {
      return obj.toolStatus;
    }
    
    // Tool or tool_status field
    if ((obj.tool || obj.tool_status) && typeof (obj.tool || obj.tool_status) === 'object') {
      const tool = obj.tool || obj.tool_status;
      return {
        name: tool.name || '',
        status: tool.status || 'running',
        duration: tool.duration,
        message: tool.message
      };
    }
    
    return undefined;
  }
  
  private extractToolStatusFromText(text: string): ToolStatus | undefined {
    // Check for tool completion
    const completeMatch = text.match(this.patterns.toolComplete);
    if (completeMatch) {
      return {
        name: completeMatch[1],
        status: 'complete',
        duration: completeMatch[2] ? parseFloat(completeMatch[2]) : undefined
      };
    }
    
    // Check for tool error
    const errorMatch = text.match(this.patterns.toolError);
    if (errorMatch) {
      return {
        name: errorMatch[1],
        status: 'error',
        message: errorMatch[2].trim()
      };
    }
    
    // Check for tool running
    const runningMatch = text.match(this.patterns.toolRunning);
    if (runningMatch) {
      return {
        name: runningMatch[1],
        status: 'running'
      };
    }
    
    return undefined;
  }
  
  private extractContextRemaining(text: string): number | undefined {
    const match = text.match(this.patterns.contextRemaining);
    if (match) {
      const value = parseFloat(match[1]);
      // If it's a percentage, keep as is. Otherwise assume it's a ratio
      return match[1].includes('%') ? value : value * 100;
    }
    return undefined;
  }
  
  private createBasicStatus(output: string, type: 'stdout' | 'stderr'): StatusEnvelope {
    const cleanOutput = this.sanitizeOutput(output);
    const phase = type === 'stderr' ? Phase.ERROR : Phase.PROCESSING;
    
    return createStatusEnvelope({
      phase,
      message: cleanOutput.substring(0, 200) // Limit message length
    });
  }
}

/**
 * Factory function to create a status parser
 */
export function createStatusParser(options?: ParserOptions): StatusParser {
  return new StatusParser(options);
}