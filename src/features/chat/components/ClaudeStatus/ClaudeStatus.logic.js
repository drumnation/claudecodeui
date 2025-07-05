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
 * Parse status data with fallbacks
 * @param {Object} status - Status object from props
 * @param {number} elapsedTime - Elapsed time in seconds
 * @param {number} fakeTokens - Simulated token count
 * @returns {Object} Parsed status data
 */
export const parseStatusData = (status, elapsedTime, fakeTokens) => {
  const statusText = status?.text || getActionWord(elapsedTime);
  const tokens = status?.tokens || fakeTokens;
  const canInterrupt = status?.can_interrupt !== false;
  
  return {
    statusText,
    tokens,
    canInterrupt
  };
};