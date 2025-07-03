/**
 * Chat Session Hook - Custom hook for managing chat session state and lifecycle
 * Following Bulletproof React pattern for state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLogger } from '@kit/logger/react';
import type { Logger } from '@kit/logger/types';
import { chatAPI } from '../api';
import type { ChatMessage, SessionProtection, ChatConfig } from '../types';
import type { Project, Session } from '@/App';
import type { WSMessage } from '@/utils/websocket';

interface UseChatSessionProps {
  selectedProject: Project | null;
  selectedSession: Session | null;
  ws: WebSocket | null;
  sendMessage: (message: WSMessage) => void;
  messages: WSMessage[];
  sessionProtection: SessionProtection;
  config: ChatConfig;
}

interface UseChatSessionReturn {
  chatMessages: ChatMessage[];
  isLoading: boolean;
  isAbortable: boolean;
  currentSessionId: string | null;
  temporarySessionId: string | null;
  sendUserMessage: (message: string) => void;
  abortSession: () => void;
  clearMessages: () => void;
  handleIncomingMessage: (message: WSMessage) => void;
}

export function useChatSession({
  selectedProject,
  selectedSession,
  ws,
  sendMessage,
  messages,
  sessionProtection,
  config
}: UseChatSessionProps): UseChatSessionReturn {
  const logger: Logger = useLogger({ scope: 'ChatSession' });
  const sessionLogger = useRef<Logger | null>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAbortable, setIsAbortable] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [temporarySessionId, setTemporarySessionId] = useState<string | null>(null);
  
  // Track if session history has been loaded to prevent duplicates
  const sessionHistoryLoaded = useRef<string | null>(null);

  // Update session logger when session changes
  useEffect(() => {
    if (selectedSession?.id) {
      sessionLogger.current = logger.child({ sessionId: selectedSession.id });
      setCurrentSessionId(selectedSession.id);
      setTemporarySessionId(null);
    } else if (temporarySessionId) {
      sessionLogger.current = logger.child({ temporarySessionId });
      setCurrentSessionId(null);
    } else {
      sessionLogger.current = logger;
      setCurrentSessionId(null);
    }
  }, [selectedSession?.id, temporarySessionId, logger]);

  // Track if session history is currently loading to prevent duplicates
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Track session operations for debugging (similar to backend tracking)
  const sessionOperationTracker = useRef<Map<string, {
    operations: Array<{ type: string, timestamp: number }>
  }>>(new Map());

  // Load session history when session changes
  useEffect(() => {
    const sessionKey = `${selectedProject?.name}_${selectedSession?.id}`;
    
    // Only reset if the session ID actually changed
    if (sessionHistoryLoaded.current !== sessionKey) {
      lastProcessedIndex.current = -1;
    }
    
    if (selectedSession && selectedProject && ws) {
      // Check if this session's history is already loaded or currently loading
      if (sessionHistoryLoaded.current === sessionKey || isLoadingHistory) {
        sessionLogger.current?.debug('Session history already loaded or loading, skipping', {
          sessionKey,
          alreadyLoaded: sessionHistoryLoaded.current === sessionKey,
          currentlyLoading: isLoadingHistory
        });
        return;
      }

      // Track history loading operations for debugging
      const sessionOperations = sessionOperationTracker.current.get(sessionKey) || { operations: [] };
      const loadCount = sessionOperations.operations.filter(op => op.type === 'history_load').length + 1;
      
      sessionLogger.current?.info('Loading session history', {
        projectName: selectedProject.name,
        sessionId: selectedSession.id,
        sessionKey,
        callerInfo: {
          hook: 'useChatSession',
          loadCount,
          wsReadyState: ws?.readyState,
          timestamp: Date.now()
        }
      });
      
      sessionOperations.operations.push({ type: 'history_load', timestamp: Date.now() });
      sessionOperationTracker.current.set(sessionKey, sessionOperations);
      
      setIsLoading(true);
      setIsLoadingHistory(true);
      setChatMessages([]);
      
      chatAPI.loadSessionHistory(
        ws,
        selectedProject.name,
        selectedSession.id,
        sendMessage
      );
    } else if (!selectedSession && selectedProject) {
      // New session - clear messages and reset tracking
      setChatMessages([]);
      setCurrentSessionId(null);
      setTemporarySessionId(null);
      sessionHistoryLoaded.current = null;
      setIsLoadingHistory(false);
    }
  }, [selectedSession?.id, selectedProject?.name, ws, sendMessage, isLoadingHistory]);

  // Use refs for session IDs to avoid callback recreation
  const currentSessionIdRef = useRef(currentSessionId);
  const temporarySessionIdRef = useRef(temporarySessionId);
  
  // Update refs when state changes
  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);
  
  useEffect(() => {
    temporarySessionIdRef.current = temporarySessionId;
  }, [temporarySessionId]);

  // Handle incoming WebSocket messages - memoized for performance
  const handleIncomingMessage = useCallback((message: WSMessage) => {
    // Add comprehensive debug logging
    console.log('=== INCOMING MESSAGE TO CHAT SESSION ===', {
      messageType: message.type,
      hasData: 'data' in message,
      dataType: 'data' in message ? typeof (message as any).data : 'N/A',
      dataContent: 'data' in message ? (message as any).data : undefined,
      fullMessage: message
    });
    
    // TRACE: Add temporary logging for tool use detection
    const { logTrace } = logger;
    if (logger.isLevelEnabled('trace')) {
      logTrace('WebSocket message received', {
        type: message.type,
        hasData: 'data' in message,
        dataKeys: 'data' in message ? Object.keys((message as any).data || {}) : [],
        timestamp: Date.now()
      });
    }
    
    const handled = chatAPI.processIncomingMessage(
      message,
      (chatMessage: ChatMessage) => {
        setChatMessages(prev => {
          // Handle tool result updates
          if (chatMessage.type === 'tool_result' && chatMessage.id) {
            // Find the corresponding tool use message and update it
            const updatedMessages = prev.map(msg => {
              if (msg.id === chatMessage.id || (msg.isToolUse && msg.toolId === chatMessage.id)) {
                sessionLogger.current?.debug('Updating tool use with result', {
                  toolId: chatMessage.id,
                  hasResult: !!chatMessage.tool_result,
                  resultLength: chatMessage.tool_result?.length
                });
                return {
                  ...msg,
                  tool_result: chatMessage.tool_result || chatMessage.toolResult,
                  toolResult: chatMessage.tool_result || chatMessage.toolResult,
                  toolResultTimestamp: chatMessage.timestamp
                };
              }
              return msg;
            });
            
            // Check if we found and updated a message
            const wasUpdated = updatedMessages.some((msg, idx) => msg !== prev[idx]);
            if (wasUpdated) {
              return updatedMessages;
            }
            
            // If no matching tool use found, add as new message
            sessionLogger.current?.warn('Tool result without matching tool use', {
              toolId: chatMessage.id
            });
          }
          
          const newMessages = [...prev, chatMessage];
          sessionLogger.current?.debug('Message added to chat', {
            messageType: chatMessage.type,
            messageId: chatMessage.id,
            totalMessages: newMessages.length
          });
          return newMessages;
        });
        
        if (message.type === 'assistant_message' || message.type === 'tool_result') {
          setIsLoading(false);
          setIsAbortable(false);
        }
      },
      (event: string, data?: any) => {
        switch (event) {
          case 'session-created':
            if (data?.sessionId && temporarySessionIdRef.current) {
              sessionLogger.current?.info('Session created, replacing temporary ID', {
                temporarySessionId: temporarySessionIdRef.current,
                realSessionId: data.sessionId
              });
              
              setCurrentSessionId(data.sessionId);
              setTemporarySessionId(null);
              sessionProtection.onReplaceTemporarySession(data.sessionId);
            }
            break;
            
          case 'claude-complete':
            sessionLogger.current?.info('Claude response completed');
            setIsLoading(false);
            setIsAbortable(false);
            
            const sessionId = currentSessionIdRef.current || temporarySessionIdRef.current;
            if (sessionId) {
              sessionProtection.onSessionInactive(sessionId);
            }
            break;
            
          case 'session-aborted':
            sessionLogger.current?.info('Session aborted by user or system');
            setIsLoading(false);
            setIsAbortable(false);
            
            const abortedSessionId = currentSessionIdRef.current || temporarySessionIdRef.current;
            if (abortedSessionId) {
              sessionProtection.onSessionInactive(abortedSessionId);
            }
            break;
            
          case 'claude-status':
            // Handle Claude status updates
            setIsLoading(data?.status === 'thinking' || data?.status === 'processing');
            setIsAbortable(data?.status === 'thinking' || data?.status === 'processing');
            break;
        }
      }
    );

    if (!handled) {
      // Only log non-session_history messages to reduce noise
      if (message.type !== 'session_history') {
        sessionLogger.current?.debug('Message not handled by chatAPI', {
          messageType: message.type,
          hasMessages: !!message.messages
        });
      }
      
      // Handle session history loading
      if (message.type === 'session_history' && message.messages) {
        const sessionKey = `${selectedProject?.name}_${selectedSession?.id}`;
        
        // Prevent duplicate session history loading
        if (sessionHistoryLoaded.current === sessionKey) {
          sessionLogger.current?.debug('Duplicate session history received, ignoring', {
            sessionKey,
            messageCount: message.messages.length
          });
          return; // Already loaded this session's history
        }
        
        sessionHistoryLoaded.current = sessionKey;
        setIsLoadingHistory(false); // Mark loading as complete
        
        // Mark session as loaded in the API to clear loading state
        chatAPI.markSessionLoaded(selectedProject?.name || '', selectedSession?.id || '');
        
        sessionLogger.current?.info('Session history loaded', {
          messageCount: message.messages.length,
          sessionKey
        });
        
        const historyMessages: ChatMessage[] = message.messages.map((msg: any, index: number) => {
          // Debug log the message structure
          if (index < 3) { // Only log first 3 messages to avoid spam
            sessionLogger.current?.debug('Raw message structure', {
              msgIndex: index,
              msgKeys: Object.keys(msg),
              msgType: msg.type,
              hasContent: !!msg.content,
              contentType: typeof msg.content,
              contentLength: msg.content?.length || 0,
              contentPreview: msg.content?.substring(0, 100) || '[no content]',
              rawMessage: msg
            });
          }
          
          return {
            type: msg.type,
            content: msg.content || msg.text || msg.message || '',
            id: msg.id || `msg-${index}`,
            timestamp: msg.timestamp,
            tool_name: msg.tool_name,
            tool_input: msg.tool_input,
            tool_result: msg.tool_result,
            toolError: msg.toolError,
            isToolUse: msg.type === 'tool_use',
            inline: msg.inline
          };
        });
        
        setChatMessages(historyMessages);
        setIsLoading(false);
      } else {
        sessionLogger.current?.debug('Message type not session_history or no messages', {
          messageType: message.type,
          hasMessages: !!message.messages,
          messageKeys: Object.keys(message)
        });
      }
    }
  }, [sessionProtection]); // Reduced dependencies for better performance

  // Track processed messages to avoid reprocessing
  const lastProcessedIndex = useRef(-1);
  
  // Process only NEW incoming messages (performance optimization)
  useEffect(() => {
    if (messages.length > lastProcessedIndex.current + 1) {
      // Process only unprocessed messages
      const newMessages = messages.slice(lastProcessedIndex.current + 1);
      
      newMessages.forEach((message, index) => {
        const actualIndex = lastProcessedIndex.current + 1 + index;
        // Only log non-session_history messages to reduce noise
        if (message.type !== 'session_history') {
          sessionLogger.current?.debug('Processing WebSocket message', {
            messageType: message.type,
            messageId: message.id,
            messageIndex: actualIndex
          });
        }
        handleIncomingMessage(message);
      });
      
      // Update the last processed index
      lastProcessedIndex.current = messages.length - 1;
    }
  }, [messages.length]); // Only depend on length, not the entire array

  // Send user message
  const sendUserMessage = useCallback((message: string) => {
    if (!selectedProject) {
      logger.warn('Cannot send message: no project selected');
      return;
    }

    const validation = chatAPI.validateMessage(message);
    if (!validation.valid) {
      logger.error('Message validation failed', { error: validation.error });
      return;
    }

    let sessionId = currentSessionId || selectedSession?.id;
    let tempSessionId = temporarySessionId;

    // If no session exists, create temporary ID for new session
    if (!sessionId && !tempSessionId) {
      tempSessionId = chatAPI.generateTemporarySessionId();
      setTemporarySessionId(tempSessionId);
      sessionLogger.current?.info('Created temporary session ID for new session', {
        temporarySessionId: tempSessionId
      });
    }

    const activeSessionId = sessionId || tempSessionId;
    if (activeSessionId) {
      sessionProtection.onSessionActive(activeSessionId);
    }

    setIsLoading(true);
    setIsAbortable(true);

    // Add user message to chat immediately
    const userMessage: ChatMessage = {
      type: 'user',
      content: message,
      timestamp: Date.now(),
      id: `user-${Date.now()}`
    };

    setChatMessages(prev => [...prev, userMessage]);

    sessionLogger.current?.info('Sending user message', {
      messageLength: message.length,
      sessionId: activeSessionId,
      projectName: selectedProject.name
    });

    chatAPI.sendUserMessage(
      ws,
      selectedProject.name,
      sessionId,
      message,
      sendMessage
    );
  }, [
    selectedProject,
    currentSessionId,
    selectedSession?.id,
    temporarySessionId,
    ws,
    sendMessage,
    sessionProtection,
    logger
  ]);

  // Abort current session
  const abortSession = useCallback(() => {
    if (!isAbortable) {
      return;
    }

    sessionLogger.current?.info('Aborting session by user request');
    
    setIsLoading(false);
    setIsAbortable(false);

    chatAPI.abortSession(ws, sendMessage);

    const sessionId = currentSessionId || temporarySessionId;
    if (sessionId) {
      sessionProtection.onSessionInactive(sessionId);
    }
  }, [isAbortable, ws, sendMessage, currentSessionId, temporarySessionId, sessionProtection]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setChatMessages([]);
    setIsLoading(false);
    setIsAbortable(false);
  }, []);

  return {
    chatMessages,
    isLoading,
    isAbortable,
    currentSessionId,
    temporarySessionId,
    sendUserMessage,
    abortSession,
    clearMessages,
    handleIncomingMessage
  };
}