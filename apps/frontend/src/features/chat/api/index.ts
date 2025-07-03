/**
 * Chat Feature API Layer - Domain-specific API abstractions
 * Following Bulletproof React pattern for centralized API management
 */

import { defaultLogger as log } from '@kit/logger/browser';
import type { WSMessage } from '@/utils/websocket';
import type { ChatMessage } from '../types';

/**
 * Chat API service for managing WebSocket communication
 */
export class ChatAPI {
  private static instance: ChatAPI;
  private logger = log.child({ scope: 'ChatAPI' });
  private loadingSessionsMap = new Map<string, { timestamp: number; timeout: NodeJS.Timeout }>();
  private readonly SESSION_LOADING_TIMEOUT = 30000; // 30 seconds

  static getInstance(): ChatAPI {
    if (!ChatAPI.instance) {
      ChatAPI.instance = new ChatAPI();
    }
    return ChatAPI.instance;
  }

  /**
   * Send user message to chat session
   */
  sendUserMessage(
    ws: WebSocket | null,
    projectName: string,
    sessionId: string | null,
    message: string,
    sendMessage: (msg: WSMessage) => void
  ): void {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.logger.warn('WebSocket not available for sending message', {
        readyState: ws?.readyState,
        projectName,
        sessionId
      });
      return;
    }

    this.logger.info('Sending user message', {
      projectName,
      sessionId,
      messageLength: message.length,
      timestamp: Date.now()
    });

    const wsMessage: WSMessage = {
      type: 'user_message',
      projectName,
      sessionId,
      message,
      timestamp: new Date().toISOString()
    };

    sendMessage(wsMessage);
  }

  /**
   * Request session history from server with deduplication
   */
  loadSessionHistory(
    ws: WebSocket | null,
    projectName: string,
    sessionId: string,
    sendMessage: (msg: WSMessage) => void
  ): void {
    // Validate inputs
    if (!projectName || !sessionId) {
      this.logger.warn('Cannot load session history: missing required parameters', {
        projectName: !!projectName,
        sessionId: !!sessionId
      });
      return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.logger.warn('WebSocket not available for loading session', {
        readyState: ws?.readyState,
        projectName,
        sessionId
      });
      return;
    }

    const sessionKey = `${projectName}_${sessionId}`;

    // Check if this session is already being loaded
    const existingLoad = this.loadingSessionsMap.get(sessionKey);
    if (existingLoad) {
      const timeSinceStart = Date.now() - existingLoad.timestamp;
      if (timeSinceStart < this.SESSION_LOADING_TIMEOUT) {
        this.logger.debug('Session already being loaded, ignoring duplicate request', {
          sessionKey,
          timeSinceStart,
          projectName,
          sessionId
        });
        return;
      } else {
        // Clear stale loading state
        clearTimeout(existingLoad.timeout);
        this.loadingSessionsMap.delete(sessionKey);
        this.logger.warn('Clearing stale session loading state', {
          sessionKey,
          staleDuration: timeSinceStart
        });
      }
    }

    this.logger.info('Loading session history', {
      projectName,
      sessionId,
      sessionKey
    });

    // Mark session as loading
    const timeout = setTimeout(() => {
      this.loadingSessionsMap.delete(sessionKey);
      this.logger.warn('Session loading timed out', {
        sessionKey,
        timeout: this.SESSION_LOADING_TIMEOUT
      });
    }, this.SESSION_LOADING_TIMEOUT);

    this.loadingSessionsMap.set(sessionKey, {
      timestamp: Date.now(),
      timeout
    });

    const wsMessage: WSMessage = {
      type: 'load_session',
      projectName,
      sessionId
    };

    sendMessage(wsMessage);
  }

  /**
   * Mark session as loaded and clear loading state
   */
  markSessionLoaded(projectName: string, sessionId: string): void {
    const sessionKey = `${projectName}_${sessionId}`;
    const loadingState = this.loadingSessionsMap.get(sessionKey);
    
    if (loadingState) {
      clearTimeout(loadingState.timeout);
      this.loadingSessionsMap.delete(sessionKey);
      
      this.logger.debug('Session loading completed', {
        sessionKey,
        loadingDuration: Date.now() - loadingState.timestamp
      });
    }
  }

  /**
   * Abort ongoing chat session
   */
  abortSession(
    ws: WebSocket | null,
    sendMessage: (msg: WSMessage) => void
  ): void {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.logger.warn('WebSocket not available for aborting session', {
        readyState: ws?.readyState
      });
      return;
    }

    this.logger.info('Aborting chat session');

    const wsMessage: WSMessage = {
      type: 'abort-session'
    };

    sendMessage(wsMessage);
  }

  /**
   * Process incoming WebSocket messages for chat feature
   */
  processIncomingMessage(
    message: WSMessage,
    onMessageUpdate: (chatMessage: ChatMessage) => void,
    onSessionEvent: (event: string, data?: any) => void
  ): boolean {
    // Return true if message was handled by chat feature
    switch (message.type) {
      case 'claude-response':
        // Handle Claude CLI stream-json format messages
        if (message.data) {
          // TRACE: Log the exact structure we receive
          console.log('🎯 CLAUDE-RESPONSE EXACT STRUCTURE:', JSON.stringify(message.data, null, 2));
          
          // Also log to see if we're getting the right message types
          if (message.data?.type) {
            console.log('🔍 Message data type:', message.data.type);
          }
          if (message.data?.message?.type) {
            console.log('🔍 Nested message type:', message.data.message.type);
          }
          
          // Log if this is a tool_use type message
          if (message.data?.type === 'tool_use' || message.data?.tool_use) {
            console.log('🔧 TOOL USE DETECTED IN DATA:', {
              type: message.data.type,
              tool_use: message.data.tool_use,
              name: message.data.name || message.data.tool_use?.name,
              input: message.data.input || message.data.tool_use?.input
            });
          }
          
          this.logger.info('Processing claude-response - FULL DATA:', {
            fullData: message.data,
            dataType: message.data.type,
            hasContent: !!message.data.content,
            contentType: typeof message.data.content,
            hasToolUse: !!message.data.tool_use,
            hasToolResult: !!message.data.tool_result,
            hasMessage: !!message.data.message,
            messageType: message.data.message?.type
          });
          
          // First check if the entire data object might be a tool use message
          if (message.data.type === 'tool_use' && message.data.name && message.data.input) {
            this.logger.info('Direct tool_use message detected', {
              toolName: message.data.name,
              hasInput: !!message.data.input
            });
            
            const chatMessage: ChatMessage = {
              type: 'assistant',
              content: '',
              id: message.data.id || `tool-${Date.now()}`,
              timestamp: message.data.timestamp || new Date().toISOString(),
              tool_name: message.data.name,
              toolName: message.data.name,
              tool_input: message.data.input,
              toolInput: message.data.input,
              isToolUse: true,
              toolId: message.data.id
            };
            onMessageUpdate(chatMessage);
            return true;
          }
          
          // Handle different message types from Claude
          // First check if this is a wrapped message structure
          if (message.data.type === 'message' && message.data.message) {
            const innerMessage = message.data.message;
            this.logger.info('Processing wrapped message structure', {
              innerType: innerMessage.type,
              innerRole: innerMessage.role,
              hasContent: !!innerMessage.content,
              contentType: Array.isArray(innerMessage.content) ? 'array' : typeof innerMessage.content
            });
            
            // Process the inner message
            if (innerMessage.role === 'assistant' && Array.isArray(innerMessage.content)) {
              // Check if we have both text/image and tool_use in the same message
              const hasToolUse = innerMessage.content.some((block: any) => block.type === 'tool_use');
              const hasTextOrImage = innerMessage.content.some((block: any) => block.type === 'text' || block.type === 'image');
              
              if (hasTextOrImage) {
                // Send the entire content array for assistant messages to preserve images
                const chatMessage: ChatMessage = {
                  type: 'assistant',
                  content: innerMessage.content, // Pass the entire array
                  id: `${message.data.id || Date.now()}-assistant`,
                  timestamp: message.data.timestamp || new Date().toISOString()
                };
                onMessageUpdate(chatMessage);
              }
              
              // Process tool uses separately
              if (hasToolUse) {
                innerMessage.content.forEach((contentBlock: any) => {
                  if (contentBlock.type === 'tool_use') {
                    this.logger.info('Tool use found in wrapped message!', {
                      toolName: contentBlock.name,
                      hasInput: !!contentBlock.input
                    });
                    const chatMessage: ChatMessage = {
                      type: 'assistant',
                      content: '',
                      id: contentBlock.id || `${message.data.id || Date.now()}-tool`,
                      timestamp: message.data.timestamp || new Date().toISOString(),
                      tool_name: contentBlock.name,
                      toolName: contentBlock.name,
                      tool_input: contentBlock.input,
                      toolInput: contentBlock.input,
                      isToolUse: true,
                      toolId: contentBlock.id
                    };
                    onMessageUpdate(chatMessage);
                  }
                });
              }
              return true;
            } else if (innerMessage.role === 'user') {
              // Check if this is a real user message or Claude's output
              const messageText = typeof innerMessage.content === 'string' 
                ? innerMessage.content 
                : Array.isArray(innerMessage.content) && innerMessage.content[0]?.text 
                  ? innerMessage.content[0].text 
                  : '';
              
              // Skip messages that look like tool results or system messages
              if (messageText.includes('have been modified successfully') ||
                  messageText.includes('have been updated successfully') ||
                  messageText.includes('have been created successfully') ||
                  messageText.startsWith('System:') ||
                  messageText.startsWith('Tool result:')) {
                this.logger.info('Skipping tool result/system message disguised as user message', {
                  messagePreview: messageText.substring(0, 100)
                });
                return true;
              }
              
              // Skip if this looks like an echoed user message
              this.logger.info('Processing potential user message', {
                messagePreview: messageText.substring(0, 100)
              });
              
              // Only show as user message if it doesn't look like Claude's output
              if (!messageText.includes('"type":"tool_use"') && !messageText.includes('"tool_name"')) {
                const chatMessage: ChatMessage = {
                  type: 'user',
                  content: messageText,
                  id: message.data.id || `msg-${Date.now()}`,
                  timestamp: message.data.timestamp || new Date().toISOString()
                };
                onMessageUpdate(chatMessage);
              }
              return true;
            }
          }
          
          // Original handling
          if (message.data.type === 'message' && message.data.role) {
            const role = message.data.role;
            
            if (role === 'user') {
              // User message
              const chatMessage: ChatMessage = {
                type: 'user',
                content: message.data.content || '',
                id: message.data.id || `msg-${Date.now()}`,
                timestamp: message.data.timestamp || new Date().toISOString()
              };
              onMessageUpdate(chatMessage);
              return true;
            } else if (role === 'assistant') {
              // Assistant message - check for tool use
              if (message.data.content && Array.isArray(message.data.content)) {
                // Check if we have both text/image and tool_use in the same message
                const hasToolUse = message.data.content.some((block: any) => block.type === 'tool_use');
                const hasTextOrImage = message.data.content.some((block: any) => block.type === 'text' || block.type === 'image');
                
                if (hasTextOrImage) {
                  // Send the entire content array for assistant messages to preserve images
                  const chatMessage: ChatMessage = {
                    type: 'assistant',
                    content: message.data.content, // Pass the entire array
                    id: `${message.data.id || Date.now()}-assistant`,
                    timestamp: message.data.timestamp || new Date().toISOString()
                  };
                  onMessageUpdate(chatMessage);
                }
                
                // Process tool uses separately
                if (hasToolUse) {
                  message.data.content.forEach((contentBlock: any) => {
                    if (contentBlock.type === 'tool_use') {
                      const chatMessage: ChatMessage = {
                        type: 'assistant',
                        content: '',
                        id: contentBlock.id || `${message.data.id || Date.now()}-tool`,
                        timestamp: message.data.timestamp || new Date().toISOString(),
                        tool_name: contentBlock.name,
                        toolName: contentBlock.name,
                        tool_input: contentBlock.input,
                        toolInput: contentBlock.input,
                        isToolUse: true,
                        toolId: contentBlock.id
                      };
                      onMessageUpdate(chatMessage);
                    }
                  });
                }
                return true;
              } else if (typeof message.data.content === 'string') {
                const chatMessage: ChatMessage = {
                  type: 'assistant',
                  content: message.data.content,
                  id: message.data.id || `msg-${Date.now()}`,
                  timestamp: message.data.timestamp || new Date().toISOString()
                };
                onMessageUpdate(chatMessage);
                return true;
              }
            }
          } else if (message.data.type === 'tool_result') {
            // Handle tool result by finding and updating the corresponding tool use message
            this.logger.debug('Processing tool result', {
              toolId: message.data.tool_use_id,
              hasContent: !!message.data.content,
              contentLength: message.data.content?.length
            });
            
            // Create a tool result update message
            const toolResultUpdate: ChatMessage = {
              type: 'tool_result',
              content: '',
              id: message.data.tool_use_id || `tool-result-${Date.now()}`,
              timestamp: new Date().toISOString(),
              tool_result: message.data.content,
              toolResult: message.data.content,
              isToolUse: true
            };
            onMessageUpdate(toolResultUpdate);
            return true;
          } else if (message.data.message) {
            // Handle cases where the message is nested in a message property
            this.logger.info('Processing nested message structure', {
              messageType: message.data.message.type,
              messageRole: message.data.message.role,
              hasContent: !!message.data.message.content
            });
            
            if (message.data.message.type === 'message' && message.data.message.role === 'assistant') {
              // Check if content has tool use
              if (message.data.message.content && Array.isArray(message.data.message.content)) {
                // Check if we have both text/image and tool_use in the same message
                const hasToolUse = message.data.message.content.some((block: any) => block.type === 'tool_use');
                const hasTextOrImage = message.data.message.content.some((block: any) => block.type === 'text' || block.type === 'image');
                
                if (hasTextOrImage) {
                  // Send the entire content array for assistant messages to preserve images
                  const chatMessage: ChatMessage = {
                    type: 'assistant',
                    content: message.data.message.content, // Pass the entire array
                    id: `${message.data.id || Date.now()}-assistant`,
                    timestamp: message.data.timestamp || new Date().toISOString()
                  };
                  onMessageUpdate(chatMessage);
                }
                
                // Process tool uses separately
                if (hasToolUse) {
                  message.data.message.content.forEach((contentBlock: any) => {
                    if (contentBlock.type === 'tool_use') {
                      const chatMessage: ChatMessage = {
                        type: 'assistant',
                        content: '',
                        id: contentBlock.id || `${message.data.id || Date.now()}-tool`,
                        timestamp: message.data.timestamp || new Date().toISOString(),
                        tool_name: contentBlock.name,
                        toolName: contentBlock.name,
                        tool_input: contentBlock.input,
                        toolInput: contentBlock.input,
                        isToolUse: true,
                        toolId: contentBlock.id
                      };
                      onMessageUpdate(chatMessage);
                    }
                  });
                }
                return true;
              }
            }
          } else {
            // Fallback: Check if the content looks like it contains tool use
            this.logger.info('Checking for tool use in other formats', {
              dataKeys: Object.keys(message.data),
              contentPreview: JSON.stringify(message.data).substring(0, 200)
            });
            
            // If we have a string content that looks like it contains tool_use, try to parse it
            if (message.data.content && typeof message.data.content === 'string' && 
                message.data.content.includes('"type":"tool_use"')) {
              this.logger.warn('Found tool_use in string content - attempting to parse');
              
              try {
                // Try to parse the string as JSON
                const parsed = JSON.parse(message.data.content);
                
                // Check if it's a tool_use message
                if (parsed.type === 'tool_use' && parsed.name && parsed.input) {
                  this.logger.info('Successfully parsed tool_use from string content', {
                    toolName: parsed.name,
                    hasInput: !!parsed.input
                  });
                  
                  const chatMessage: ChatMessage = {
                    type: 'assistant',
                    content: '',
                    id: parsed.id || message.data.id || `tool-${Date.now()}`,
                    timestamp: message.data.timestamp || new Date().toISOString(),
                    tool_name: parsed.name,
                    toolName: parsed.name,
                    tool_input: parsed.input,
                    toolInput: parsed.input,
                    isToolUse: true,
                    toolId: parsed.id
                  };
                  onMessageUpdate(chatMessage);
                  return true;
                }
              } catch (e) {
                this.logger.error('Failed to parse tool_use from string content', { error: e });
              }
              
              // Fallback: send as assistant message
              const chatMessage: ChatMessage = {
                type: 'assistant',
                content: message.data.content,
                id: message.data.id || `msg-${Date.now()}`,
                timestamp: message.data.timestamp || new Date().toISOString()
              };
              onMessageUpdate(chatMessage);
              return true;
            }
            
            // ADDITIONAL CHECK: Handle the case where tool_use is nested directly in data
            if (message.data.tool_use && typeof message.data.tool_use === 'object') {
              const toolUse = message.data.tool_use;
              this.logger.info('Tool use found nested in data.tool_use!', {
                toolName: toolUse.name,
                hasInput: !!toolUse.input,
                toolId: toolUse.id
              });
              
              const chatMessage: ChatMessage = {
                type: 'assistant',
                content: '',
                id: toolUse.id || message.data.id || `tool-${Date.now()}`,
                timestamp: message.data.timestamp || new Date().toISOString(),
                tool_name: toolUse.name,
                toolName: toolUse.name,
                tool_input: toolUse.input,
                toolInput: toolUse.input,
                isToolUse: true,
                toolId: toolUse.id
              };
              onMessageUpdate(chatMessage);
              return true;
            }
          }
        }
        return false;
        
      case 'chat_message':
      case 'user_message':
      case 'assistant_message':
      case 'tool_use':
        this.logger.info('Direct tool_use message type received', {
          messageId: message.id,
          toolName: message.tool_name,
          hasInput: !!message.tool_input,
          timestamp: message.timestamp
        });
        
        const toolMessage: ChatMessage = {
          type: 'assistant',
          content: '',
          id: message.id || `tool-${Date.now()}`,
          timestamp: message.timestamp || new Date().toISOString(),
          tool_name: message.tool_name,
          toolName: message.tool_name,
          tool_input: message.tool_input,
          toolInput: message.tool_input,
          isToolUse: true,
          toolId: message.id
        };
        onMessageUpdate(toolMessage);
        return true;
        
      case 'tool_result':
      case 'error':
        this.logger.debug('Processing chat message', {
          type: message.type,
          messageId: message.id,
          timestamp: message.timestamp
        });
        
        const chatMessage: ChatMessage = {
          type: message.type as ChatMessage['type'],
          content: message.content || message.message,
          id: message.id,
          timestamp: message.timestamp,
          tool_name: message.tool_name,
          tool_input: message.tool_input,
          tool_result: message.tool_result,
          toolError: message.toolError,
          isToolUse: message.type === 'tool_use',
          inline: message.inline
        };
        
        onMessageUpdate(chatMessage);
        return true;

      case 'session-created':
        this.logger.info('Session created', {
          sessionId: message.sessionId,
          projectName: message.projectName
        });
        onSessionEvent('session-created', message);
        return true;

      case 'claude-complete':
        this.logger.info('Claude response completed');
        onSessionEvent('claude-complete', message);
        return true;

      case 'session-aborted':
        this.logger.info('Session aborted');
        onSessionEvent('session-aborted', message);
        return true;

      case 'claude-status':
        onSessionEvent('claude-status', message);
        return true;

      default:
        return false; // Message not handled by chat feature
    }
  }

  /**
   * Generate temporary session ID for new sessions
   */
  generateTemporarySessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `new-session-${timestamp}-${random}`;
  }

  /**
   * Validate message content before sending
   */
  validateMessage(message: string): { valid: boolean; error?: string } {
    if (!message || message.trim().length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (message.length > 50000) {
      return { valid: false, error: 'Message too long (max 50,000 characters)' };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const chatAPI = ChatAPI.getInstance();