import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for MessagesArea component
 * Manages scroll behavior and visibility states
 */
export const useMessagesArea = ({
  scrollContainerRef,
  messagesEndRef,
  chatMessages,
  onScroll
}) => {
  const scrollTimeoutRef = useRef(null);
  
  /**
   * Scrolls to the bottom of the messages container
   */
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messagesEndRef]);
  
  /**
   * Handles smooth scroll with debouncing
   */
  const handleSmoothScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [scrollToBottom]);
  
  /**
   * Enhanced scroll handler with passive event support
   */
  const handleScroll = useCallback((event) => {
    if (onScroll) {
      onScroll(event);
    }
  }, [onScroll]);
  
  /**
   * Set up scroll event listener with passive option for better performance
   */
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    const options = { passive: true };
    scrollContainer.addEventListener('scroll', handleScroll, options);
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll, options);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollContainerRef, handleScroll]);
  
  /**
   * Auto-scroll when new messages arrive (if user is near bottom)
   */
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isNearBottom && chatMessages.length > 0) {
      handleSmoothScroll();
    }
  }, [chatMessages.length, scrollContainerRef, handleSmoothScroll]);
  
  return {
    scrollToBottom,
    handleSmoothScroll
  };
};