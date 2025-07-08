import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { loadSessionMessages, fetchProjectFiles, fetchSlashCommands } from '@/features/chat/ChatInterface.logic';
import useCreateDiff from '@/features/chat/lib/createDiff';
import normalizeMessages from '@/features/chat/lib/normalizeMessages';
import { useLogger, sanitizeError, addTimestamp, addSessionContext, isLevelEnabled } from '../../logger';

export const useChatInterface = ({
  selectedProject,
  selectedSession,
  messages,
  sendMessage,
  onInputFocusChange,
  onSessionActive,
  onSessionInactive,
  onReplaceTemporarySession,
  onNavigateToSession,
  autoScrollToBottom
}) => {
  const logger = useLogger({ hook: 'useChatInterface' });
  // Core state
  const [input, setInput] = useState(() => {
    if (typeof window !== 'undefined' && selectedProject) {
      return localStorage.getItem(`draft_input_${selectedProject.name}`) || '';
    }
    return '';
  });
  const [chatMessages, setChatMessages] = useState(() => {
    if (typeof window !== 'undefined' && selectedProject) {
      const saved = localStorage.getItem(`chat_messages_${selectedProject.name}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessionMessages, setIsLoadingSessionMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSessionTransitioning, setIsSessionTransitioning] = useState(false);
  
  // Session management
  const [currentSessionId, setCurrentSessionId] = useState(selectedSession?.id || null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [isSystemSessionChange, setIsSystemSessionChange] = useState(false);
  const [canAbortSession, setCanAbortSession] = useState(false);
  
  // UI states
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [textareaExpanded, setTextareaExpanded] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [claudeStatus, setClaudeStatus] = useState(null);
  
  // File dropdown states
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [atSymbolPosition, setAtSymbolPosition] = useState(-1);
  
  // Command menu states
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [slashCommands, setSlashCommands] = useState([]);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(-1);
  const [slashPosition, setSlashPosition] = useState(-1);
  
  // Message queue for handling messages while Claude is processing
  const [messageQueue, setMessageQueue] = useState([]);
  
  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollPositionRef = useRef({ height: 0, top: 0 });
  
  // Memoized values
  const createDiff = useCreateDiff();
  
  const visibleMessages = useMemo(() => {
    const maxMessages = 100;
    if (chatMessages.length <= maxMessages) {
      return chatMessages;
    }
    return chatMessages.slice(-maxMessages);
  }, [chatMessages]);
  
  // Scroll utilities
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      setIsUserScrolledUp(false);
    }
  }, []);

  const isNearBottom = useCallback(() => {
    if (!scrollContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const wasNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsUserScrolledUp(!wasNearBottom);
    }
  }, []);
  
  // Load session messages callback
  const loadSessionMessagesCallback = useCallback(async (projectName, sessionId) => {
    if (!projectName || !sessionId) return [];
    
    setIsLoadingSessionMessages(true);
    try {
      const messages = await loadSessionMessages(projectName, sessionId);
      return messages;
    } finally {
      setIsLoadingSessionMessages(false);
    }
  }, []);
  
  // Effect: Load session messages when session changes
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedSession && selectedProject) {
        setCurrentSessionId(selectedSession.id);
        
        if (!isSystemSessionChange) {
          const messages = await loadSessionMessagesCallback(selectedProject.name, selectedSession.id);
          setSessionMessages(messages);
          setIsSessionTransitioning(false);
          if (autoScrollToBottom) {
            setTimeout(() => scrollToBottom(), 200);
          }
        } else {
          setIsSystemSessionChange(false);
          setIsSessionTransitioning(false);
        }
      } else {
        // Only clear messages if we're not loading, no pending messages, and not streaming
        if (!isLoading && messageQueue.length === 0 && !isStreaming) {
          setChatMessages([]);
        }
        setSessionMessages([]);
        setCurrentSessionId(null);
      }
    };
    
    loadMessages();
  }, [selectedSession, selectedProject, loadSessionMessagesCallback, isSystemSessionChange, autoScrollToBottom, isLoading, messageQueue.length]);
  
  // Effect: Update chatMessages when session messages change
  useEffect(() => {
    if (selectedSession && sessionMessages.length > 0 && !isSystemSessionChange) {
      const normalized = normalizeMessages(sessionMessages);
      
      // Preserve any user messages that were just sent but not yet in session
      setChatMessages(prev => {
        const recentUserMessages = prev.filter(msg => 
          msg.type === 'user' && 
          (msg.isQueued || new Date() - new Date(msg.timestamp) < 5000)
        );
        
        // Merge normalized session messages with recent user messages
        const allMessages = [...normalized];
        
        // Add recent user messages that aren't already in the session
        recentUserMessages.forEach(userMsg => {
          const exists = allMessages.some(sessionMsg => 
            sessionMsg.type === 'user' && 
            sessionMsg.content === userMsg.content &&
            Math.abs(new Date(sessionMsg.timestamp) - new Date(userMsg.timestamp)) < 1000
          );
          
          if (!exists) {
            allMessages.push(userMsg);
          }
        });
        
        // Sort by timestamp
        return allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
    } else if (!selectedSession) {
      // Clear messages when no session is selected, but not during streaming or session transitions
      if (!isStreaming && !isSessionTransitioning) {
        setChatMessages([]);
      }
    }
  }, [selectedSession, sessionMessages, isSystemSessionChange]);
  
  // Effect: Notify parent when input focus changes
  useEffect(() => {
    if (onInputFocusChange) {
      onInputFocusChange(isInputFocused);
    }
  }, [isInputFocused, onInputFocusChange]);
  
  // Effect: Persist input draft to localStorage
  useEffect(() => {
    if (selectedProject && input !== '') {
      localStorage.setItem(`draft_input_${selectedProject.name}`, input);
    } else if (selectedProject && input === '') {
      localStorage.removeItem(`draft_input_${selectedProject.name}`);
    }
  }, [input, selectedProject]);
  
  // Effect: Persist chat messages to localStorage
  useEffect(() => {
    if (selectedProject && chatMessages.length > 0) {
      try {
        // Limit the number of messages to save (keep only recent 50)
        const messagesToSave = chatMessages.slice(-50);
        localStorage.setItem(`chat_messages_${selectedProject.name}`, JSON.stringify(messagesToSave));
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          logger.error('localStorage quota exceeded', {
            error: sanitizeError(e),
            sessionId: selectedSession?.id,
            projectName: selectedProject?.name,
            messageCount: chatMessages.length,
            attemptedOperation: 'save_chat_messages',
            ...addTimestamp()
          });
          
          try {
            // Clear all chat messages from other projects
            const keys = Object.keys(localStorage);
            const chatKeys = keys.filter(k => k.startsWith('chat_messages_') && k !== `chat_messages_${selectedProject.name}`);
            const draftKeys = keys.filter(k => k.startsWith('draft_input_') && k !== `draft_input_${selectedProject.name}`);
            
            // Remove all old chat messages
            chatKeys.forEach(key => localStorage.removeItem(key));
            // Remove old draft inputs
            draftKeys.forEach(key => localStorage.removeItem(key));
            
            // Try again with limited messages
            const limitedMessages = chatMessages.slice(-30); // Even more aggressive limit
            localStorage.setItem(`chat_messages_${selectedProject.name}`, JSON.stringify(limitedMessages));
          } catch (e2) {
            logger.error('Failed to save after aggressive cleanup', {
              error: sanitizeError(e2),
              sessionId: selectedSession?.id,
              projectName: selectedProject?.name,
              messageCount: chatMessages.length,
              cleanupAttempted: true,
              ...addTimestamp()
            });
            // As last resort, clear current project's old messages and save only recent ones
            try {
              localStorage.removeItem(`chat_messages_${selectedProject.name}`);
              const minimalMessages = chatMessages.slice(-10);
              localStorage.setItem(`chat_messages_${selectedProject.name}`, JSON.stringify(minimalMessages));
            } catch (e3) {
              logger.error('Failed to save even minimal messages', {
                error: sanitizeError(e3),
                sessionId: selectedSession?.id,
                projectName: selectedProject?.name,
                messageCount: 10,
                attemptedOperation: 'minimal_messages_save',
                ...addTimestamp()
              });
            }
          }
        } else {
          logger.error('Error saving chat messages', {
            error: sanitizeError(e),
            sessionId: selectedSession?.id,
            projectName: selectedProject?.name,
            messageCount: chatMessages.length,
            attemptedOperation: 'save_chat_messages',
            ...addTimestamp()
          });
        }
      }
    }
  }, [chatMessages, selectedProject]);
  
  // Effect: Load saved state when project changes
  useEffect(() => {
    if (selectedProject) {
      const savedInput = localStorage.getItem(`draft_input_${selectedProject.name}`) || '';
      if (savedInput !== input) {
        setInput(savedInput);
      }
    }
  }, [selectedProject?.name, input]);
  
  // Effect: Handle WebSocket messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      switch (latestMessage.type) {
        case 'session-created':
          if (latestMessage.sessionId && !currentSessionId) {
            sessionStorage.setItem('pendingSessionId', latestMessage.sessionId);
            if (onReplaceTemporarySession) {
              onReplaceTemporarySession(latestMessage.sessionId);
            }
          }
          break;
          
        case 'claude-response':
          const messageData = latestMessage.data.message || latestMessage.data;
          
          // Handle Claude CLI session duplication bug workaround
          if (latestMessage.data.type === 'system' && 
              latestMessage.data.subtype === 'init' && 
              latestMessage.data.session_id && 
              currentSessionId && 
              latestMessage.data.session_id !== currentSessionId) {
            
            if (logger.isLevelEnabled('debug')) {
              logger.debug('Claude CLI session duplication detected', {
                originalSession: currentSessionId,
                newSession: latestMessage.data.session_id,
                sessionId: selectedSession?.id,
                projectName: selectedProject?.name,
                messageType: 'claude-response',
                ...addTimestamp()
              });
            }
            
            // Check if currently streaming - defer session change if needed
            if (isStreaming) {
              if (logger.isLevelEnabled('debug')) {
                logger.debug('Deferring session change - Claude is currently streaming', {
                  originalSession: currentSessionId,
                  newSession: latestMessage.data.session_id,
                  sessionId: selectedSession?.id,
                  projectName: selectedProject?.name,
                  isStreaming: true,
                  context: 'session_duplication',
                  ...addTimestamp()
                });
              }
              // Could implement a pending session change queue here if needed
              return;
            }
            
            setIsSystemSessionChange(true);
            setIsSessionTransitioning(true);
            
            if (onNavigateToSession) {
              onNavigateToSession(latestMessage.data.session_id);
            }
            return;
          }
          
          // Handle system/init for new sessions
          if (latestMessage.data.type === 'system' && 
              latestMessage.data.subtype === 'init' && 
              latestMessage.data.session_id && 
              !currentSessionId) {
            
            if (logger.isLevelEnabled('debug')) {
              logger.debug('New session init detected', {
                newSession: latestMessage.data.session_id,
                sessionId: selectedSession?.id,
                projectName: selectedProject?.name,
                messageType: 'claude-response',
                ...addTimestamp()
              });
            }
            
            // Check if currently streaming - defer session change if needed
            if (isStreaming) {
              if (logger.isLevelEnabled('debug')) {
                logger.debug('Deferring session change - Claude is currently streaming', {
                  newSession: latestMessage.data.session_id,
                  sessionId: selectedSession?.id,
                  projectName: selectedProject?.name,
                  isStreaming: true,
                  context: 'new_session_init',
                  ...addTimestamp()
                });
              }
              // Could implement a pending session change queue here if needed
              return;
            }
            
            setIsSystemSessionChange(true);
            setIsSessionTransitioning(true);
            
            if (onNavigateToSession) {
              onNavigateToSession(latestMessage.data.session_id);
            }
            return;
          }
          
          // For system/init messages that match current session, just ignore them
          if (latestMessage.data.type === 'system' && 
              latestMessage.data.subtype === 'init' && 
              latestMessage.data.session_id && 
              currentSessionId && 
              latestMessage.data.session_id === currentSessionId) {
            if (logger.isLevelEnabled('debug')) {
              logger.debug('System init message for current session, ignoring', {
                currentSession: currentSessionId,
                messageSession: latestMessage.data.session_id,
                sessionId: selectedSession?.id,
                projectName: selectedProject?.name,
                messageType: 'claude-response',
                ...addTimestamp()
              });
            }
            return;
          }
          
          // Set streaming state when receiving claude-response
          setIsStreaming(true);
          
          // Handle different types of content in the response
          if (Array.isArray(messageData.content)) {
            for (const part of messageData.content) {
              if (part.type === 'tool_use') {
                const toolInput = part.input ? JSON.stringify(part.input, null, 2) : '';
                setChatMessages(prev => [...prev, {
                  type: 'assistant',
                  content: '',
                  timestamp: new Date(),
                  isToolUse: true,
                  toolName: part.name,
                  toolInput: toolInput,
                  toolId: part.id,
                  toolResult: null
                }]);
              } else if (part.type === 'text' && part.text?.trim()) {
                setChatMessages(prev => [...prev, {
                  type: 'assistant',
                  content: part.text,
                  timestamp: new Date()
                }]);
              }
            }
          } else if (typeof messageData.content === 'string' && messageData.content.trim()) {
            setChatMessages(prev => [...prev, {
              type: 'assistant',
              content: messageData.content,
              timestamp: new Date()
            }]);
          }
          
          // Handle tool results from user messages
          if (messageData.role === 'user' && Array.isArray(messageData.content)) {
            for (const part of messageData.content) {
              if (part.type === 'tool_result') {
                setChatMessages(prev => prev.map(msg => {
                  if (msg.isToolUse && msg.toolId === part.tool_use_id) {
                    return {
                      ...msg,
                      toolResult: {
                        content: part.content,
                        isError: part.is_error,
                        timestamp: new Date()
                      }
                    };
                  }
                  return msg;
                }));
              }
            }
          }
          break;
          
        case 'claude-output':
          setChatMessages(prev => [...prev, {
            type: 'assistant',
            content: latestMessage.data,
            timestamp: new Date()
          }]);
          break;
          
        case 'claude-interactive-prompt':
          setChatMessages(prev => [...prev, {
            type: 'assistant',
            content: latestMessage.data,
            timestamp: new Date(),
            isInteractivePrompt: true
          }]);
          break;
          
        case 'claude-error':
          setChatMessages(prev => [...prev, {
            type: 'error',
            content: `Error: ${latestMessage.error}`,
            timestamp: new Date()
          }]);
          break;
          
        case 'claude-complete':
          // Claude has finished processing - no longer streaming
          setIsStreaming(false);
          setIsSessionTransitioning(false);
          
          // Check if there are queued messages
          if (messageQueue.length > 0) {
            // Process the next message in queue
            const nextMessage = messageQueue[0];
            setMessageQueue(prev => prev.slice(1));
            
            // Send the queued message
            sendMessage(nextMessage.wsMessage);
            
            // Keep loading state active since we're processing the queue
            setClaudeStatus({
              text: 'Processing queued message',
              tokens: 0,
              can_interrupt: true
            });
          } else {
            // No more messages in queue, reset loading state
            setIsLoading(false);
            setCanAbortSession(false);
            setClaudeStatus(null);
            
            const activeSessionId = currentSessionId || sessionStorage.getItem('pendingSessionId');
            if (activeSessionId && onSessionInactive) {
              onSessionInactive(activeSessionId);
            }
          }
          
          const pendingSessionId = sessionStorage.getItem('pendingSessionId');
          if (pendingSessionId && !currentSessionId && latestMessage.exitCode === 0) {
            setCurrentSessionId(pendingSessionId);
            sessionStorage.removeItem('pendingSessionId');
          }
          
          // Mark any queued messages as no longer queued
          setChatMessages(prev => prev.map(msg => {
            if (msg.isQueued) {
              return { ...msg, isQueued: false };
            }
            return msg;
          }));
          break;
          
        case 'session-aborted':
          setIsLoading(false);
          setCanAbortSession(false);
          setClaudeStatus(null);
          setIsStreaming(false);
          setIsSessionTransitioning(false);
          
          // Clear the message queue since session was aborted
          setMessageQueue([]);
          
          if (currentSessionId && onSessionInactive) {
            onSessionInactive(currentSessionId);
          }
          
          setChatMessages(prev => [...prev, {
            type: 'assistant',
            content: 'Session interrupted by user.',
            timestamp: new Date()
          }]);
          
          // Mark any queued messages as aborted
          setChatMessages(prev => prev.map(msg => {
            if (msg.isQueued) {
              return { ...msg, isQueued: false, wasAborted: true };
            }
            return msg;
          }));
          break;
          
        case 'claude-status':
          if (logger.isLevelEnabled('debug')) {
            logger.debug('Received claude-status message', {
              data: latestMessage.data,
              sessionId: selectedSession?.id,
              projectName: selectedProject?.name,
              messageType: 'claude-status',
              ...addTimestamp()
            });
          }
          const statusData = latestMessage.data;
          if (statusData) {
            let statusInfo = {
              text: 'Working...',
              tokens: 0,
              can_interrupt: true,
              toolStatus: null,
              contextRemaining: null
            };
            
            if (statusData.message) {
              statusInfo.text = statusData.message;
            } else if (statusData.status) {
              statusInfo.text = statusData.status;
            } else if (typeof statusData === 'string') {
              statusInfo.text = statusData;
            }
            
            if (statusData.tokens) {
              statusInfo.tokens = statusData.tokens;
            } else if (statusData.token_count) {
              statusInfo.tokens = statusData.token_count;
            }
            
            if (statusData.can_interrupt !== undefined) {
              statusInfo.can_interrupt = statusData.can_interrupt;
            }
            
            if (statusData.toolStatus) {
              statusInfo.toolStatus = statusData.toolStatus;
            }
            
            if (statusData.contextRemaining !== null && statusData.contextRemaining !== undefined) {
              statusInfo.contextRemaining = statusData.contextRemaining;
            }
            
            if (logger.isLevelEnabled('debug')) {
              logger.debug('Setting claude status', {
                statusInfo,
                sessionId: selectedSession?.id,
                projectName: selectedProject?.name,
                ...addTimestamp()
              });
            }
            setClaudeStatus(statusInfo);
            setIsLoading(true);
            setCanAbortSession(statusInfo.can_interrupt);
            setIsStreaming(true);
          }
          break;
          
        case 'stream-end':
          // Stream has ended - no longer streaming
          setIsStreaming(false);
          setIsSessionTransitioning(false);
          
          // Check if there are queued messages
          if (messageQueue.length > 0) {
            // Process the next message in queue
            const nextMessage = messageQueue[0];
            setMessageQueue(prev => prev.slice(1));
            
            // Send the queued message
            sendMessage(nextMessage.wsMessage);
            
            // Keep loading state active since we're processing the queue
            setClaudeStatus({
              text: 'Processing queued message',
              tokens: 0,
              can_interrupt: true
            });
          } else {
            // No more messages in queue, reset loading state
            setIsLoading(false);
            setCanAbortSession(false);
            setClaudeStatus(null);
          }
          
          // Mark any queued messages as no longer queued
          setChatMessages(prev => prev.map(msg => {
            if (msg.isQueued) {
              return { ...msg, isQueued: false };
            }
            return msg;
          }));
          break;
          
        case 'session-summary-updated':
          // Session title has been updated by the backend
          logger.info('Session summary updated', {
            sessionId: latestMessage.sessionId,
            summary: latestMessage.summary,
            projectName: selectedProject?.name,
            messageType: 'session-summary-updated',
            ...addTimestamp()
          });
          // The parent component should handle updating the session list
          // No need to update local state as this is handled by the parent
          break;
      }
    }
  }, [messages, currentSessionId, onReplaceTemporarySession, onNavigateToSession, onSessionInactive, sendMessage, messageQueue, setMessageQueue, setChatMessages, setClaudeStatus]);
  
  // Effect: Load file list when project changes
  useEffect(() => {
    if (selectedProject) {
      if (logger.isLevelEnabled('debug')) {
        logger.debug('Loading files for project', {
          projectName: selectedProject.name,
          sessionId: selectedSession?.id,
          ...addTimestamp()
        });
      }
      fetchProjectFiles(selectedProject.name).then(files => {
        if (logger.isLevelEnabled('debug')) {
          logger.debug('Files loaded', {
            fileCount: files.length,
            projectName: selectedProject.name,
            sessionId: selectedSession?.id,
            ...addTimestamp()
          });
        }
        setFileList(files);
      }).catch(error => {
        logger.error('Failed to load files', {
          error: sanitizeError(error),
          projectName: selectedProject.name,
          sessionId: selectedSession?.id,
          ...addTimestamp()
        });
        setFileList([]);
      });
    } else {
      if (logger.isLevelEnabled('debug')) {
        logger.debug('No project selected, clearing file list', {
          sessionId: selectedSession?.id,
          ...addTimestamp()
        });
      }
      setFileList([]);
    }
  }, [selectedProject]);
  
  // Effect: Load slash commands on mount
  useEffect(() => {
    fetchSlashCommands().then(commands => {
      setSlashCommands(commands);
    });
  }, []);
  
  // Effect: Handle @ symbol detection and file filtering
  useEffect(() => {
    const textBeforeCursor = input.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ')) {
        setAtSymbolPosition(lastAtIndex);
        setShowFileDropdown(true);
        
        const filtered = fileList.filter(file => 
          file.name.toLowerCase().includes(textAfterAt.toLowerCase()) ||
          file.path.toLowerCase().includes(textAfterAt.toLowerCase())
        ).slice(0, 10);
        
        setFilteredFiles(filtered);
        setSelectedFileIndex(-1);
      } else {
        setShowFileDropdown(false);
        setAtSymbolPosition(-1);
      }
    } else {
      setShowFileDropdown(false);
      setAtSymbolPosition(-1);
    }
  }, [input, cursorPosition, fileList]);
  
  // Effect: Handle / symbol detection and command filtering
  useEffect(() => {
    const textBeforeCursor = input.slice(0, cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    if (lastSlashIndex !== -1) {
      const charBeforeSlash = lastSlashIndex > 0 ? textBeforeCursor[lastSlashIndex - 1] : '';
      if (lastSlashIndex === 0 || charBeforeSlash === ' ' || charBeforeSlash === '\n') {
        const textAfterSlash = textBeforeCursor.slice(lastSlashIndex + 1);
        if (!textAfterSlash.includes(' ')) {
          setSlashPosition(lastSlashIndex);
          setShowCommandMenu(true);
          
          const filtered = slashCommands.filter(cmd => 
            cmd.command.toLowerCase().includes('/' + textAfterSlash.toLowerCase())
          ).slice(0, 20);
          
          setFilteredCommands(filtered);
          setSelectedCommandIndex(-1);
        } else {
          setShowCommandMenu(false);
          setSlashPosition(-1);
        }
      } else {
        setShowCommandMenu(false);
        setSlashPosition(-1);
      }
    } else {
      setShowCommandMenu(false);
      setSlashPosition(-1);
    }
  }, [input, cursorPosition, slashCommands]);
  
  // Effect: Capture scroll position before render when auto-scroll is disabled
  useEffect(() => {
    if (!autoScrollToBottom && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      scrollPositionRef.current = {
        height: container.scrollHeight,
        top: container.scrollTop
      };
    }
  }, [autoScrollToBottom, chatMessages.length]);
  
  // Effect: Handle auto-scrolling
  useEffect(() => {
    if (scrollContainerRef.current && chatMessages.length > 0) {
      if (autoScrollToBottom) {
        if (!isUserScrolledUp) {
          setTimeout(() => scrollToBottom(), 0);
        }
      } else {
        const container = scrollContainerRef.current;
        const prevHeight = scrollPositionRef.current.height;
        const prevTop = scrollPositionRef.current.top;
        const newHeight = container.scrollHeight;
        const heightDiff = newHeight - prevHeight;
        
        if (heightDiff > 0 && prevTop > 0) {
          container.scrollTop = prevTop + heightDiff;
        }
      }
    }
  }, [chatMessages.length, isUserScrolledUp, autoScrollToBottom]);
  
  // Effect: Scroll to bottom when component mounts with existing messages
  useEffect(() => {
    if (scrollContainerRef.current && chatMessages.length > 0 && autoScrollToBottom) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [autoScrollToBottom]);
  
  // Effect: Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  // Effect: Cleanup streaming state on component unmount or project change
  useEffect(() => {
    return () => {
      setIsStreaming(false);
      setIsSessionTransitioning(false);
    };
  }, [selectedProject?.name]);
  
  // Effect: Initial textarea setup
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      
      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight);
      const isExpanded = textareaRef.current.scrollHeight > lineHeight * 2;
      setTextareaExpanded(isExpanded);
    }
  }, []);
  
  const handleTranscript = useCallback((text) => {
    if (text.trim()) {
      setInput(prevInput => {
        const newInput = prevInput.trim() ? `${prevInput} ${text}` : text;
        
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            
            const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight);
            const isExpanded = textareaRef.current.scrollHeight > lineHeight * 2;
            setTextareaExpanded(isExpanded);
          }
        }, 0);
        
        return newInput;
      });
    }
  }, []);
  
  return {
    // State
    input,
    setInput,
    chatMessages,
    setChatMessages,
    isLoading,
    setIsLoading,
    currentSessionId,
    setCurrentSessionId,
    isInputFocused,
    setIsInputFocused,
    sessionMessages,
    setSessionMessages,
    isLoadingSessionMessages,
    isSystemSessionChange,
    setIsSystemSessionChange,
    isStreaming,
    setIsStreaming,
    isSessionTransitioning,
    setIsSessionTransitioning,
    textareaExpanded,
    setTextareaExpanded,
    showFileDropdown,
    setShowFileDropdown,
    fileList,
    setFileList,
    filteredFiles,
    setFilteredFiles,
    selectedFileIndex,
    setSelectedFileIndex,
    cursorPosition,
    setCursorPosition,
    atSymbolPosition,
    setAtSymbolPosition,
    canAbortSession,
    setCanAbortSession,
    isUserScrolledUp,
    setIsUserScrolledUp,
    showCommandMenu,
    setShowCommandMenu,
    slashCommands,
    setSlashCommands,
    filteredCommands,
    setFilteredCommands,
    selectedCommandIndex,
    setSelectedCommandIndex,
    slashPosition,
    setSlashPosition,
    claudeStatus,
    setClaudeStatus,
    messageQueue,
    setMessageQueue,
    
    // Refs
    messagesEndRef,
    textareaRef,
    scrollContainerRef,
    scrollPositionRef,
    
    // Memoized values
    createDiff,
    visibleMessages,
    
    // Callbacks
    scrollToBottom,
    isNearBottom,
    handleScroll,
    handleTranscript
  };
};