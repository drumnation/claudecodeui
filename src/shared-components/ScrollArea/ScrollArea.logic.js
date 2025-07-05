/**
 * Calculate the thumb position based on scroll percentage
 * @param {number} scrollPercentage - Current scroll percentage (0-100)
 * @param {number} thumbHeight - Height of the thumb as percentage (0-100)
 * @returns {number} - Top position as percentage
 */
export const calculateThumbPosition = (scrollPercentage, thumbHeight) => {
  const availableSpace = 100 - thumbHeight;
  return (scrollPercentage / 100) * availableSpace;
};

/**
 * Determine if scrollbar should be shown
 * @param {HTMLElement} element - The scrollable element
 * @returns {boolean} - Whether to show scrollbar
 */
export const shouldShowScrollbar = (element) => {
  if (!element) return false;
  return element.scrollHeight > element.clientHeight;
};

/**
 * Calculate scroll percentage from element
 * @param {HTMLElement} element - The scrollable element
 * @returns {number} - Scroll percentage (0-100)
 */
export const getScrollPercentage = (element) => {
  if (!element) return 0;
  
  const { scrollTop, scrollHeight, clientHeight } = element;
  const maxScroll = scrollHeight - clientHeight;
  
  if (maxScroll === 0) return 0;
  return (scrollTop / maxScroll) * 100;
};

/**
 * Calculate thumb height based on viewport and content ratio
 * @param {HTMLElement} element - The scrollable element
 * @param {number} minHeight - Minimum height percentage (default: 20)
 * @returns {number} - Thumb height as percentage
 */
export const calculateThumbHeight = (element, minHeight = 20) => {
  if (!element) return minHeight;
  
  const { scrollHeight, clientHeight } = element;
  const ratio = (clientHeight / scrollHeight) * 100;
  
  return Math.max(ratio, minHeight);
};

/**
 * Smooth scroll to position
 * @param {HTMLElement} element - The scrollable element
 * @param {number} position - Target scroll position
 * @param {number} duration - Animation duration in ms
 */
export const smoothScrollTo = (element, position, duration = 300) => {
  if (!element) return;
  
  const start = element.scrollTop;
  const distance = position - start;
  const startTime = performance.now();
  
  const easeInOutCubic = (t) => {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);
    
    element.scrollTop = start + distance * easedProgress;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

/**
 * Check if element is at top or bottom
 * @param {HTMLElement} element - The scrollable element
 * @returns {{ isAtTop: boolean, isAtBottom: boolean }}
 */
export const getScrollBoundaries = (element) => {
  if (!element) return { isAtTop: true, isAtBottom: true };
  
  const { scrollTop, scrollHeight, clientHeight } = element;
  const isAtTop = scrollTop === 0;
  const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
  
  return { isAtTop, isAtBottom };
};