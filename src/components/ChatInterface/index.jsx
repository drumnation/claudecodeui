/*
 * ChatInterface.jsx - Chat Component with Session Protection Integration
 * 
 * SESSION PROTECTION INTEGRATION:
 * ===============================
 * 
 * This component integrates with the Session Protection System to prevent project updates
 * from interrupting active conversations:
 * 
 * Key Integration Points:
 * 1. handleSubmit() - Marks session as active when user sends message (including temp ID for new sessions)
 * 2. session-created handler - Replaces temporary session ID with real WebSocket session ID  
 * 3. claude-complete handler - Marks session as inactive when conversation finishes
 * 4. session-aborted handler - Marks session as inactive when conversation is aborted
 * 
 * This ensures uninterrupted chat experience by coordinating with App.jsx to pause sidebar updates.
 */

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import NoProjectSelected from './components/NoProjectSelected';
import MessagesArea from './components/MessagesArea';
import InputArea from './components/InputArea';
import useCreateDiff from './lib/createDiff';
import normalizeMessages from './lib/normalizeMessages';

function ChatInterface({ selectedProject, selectedSession, sendMessage, messages, onFileOpen, onInputFocusChange, onSessionActive, onSessionInactive, onReplaceTemporarySession, onNavigateToSession, onShowSettings, autoExpandTools, showRawParameters, autoScrollToBottom }) {
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
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(selectedSession?.id || null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [isLoadingSessionMessages, setIsLoadingSessionMessages] = useState(false);
  const [isSystemSessionChange, setIsSystemSessionChange] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [atSymbolPosition, setAtSymbolPosition] = useState(-1);
  const [canAbortSession, setCanAbortSession] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const scrollPositionRef = useRef({ height: 0, top: 0 });
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [slashCommands, setSlashCommands] = useState([]);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(-1);
  const [slashPosition, setSlashPosition] = useState(-1);
  const [claudeStatus, setClaudeStatus] = useState(null);

  // Memoized diff calculation to prevent recalculating on every render
  const createDiff = useCreateDiff();

  // Load session messages from API
  const loadSessionMessages = useCallback(async (projectName, sessionId) => {
    if (!projectName || !sessionId) return [];
    
    setIsLoadingSessionMessages(true);
    try {
      const response = await fetch(`/api/projects/${projectName}/sessions/${sessionId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to load session messages');
      }
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error loading session messages:', error);
      return [];
    } finally {
      setIsLoadingSessionMessages(false);
    }
  }, []);

  // Memoize expensive convertSessionMessages operation
  const convertedMessages = useMemo(() => {
    return normalizeMessages(sessionMessages);
  }, [sessionMessages]);

  // Define scroll functions early to avoid hoisting issues in useEffect dependencies
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      setIsUserScrolledUp(false);
    }
  }, []);

  // Check if user is near the bottom of the scroll container
  const isNearBottom = useCallback(() => {
    if (!scrollContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Consider "near bottom" if within 100px of the bottom
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  // Handle scroll events to detect when user manually scrolls up
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const wasNearBottom = isNearBottom();
      setIsUserScrolledUp(!wasNearBottom);
    }
  }, [isNearBottom]);

  useEffect(() => {
    // Load session messages when session changes
    const loadMessages = async () => {
      if (selectedSession && selectedProject) {
        setCurrentSessionId(selectedSession.id);
        
        // Only load messages from API if this is a user-initiated session change
        // For system-initiated changes, preserve existing messages and rely on WebSocket
        if (!isSystemSessionChange) {
          const messages = await loadSessionMessages(selectedProject.name, selectedSession.id);
          setSessionMessages(messages);
          // convertedMessages will be automatically updated via useMemo
          // Scroll to bottom after loading session messages if auto-scroll is enabled
          if (autoScrollToBottom) {
            setTimeout(() => scrollToBottom(), 200);
          }
        } else {
          // Reset the flag after handling system session change
          setIsSystemSessionChange(false);
        }
      } else {
        setChatMessages([]);
        setSessionMessages([]);
        setCurrentSessionId(null);
      }
    };
    
    loadMessages();
  }, [selectedSession, selectedProject, loadSessionMessages, scrollToBottom, isSystemSessionChange, autoScrollToBottom]);

  // Update chatMessages when convertedMessages changes
  useEffect(() => {
    if (sessionMessages.length > 0) {
      setChatMessages(convertedMessages);
    }
  }, [convertedMessages, sessionMessages]);

  // Notify parent when input focus changes
  useEffect(() => {
    if (onInputFocusChange) {
      onInputFocusChange(isInputFocused);
    }
  }, [isInputFocused, onInputFocusChange]);

  // Persist input draft to localStorage
  useEffect(() => {
    if (selectedProject && input !== '') {
      localStorage.setItem(`draft_input_${selectedProject.name}`, input);
    } else if (selectedProject && input === '') {
      localStorage.removeItem(`draft_input_${selectedProject.name}`);
    }
  }, [input, selectedProject]);

  // Persist chat messages to localStorage
  useEffect(() => {
    if (selectedProject && chatMessages.length > 0) {
      localStorage.setItem(`chat_messages_${selectedProject.name}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, selectedProject]);

  // Load saved state when project changes (but don't interfere with session loading)
  useEffect(() => {
    if (selectedProject) {
      // Always load saved input draft for the project
      const savedInput = localStorage.getItem(`draft_input_${selectedProject.name}`) || '';
      if (savedInput !== input) {
        setInput(savedInput);
      }
    }
  }, [selectedProject?.name, input]);

  useEffect(() => {
    // Handle WebSocket messages
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      switch (latestMessage.type) {
        case 'session-created':
          // New session created by Claude CLI - we receive the real session ID here
          // Store it temporarily until conversation completes (prevents premature session association)
          if (latestMessage.sessionId && !currentSessionId) {
            sessionStorage.setItem('pendingSessionId', latestMessage.sessionId);
            
            // Session Protection: Replace temporary "new-session-*" identifier with real session ID
            // This maintains protection continuity - no gap between temp ID and real ID
            // The temporary session is removed and real session is marked as active
            if (onReplaceTemporarySession) {
              onReplaceTemporarySession(latestMessage.sessionId);
            }
          }
          break;
          
        case 'claude-response':
          const messageData = latestMessage.data.message || latestMessage.data;
          
          // Handle Claude CLI session duplication bug workaround:
          // When resuming a session, Claude CLI creates a new session instead of resuming.
          // We detect this by checking for system/init messages with session_id that differs
          // from our current session. When found, we need to switch the user to the new session.
          if (latestMessage.data.type === 'system' && 
              latestMessage.data.subtype === 'init' && 
              latestMessage.data.session_id && 
              currentSessionId && 
              latestMessage.data.session_id !== currentSessionId) {
            
            console.log('🔄 Claude CLI session duplication detected:', {
              originalSession: currentSessionId,
              newSession: latestMessage.data.session_id
            });
            
            // Mark this as a system-initiated session change to preserve messages
            setIsSystemSessionChange(true);
            
            // Switch to the new session using React Router navigation
            // This triggers the session loading logic in App.jsx without a page reload
            if (onNavigateToSession) {
              onNavigateToSession(latestMessage.data.session_id);
            }
            return; // Don't process the message further, let the navigation handle it
          }
          
          // Handle system/init for new sessions (when currentSessionId is null)
          if (latestMessage.data.type === 'system' && 
              latestMessage.data.subtype === 'init' && 
              latestMessage.data.session_id && 
              !currentSessionId) {
            
            console.log('🔄 New session init detected:', {
              newSession: latestMessage.data.session_id
            });
            
            // Mark this as a system-initiated session change to preserve messages
            setIsSystemSessionChange(true);
            
            // Switch to the new session
            if (onNavigateToSession) {
              onNavigateToSession(latestMessage.data.session_id);
            }
            return; // Don't process the message further, let the navigation handle it
          }
          
          // For system/init messages that match current session, just ignore them
          if (latestMessage.data.type === 'system' && 
              latestMessage.data.subtype === 'init' && 
              latestMessage.data.session_id && 
              currentSessionId && 
              latestMessage.data.session_id === currentSessionId) {
            console.log('🔄 System init message for current session, ignoring');
            return; // Don't process the message further
          }
          
          // Handle different types of content in the response
          if (Array.isArray(messageData.content)) {
            for (const part of messageData.content) {
              if (part.type === 'tool_use') {
                // Add tool use message
                const toolInput = part.input ? JSON.stringify(part.input, null, 2) : '';
                setChatMessages(prev => [...prev, {
                  type: 'assistant',
                  content: '',
                  timestamp: new Date(),
                  isToolUse: true,
                  toolName: part.name,
                  toolInput: toolInput,
                  toolId: part.id,
                  toolResult: null // Will be updated when result comes in
                }]);
              } else if (part.type === 'text' && part.text?.trim()) {
                // Add regular text message
                setChatMessages(prev => [...prev, {
                  type: 'assistant',
                  content: part.text,
                  timestamp: new Date()
                }]);
              }
            }
          } else if (typeof messageData.content === 'string' && messageData.content.trim()) {
            // Add regular text message
            setChatMessages(prev => [...prev, {
              type: 'assistant',
              content: messageData.content,
              timestamp: new Date()
            }]);
          }
          
          // Handle tool results from user messages (these come separately)
          if (messageData.role === 'user' && Array.isArray(messageData.content)) {
            for (const part of messageData.content) {
              if (part.type === 'tool_result') {
                // Find the corresponding tool use and update it with the result
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
          // Handle interactive prompts from CLI
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
          
          // Session Protection: Mark session as inactive to re-enable automatic project updates
          // Conversation is complete, safe to allow project updates again
          // Use real session ID if available, otherwise use pending session ID
          const activeSessionId = currentSessionId || sessionStorage.getItem('pendingSessionId');
          if (activeSessionId && onSessionInactive) {
            onSessionInactive(activeSessionId);
          }
          
          // If we have a pending session ID and the conversation completed successfully, use it
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
          
          // Session Protection: Mark session as inactive when aborted
          // User or system aborted the conversation, re-enable project updates
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
          // Handle Claude working status messages
          console.log('🔔 Received claude-status message:', latestMessage);
          const statusData = latestMessage.data;
          if (statusData) {
            // Parse the status message to extract relevant information
            let statusInfo = {
              text: 'Working...',
              tokens: 0,
              can_interrupt: true
            };
            
            // Check for different status message formats
            if (statusData.message) {
              statusInfo.text = statusData.message;
            } else if (statusData.status) {
              statusInfo.text = statusData.status;
            } else if (typeof statusData === 'string') {
              statusInfo.text = statusData;
            }
            
            // Extract token count
            if (statusData.tokens) {
              statusInfo.tokens = statusData.tokens;
            } else if (statusData.token_count) {
              statusInfo.tokens = statusData.token_count;
            }
            
            // Check if can interrupt
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

  // Load file list when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchProjectFiles();
    }
  }, [selectedProject]);

  // Load slash commands on mount
  useEffect(() => {
    fetchSlashCommands();
  }, []);

  const fetchProjectFiles = async () => {
    try {
      const response = await fetch(`/api/projects/${selectedProject.name}/files`);
      if (response.ok) {
        const files = await response.json();
        // Flatten the file tree to get all file paths
        const flatFiles = flattenFileTree(files);
        setFileList(flatFiles);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchSlashCommands = async () => {
    try {
      const response = await fetch('/api/slash-commands');
      if (response.ok) {
        const data = await response.json();
        setSlashCommands(data.commands || []);
      }
    } catch (error) {
      console.error('Error fetching slash commands:', error);
    }
  };

  const flattenFileTree = (files, basePath = '') => {
    let result = [];
    for (const file of files) {
      const fullPath = basePath ? `${basePath}/${file.name}` : file.name;
      if (file.type === 'directory' && file.children) {
        result = result.concat(flattenFileTree(file.children, fullPath));
      } else if (file.type === 'file') {
        result.push({
          name: file.name,
          path: fullPath,
          relativePath: file.path
        });
      }
    }
    return result;
  };

  // Handle @ symbol detection and file filtering
  useEffect(() => {
    const textBeforeCursor = input.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's a space after the @ symbol (which would end the file reference)
      if (!textAfterAt.includes(' ')) {
        setAtSymbolPosition(lastAtIndex);
        setShowFileDropdown(true);
        
        // Filter files based on the text after @
        const filtered = fileList.filter(file => 
          file.name.toLowerCase().includes(textAfterAt.toLowerCase()) ||
          file.path.toLowerCase().includes(textAfterAt.toLowerCase())
        ).slice(0, 10); // Limit to 10 results
        
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

  // Handle / symbol detection and command filtering
  useEffect(() => {
    const textBeforeCursor = input.slice(0, cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    // Only show command menu if / is at the beginning or after a space
    if (lastSlashIndex !== -1) {
      const charBeforeSlash = lastSlashIndex > 0 ? textBeforeCursor[lastSlashIndex - 1] : '';
      if (lastSlashIndex === 0 || charBeforeSlash === ' ' || charBeforeSlash === '\n') {
        const textAfterSlash = textBeforeCursor.slice(lastSlashIndex + 1);
        // Check if there's a space after the / symbol (which would end the command)
        if (!textAfterSlash.includes(' ')) {
          setSlashPosition(lastSlashIndex);
          setShowCommandMenu(true);
          
          // Filter commands based on the text after /
          const filtered = slashCommands.filter(cmd => 
            cmd.command.toLowerCase().includes('/' + textAfterSlash.toLowerCase())
          ).slice(0, 20); // Show more commands
          
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


  // Show only recent messages for better performance (last 100 messages)
  const visibleMessages = useMemo(() => {
    const maxMessages = 100;
    if (chatMessages.length <= maxMessages) {
      return chatMessages;
    }
    return chatMessages.slice(-maxMessages);
  }, [chatMessages]);

  // Capture scroll position before render when auto-scroll is disabled
  useEffect(() => {
    if (!autoScrollToBottom && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      scrollPositionRef.current = {
        height: container.scrollHeight,
        top: container.scrollTop
      };
    }
  });

  useEffect(() => {
    // Only auto-scroll to bottom when new messages arrive if:
    // 1. Auto-scroll is enabled in settings
    // 2. User hasn't manually scrolled up
    if (scrollContainerRef.current && chatMessages.length > 0) {
      if (autoScrollToBottom) {
        if (!isUserScrolledUp) {
          setTimeout(() => scrollToBottom(), 0);
        }
      } else {
        // When auto-scroll is disabled, preserve the visual position
        const container = scrollContainerRef.current;
        const prevHeight = scrollPositionRef.current.height;
        const prevTop = scrollPositionRef.current.top;
        const newHeight = container.scrollHeight;
        const heightDiff = newHeight - prevHeight;
        
        // If content was added above the current view, adjust scroll position
        if (heightDiff > 0 && prevTop > 0) {
          container.scrollTop = prevTop + heightDiff;
        }
      }
    }
  }, [chatMessages.length, isUserScrolledUp, scrollToBottom, autoScrollToBottom]);

  // Scroll to bottom when component mounts with existing messages
  useEffect(() => {
    if (scrollContainerRef.current && chatMessages.length > 0 && autoScrollToBottom) {
      setTimeout(() => scrollToBottom(), 100); // Small delay to ensure rendering
    }
  }, [scrollToBottom, autoScrollToBottom]);

  // Add scroll event listener to detect user scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Initial textarea setup
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      
      // Check if initially expanded
      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight);
      const isExpanded = textareaRef.current.scrollHeight > lineHeight * 2;
      setIsTextareaExpanded(isExpanded);
    }
  }, []); // Only run once on mount

  const handleTranscript = useCallback((text) => {
    if (text.trim()) {
      setInput(prevInput => {
        const newInput = prevInput.trim() ? `${prevInput} ${text}` : text;
        
        // Update textarea height after setting new content
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            
            // Check if expanded after transcript
            const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight);
            const isExpanded = textareaRef.current.scrollHeight > lineHeight * 2;
            setIsTextareaExpanded(isExpanded);
          }
        }, 0);
        
        return newInput;
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedProject) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCanAbortSession(true);
    // Set a default status when starting
    setClaudeStatus({
      text: 'Processing',
      tokens: 0,
      can_interrupt: true
    });
    
    // Always scroll to bottom when user sends a message (they're actively participating)
    setTimeout(() => scrollToBottom(), 0);

    // Session Protection: Mark session as active to prevent automatic project updates during conversation
    // This is crucial for maintaining chat state integrity. We handle two cases:
    // 1. Existing sessions: Use the real currentSessionId
    // 2. New sessions: Generate temporary identifier "new-session-{timestamp}" since real ID comes via WebSocket later
    // This ensures no gap in protection between message send and session creation
    const sessionToActivate = currentSessionId || `new-session-${Date.now()}`;
    if (onSessionActive) {
      onSessionActive(sessionToActivate);
    }

    // Get tools settings from localStorage
    const getToolsSettings = () => {
      try {
        const savedSettings = localStorage.getItem('claude-tools-settings');
        if (savedSettings) {
          return JSON.parse(savedSettings);
        }
      } catch (error) {
        console.error('Error loading tools settings:', error);
      }
      return {
        allowedTools: [],
        disallowedTools: [],
        skipPermissions: false
      };
    };

    const toolsSettings = getToolsSettings();

    // Send command to Claude CLI via WebSocket
    sendMessage({
      type: 'claude-command',
      command: input,
      options: {
        projectPath: selectedProject.path,
        cwd: selectedProject.fullPath,
        sessionId: currentSessionId,
        resume: !!currentSessionId,
        toolsSettings: toolsSettings
      }
    });

    setInput('');
    setIsTextareaExpanded(false);
    // Clear the saved draft since message was sent
    if (selectedProject) {
      localStorage.removeItem(`draft_input_${selectedProject.name}`);
    }
  };

  const handleKeyDown = (e) => {
    // Handle command menu navigation
    if (showCommandMenu && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (selectedCommandIndex >= 0) {
          selectCommand(filteredCommands[selectedCommandIndex]);
        } else if (filteredCommands.length > 0) {
          selectCommand(filteredCommands[0]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandMenu(false);
        return;
      }
    }
    
    // Handle file dropdown navigation
    if (showFileDropdown && filteredFiles.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedFileIndex(prev => 
          prev < filteredFiles.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedFileIndex(prev => 
          prev > 0 ? prev - 1 : filteredFiles.length - 1
        );
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (selectedFileIndex >= 0) {
          selectFile(filteredFiles[selectedFileIndex]);
        } else if (filteredFiles.length > 0) {
          selectFile(filteredFiles[0]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowFileDropdown(false);
        return;
      }
    }
    
    // Handle Enter key: Ctrl+Enter (Cmd+Enter on Mac) sends, Shift+Enter creates new line
    if (e.key === 'Enter') {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        // Ctrl+Enter or Cmd+Enter: Send message
        e.preventDefault();
        handleSubmit(e);
      } else if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        // Plain Enter: Also send message (keeping original behavior)
        e.preventDefault();
        handleSubmit(e);
      }
      // Shift+Enter: Allow default behavior (new line)
    }
  };

  const selectCommand = (command) => {
    const textBeforeSlash = input.slice(0, slashPosition);
    const textAfterSlashQuery = input.slice(slashPosition);
    const spaceIndex = textAfterSlashQuery.indexOf(' ');
    const textAfterQuery = spaceIndex !== -1 ? textAfterSlashQuery.slice(spaceIndex) : '';
    
    const newInput = textBeforeSlash + command.command + ' ' + textAfterQuery;
    setInput(newInput);
    setShowCommandMenu(false);
    setSlashPosition(-1);
    
    // Focus back to textarea and set cursor position
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = textBeforeSlash.length + command.command.length + 1;
      setTimeout(() => {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }, 0);
    }
  };

  const selectFile = (file) => {
    const textBeforeAt = input.slice(0, atSymbolPosition);
    const textAfterAtQuery = input.slice(atSymbolPosition);
    const spaceIndex = textAfterAtQuery.indexOf(' ');
    const textAfterQuery = spaceIndex !== -1 ? textAfterAtQuery.slice(spaceIndex) : '';
    
    const newInput = textBeforeAt + '@' + file.path + textAfterQuery;
    setInput(newInput);
    setShowFileDropdown(false);
    setAtSymbolPosition(-1);
    
    // Focus back to textarea and set cursor position
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = textBeforeAt.length + 1 + file.path.length;
      setTimeout(() => {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }, 0);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleTextareaClick = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  
  const handleAbortSession = () => {
    if (currentSessionId && canAbortSession) {
      sendMessage({
        type: 'abort-session',
        sessionId: currentSessionId
      });
    }
  };

  // Don't render if no project is selected
  if (!selectedProject) {
    return <NoProjectSelected />;
  }

  return (
    <>
      <style>
        {`
          details[open] .details-chevron {
            transform: rotate(180deg);
          }
        `}
      </style>
      <div className="h-full flex flex-col">
        <MessagesArea 
          chatMessages={chatMessages}
          isLoadingSessionMessages={isLoadingSessionMessages}
          visibleMessages={visibleMessages}
          isUserScrolledUp={isUserScrolledUp}
          scrollToBottom={scrollToBottom}
          onFileOpen={onFileOpen}
          onShowSettings={onShowSettings}
          autoExpandTools={autoExpandTools}
          showRawParameters={showRawParameters}
          createDiff={createDiff}
          scrollContainerRef={scrollContainerRef}
          messagesEndRef={messagesEndRef}
        />

        <InputArea
          input={input}
          isInputFocused={isInputFocused}
          setIsInputFocused={setIsInputFocused}
          isTextareaExpanded={isTextareaExpanded}
          setIsTextareaExpanded={setIsTextareaExpanded}
          isLoading={isLoading}
          claudeStatus={claudeStatus}
          showCommandMenu={showCommandMenu}
          filteredCommands={filteredCommands}
          showFileDropdown={showFileDropdown}
          filteredFiles={filteredFiles}
          selectedFileIndex={selectedFileIndex}
          selectedCommandIndex={selectedCommandIndex}
          textareaRef={textareaRef}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          handleTextareaClick={handleTextareaClick}
          handleKeyDown={handleKeyDown}
          handleTranscript={handleTranscript}
          handleAbortSession={handleAbortSession}
          selectCommand={selectCommand}
          selectFile={selectFile}
          setInput={setInput}
          setCursorPosition={setCursorPosition}
        />
      </div>
    </>
  );
}

export default memo(ChatInterface);