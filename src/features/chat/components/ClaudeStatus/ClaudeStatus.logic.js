// Action words that cycle during loading
export const ACTION_WORDS = ['Thinking', 'Processing', 'Analyzing', 'Working', 'Computing', 'Reasoning'];

// Animation spinners
export const SPINNERS = ['✻', '✹', '✸', '✶'];

/**
 * Get the current action word based on elapsed time
 * @param {number} elapsedTime - Elapsed time in seconds
 * @returns {string} Current action word
 */
export const getActionWord = (elapsedTime) => {
  const actionIndex = Math.floor(elapsedTime / 3) % ACTION_WORDS.length;
  return ACTION_WORDS[actionIndex];
};

/**
 * Get the current spinner based on animation phase
 * @param {number} animationPhase - Current animation phase (0-3)
 * @returns {string} Current spinner character
 */
export const getCurrentSpinner = (animationPhase) => {
  return SPINNERS[animationPhase];
};

/**
 * Calculate fake token count based on elapsed time
 * @param {number} elapsedTime - Elapsed time in seconds
 * @returns {number} Simulated token count
 */
export const calculateFakeTokens = (elapsedTime) => {
  // Simulate token count increasing over time (roughly 30-50 tokens per second)
  return Math.floor(elapsedTime * (30 + Math.random() * 20));
};

/**
 * Check if status data is valid and complete
 * @param {Object} status - Status object to validate
 * @returns {boolean} True if status has real data
 */
export const isValidStatus = (status) => {
  if (!status) return false;
  
  // Check if we have real status data (not just defaults)
  const hasRealMessage = status.message && status.message !== 'Working...' && status.message !== 'Processing...';
  const hasRealTokens = typeof status.tokens === 'number' && status.tokens > 0;
  const hasPhase = status.phase && status.phase !== 'idle';
  const hasToolStatus = status.toolStatus && status.toolStatus.name;
  
  return hasRealMessage || hasRealTokens || hasPhase || hasToolStatus;
};

/**
 * Get connection health status
 * @param {string} connectionHealth - Connection health from status
 * @param {number} lastUpdateTime - Timestamp of last status update
 * @returns {string} Connection health state
 */
export const getConnectionHealth = (connectionHealth, lastUpdateTime) => {
  if (connectionHealth) {
    return connectionHealth;
  }
  
  // Fallback: calculate based on time since last update
  const timeSinceUpdate = Date.now() - lastUpdateTime;
  if (timeSinceUpdate < 15000) {
    return 'connected';
  } else if (timeSinceUpdate < 30000) {
    return 'stale';
  } else {
    return 'disconnected';
  }
};

/**
 * Parse status data with connection health awareness
 * @param {Object} status - Status object from props
 * @param {number} elapsedTime - Elapsed time in seconds
 * @param {number} fakeTokens - Simulated token count
 * @param {string} connectionHealth - Current connection health
 * @returns {Object} Parsed status data
 */
export const parseStatusData = (status, elapsedTime, fakeTokens, connectionHealth = 'connected') => {
  const isValid = isValidStatus(status);
  const isConnected = connectionHealth === 'connected';
  
  // Only use fallback data when disconnected or status is invalid
  const useFallback = !isConnected || !isValid;
  
  const statusText = status?.text || status?.message || (useFallback ? getActionWord(elapsedTime) : 'Processing...');
  const tokens = status?.tokens || (useFallback ? fakeTokens : 0);
  const canInterrupt = status?.canInterrupt ?? status?.can_interrupt ?? true;
  const toolStatus = status?.toolStatus || null;
  const contextRemaining = status?.contextRemaining || null;
  const phase = status?.phase || 'processing';
  
  // Handle TokenUsage object format
  let tokenCount = tokens;
  let tokenDetails = null;
  if (typeof tokens === 'object' && tokens !== null) {
    tokenCount = tokens.total || tokens.output || 0;
    tokenDetails = tokens;
  }
  
  return {
    statusText,
    tokens: tokenCount,
    tokenDetails,
    canInterrupt,
    toolStatus,
    contextRemaining,
    phase,
    connectionHealth,
    isUsingFallback: useFallback
  };
};

/**
 * Get debug information for development
 * @param {Object} status - Raw status object
 * @param {string} connectionHealth - Connection health
 * @param {number} lastUpdateTime - Last update timestamp
 * @returns {Object} Debug information
 */
export const getDebugInfo = (status, connectionHealth, lastUpdateTime) => {
  return {
    connectionHealth,
    timeSinceUpdate: Date.now() - lastUpdateTime,
    hasValidStatus: isValidStatus(status),
    statusKeys: status ? Object.keys(status) : [],
    rawStatus: status
  };
};