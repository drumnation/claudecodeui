import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { loadSessionMessages, fetchProjectFiles, fetchSlashCommands } from '@/features/chat/ChatInterface.logic';
import useCreateDiff from '@/features/chat/lib/createDiff';
import normalizeMessages from '@/features/chat/lib/normalizeMessages';

export const useChatInterface = ({
  selectedProject,
  selectedSession,
  messages,
  onInputFocusChange,
  onSessionActive,
  onSessionInactive,
  onReplaceTemporarySession,
  onNavigateToSession,
  autoScrollToBottom
}) => {
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
  
  // Session management
  const [currentSessionId, setCurrentSessionId] = useState(selectedSession?.id || null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [isSystemSessionChange, setIsSystemSessionChange] = useState(false);
  const [canAbortSession, setCanAbortSession] = useState(false);
  
  // UI states
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);
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
  
  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollPositionRef = useRef({ height: 0, top: 0 });
  
  // Memoized values
  const createDiff = useCreateDiff();
  const convertedMessages = useMemo(() => {
    return normalizeMessages(sessionMessages);
  }, [sessionMessages]);
  
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
      const wasNearBottom = isNearBottom();
      setIsUserScrolledUp(!wasNearBottom);
    }
  }, [isNearBottom]);
  
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
          if (autoScrollToBottom) {
            setTimeout(() => scrollToBottom(), 200);
          }
        } else {
          setIsSystemSessionChange(false);
        }
      } else {
        setChatMessages([]);
        setSessionMessages([]);
        setCurrentSessionId(null);
      }
    };
    
    loadMessages();
  }, [selectedSession, selectedProject, loadSessionMessagesCallback, scrollToBottom, isSystemSessionChange, autoScrollToBottom]);
  
  // Effect: Update chatMessages when convertedMessages changes
  useEffect(() => {
    if (sessionMessages.length > 0) {
      setChatMessages(convertedMessages);
    }
  }, [convertedMessages, sessionMessages]);
  
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
      localStorage.setItem(`chat_messages_${selectedProject.name}`, JSON.stringify(chatMessages));
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
            
            console.log('🔄 Claude CLI session duplication detected:', {
              originalSession: currentSessionId,
              newSession: latestMessage.data.session_id
            });
            
            setIsSystemSessionChange(true);
            
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
            
            console.log('🔄 New session init detected:', {
              newSession: latestMessage.data.session_id
            });
            
            setIsSystemSessionChange(true);
            
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
            console.log('🔄 System init message for current session, ignoring');
            return;
          }
          
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
          setIsLoading(false);
          setCanAbortSession(false);
          setClaudeStatus(null);
          
          const activeSessionId = currentSessionId || sessionStorage.getItem('pendingSessionId');
          if (activeSessionId && onSessionInactive) {
            onSessionInactive(activeSessionId);
          }
          
          const pendingSessionId = sessionStorage.getItem('pendingSessionId');
          if (pendingSessionId && !currentSessionId && latestMessage.exitCode === 0) {
            setCurrentSessionId(pendingSessionId);
            sessionStorage.removeItem('pendingSessionId');
          }
          break;
          
        case 'session-aborted':
          setIsLoading(false);
          setCanAbortSession(false);
          setClaudeStatus(null);
          
          if (currentSessionId && onSessionInactive) {
            onSessionInactive(currentSessionId);
          }
          
          setChatMessages(prev => [...prev, {
            type: 'assistant',
            content: 'Session interrupted by user.',
            timestamp: new Date()
          }]);
          break;
          
        case 'claude-status':
          console.log('🔔 Received claude-status message:', latestMessage);
          const statusData = latestMessage.data;
          if (statusData) {
            let statusInfo = {
              text: 'Working...',
              tokens: 0,
              can_interrupt: true
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
            
            console.log('📊 Setting claude status:', statusInfo);
            setClaudeStatus(statusInfo);
            setIsLoading(true);
            setCanAbortSession(statusInfo.can_interrupt);
          }
          break;
      }
    }
  }, [messages, currentSessionId, onReplaceTemporarySession, onNavigateToSession, onSessionInactive]);
  
  // Effect: Load file list when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchProjectFiles(selectedProject.name).then(files => {
        setFileList(files);
      });
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
  });
  
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
  }, [chatMessages.length, isUserScrolledUp, scrollToBottom, autoScrollToBottom]);
  
  // Effect: Scroll to bottom when component mounts with existing messages
  useEffect(() => {
    if (scrollContainerRef.current && chatMessages.length > 0 && autoScrollToBottom) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [scrollToBottom, autoScrollToBottom]);
  
  // Effect: Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  // Effect: Initial textarea setup
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      
      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight);
      const isExpanded = textareaRef.current.scrollHeight > lineHeight * 2;
      setIsTextareaExpanded(isExpanded);
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
            setIsTextareaExpanded(isExpanded);
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
    isTextareaExpanded,
    setIsTextareaExpanded,
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
    
    // Refs
    messagesEndRef,
    textareaRef,
    scrollContainerRef,
    scrollPositionRef,
    
    // Memoized values
    createDiff,
    convertedMessages,
    visibleMessages,
    
    // Callbacks
    scrollToBottom,
    isNearBottom,
    handleScroll,
    handleTranscript
  };
};