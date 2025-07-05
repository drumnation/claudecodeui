/**
 * MessagesArea business logic and helper functions
 */

/**
 * Groups consecutive messages from the same sender
 * @param {Array} messages - Array of messages to group
 * @returns {Array} Grouped messages with metadata
 */
export const groupConsecutiveMessages = (messages) => {
  if (!messages || messages.length === 0) return [];
  
  const grouped = [];
  let currentGroup = null;
  
  messages.forEach((message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const isSameType = prevMessage && prevMessage.type === message.type;
    const isConsecutive = prevMessage && 
      message.timestamp && 
      prevMessage.timestamp &&
      (message.timestamp - prevMessage.timestamp) < 60000; // Within 1 minute
    
    if (isSameType && isConsecutive && !message.isToolUse && !prevMessage.isToolUse) {
      if (!currentGroup) {
        currentGroup = {
          type: message.type,
          messages: [prevMessage],
          startIndex: index - 1
        };
        grouped.pop(); // Remove the previous message as it's now part of the group
      }
      currentGroup.messages.push(message);
    } else {
      if (currentGroup) {
        grouped.push(currentGroup);
        currentGroup = null;
      }
      grouped.push(message);
    }
  });
  
  if (currentGroup) {
    grouped.push(currentGroup);
  }
  
  return grouped;
};

/**
 * Determines if a message should show a timestamp
 * @param {Object} message - Current message
 * @param {Object} prevMessage - Previous message
 * @returns {boolean} Whether to show timestamp
 */
export const shouldShowTimestamp = (message, prevMessage) => {
  if (!prevMessage) return true;
  if (!message.timestamp || !prevMessage.timestamp) return false;
  
  const timeDiff = message.timestamp - prevMessage.timestamp;
  return timeDiff > 300000; // Show if more than 5 minutes apart
};

/**
 * Formats a relative timestamp
 * @param {Date} timestamp - The timestamp to format
 * @returns {string} Formatted timestamp
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return timestamp.toLocaleDateString();
};

/**
 * Calculates if the scroll button should be shown
 * @param {boolean} isUserScrolledUp - Whether user has scrolled up
 * @param {number} messageCount - Total number of messages
 * @returns {boolean} Whether to show scroll button
 */
export const shouldShowScrollButton = (isUserScrolledUp, messageCount) => {
  return isUserScrolledUp && messageCount > 0;
};

/**
 * Gets the empty state message based on loading state
 * @param {boolean} isLoading - Whether messages are loading
 * @returns {Object} Empty state configuration
 */
export const getEmptyStateConfig = (isLoading) => {
  if (isLoading) {
    return {
      title: '',
      message: 'Loading session messages...',
      showSpinner: true
    };
  }
  
  return {
    title: 'Start a conversation with Claude',
    message: 'Ask questions about your code, request changes, or get help with development tasks',
    showSpinner: false
  };
};

/**
 * Determines if the "Load earlier messages" banner should be shown
 * @param {number} totalMessages - Total message count
 * @param {number} visibleMessages - Visible message count
 * @returns {boolean} Whether to show the banner
 */
export const shouldShowLoadMoreBanner = (totalMessages, visibleMessages) => {
  return totalMessages > 100 && visibleMessages === 100;
};