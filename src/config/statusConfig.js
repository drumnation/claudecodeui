/**
 * Configuration constants for the status system
 */

export const STATUS_CONFIG = {
  // Heartbeat configuration
  HEARTBEAT_INTERVAL: 5000, // 5 seconds
  HEARTBEAT_MIN_INTERVAL: 5000, // 5 seconds
  HEARTBEAT_MAX_INTERVAL: 10000, // 10 seconds
  
  // Connection timeout thresholds
  CONNECTION_TIMEOUT: 30000, // 30 seconds - complete timeout
  STALE_CONNECTION_THRESHOLD: 15000, // 15 seconds - connection considered stale
  
  // Retry configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_BACKOFF_BASE: 1000, // 1 second
  RETRY_BACKOFF_MULTIPLIER: 2,
  MAX_RETRY_DELAY: 30000, // 30 seconds
  
  // Fallback behavior
  FALLBACK_MODE_DELAY: 10000, // 10 seconds - delay before showing fallback UI
  USE_FALLBACK_WHEN_STALE: true,
  USE_FALLBACK_WHEN_DISCONNECTED: true,
  
  // Message queue
  MESSAGE_QUEUE_SIZE: 100,
  MESSAGE_REPLAY_LIMIT: 50,
  
  // Status validation
  REQUIRE_VALID_STATUS: true,
  MIN_STATUS_FIELDS: ['message', 'phase'], // At least one of these must be present
  
  // Debug mode
  DEBUG_MODE_ENABLED: process.env.NODE_ENV === 'development',
  DEBUG_SHORTCUT_KEY: 'D', // Ctrl+Shift+D
  
  // Status update behavior
  STATUS_UPDATE_DEBOUNCE: 100, // 100ms - debounce rapid status updates
  STATUS_HISTORY_SIZE: 100, // Keep last 100 status updates
  
  // Connection health colors
  CONNECTION_COLORS: {
    connected: '#22c55e', // green
    stale: '#f59e0b', // yellow/amber
    disconnected: '#ef4444' // red
  },
  
  // Animation configuration
  SPINNER_ANIMATION_DURATION: 500, // 500ms per spinner phase
  ACTION_WORD_CYCLE_DURATION: 3000, // 3 seconds per action word
  
  // Token simulation (fallback mode)
  FAKE_TOKEN_MIN_RATE: 30, // Min tokens per second
  FAKE_TOKEN_MAX_RATE: 50, // Max tokens per second
  
  // Tool status display
  SHOW_TOOL_STATUS: true,
  SHOW_CONTEXT_REMAINING: true,
  
  // Mobile-specific
  MOBILE_SIMPLIFIED_STATUS: true,
  MOBILE_HIDE_TOKEN_DETAILS: false
};

/**
 * Get configuration value with optional override
 * @param {string} key - Configuration key
 * @param {any} override - Optional override value
 * @returns {any} Configuration value
 */
export function getConfig(key, override) {
  if (override !== undefined) {
    return override;
  }
  return STATUS_CONFIG[key];
}

/**
 * Check if we should use fallback mode based on connection health
 * @param {string} connectionHealth - Current connection health
 * @returns {boolean} Whether to use fallback mode
 */
export function shouldUseFallback(connectionHealth) {
  switch (connectionHealth) {
    case 'connected':
      return false;
    case 'stale':
      return STATUS_CONFIG.USE_FALLBACK_WHEN_STALE;
    case 'disconnected':
      return STATUS_CONFIG.USE_FALLBACK_WHEN_DISCONNECTED;
    default:
      return true;
  }
}

/**
 * Get connection color based on health
 * @param {string} connectionHealth - Current connection health
 * @returns {string} Color hex code
 */
export function getConnectionColor(connectionHealth) {
  return STATUS_CONFIG.CONNECTION_COLORS[connectionHealth] || STATUS_CONFIG.CONNECTION_COLORS.disconnected;
}

/**
 * Calculate fake token count for fallback mode
 * @param {number} elapsedSeconds - Elapsed time in seconds
 * @returns {number} Simulated token count
 */
export function calculateFakeTokens(elapsedSeconds) {
  const rate = STATUS_CONFIG.FAKE_TOKEN_MIN_RATE + 
    Math.random() * (STATUS_CONFIG.FAKE_TOKEN_MAX_RATE - STATUS_CONFIG.FAKE_TOKEN_MIN_RATE);
  return Math.floor(elapsedSeconds * rate);
}