import { useState, useRef, useCallback, useEffect } from 'react';

export const useScrollArea = () => {
  const scrollRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const scrollTimeoutRef = useRef(null);

  const calculateScrollMetrics = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const hasScroll = scrollHeight > clientHeight;
    
    setShowScrollbar(hasScroll);

    if (hasScroll) {
      const percentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollPercentage(percentage);
      
      const thumbHeightPercentage = (clientHeight / scrollHeight) * 100;
      setThumbHeight(Math.max(thumbHeightPercentage, 20)); // Minimum 20% height
    }
  }, []);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    calculateScrollMetrics();

    // Hide scrollbar after scrolling stops
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, [calculateScrollMetrics]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // Initial calculation
    calculateScrollMetrics();

    // Add resize observer to recalculate on size changes
    const resizeObserver = new ResizeObserver(calculateScrollMetrics);
    resizeObserver.observe(scrollElement);

    return () => {
      resizeObserver.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [calculateScrollMetrics]);

  return {
    scrollRef,
    isScrolling,
    showScrollbar,
    scrollPercentage,
    thumbHeight,
    handleScroll,
  };
};

export const useScrollToTop = (ref) => {
  const scrollToTop = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [ref]);

  return scrollToTop;
};

export const useScrollToBottom = (ref) => {
  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
    }
  }, [ref]);

  return scrollToBottom;
};