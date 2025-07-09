/**
 * Configuration constants for the status system
 */

// Types for status system
export type ConnectionHealth = 'connected' | 'stale' | 'disconnected';

interface ConnectionColors {
  connected: string;
  stale: string;
  disconnected: string;
}

interface StatusConfig {
  // Heartbeat configuration
  HEARTBEAT_INTERVAL: number;
  HEARTBEAT_MIN_INTERVAL: number;
  HEARTBEAT_MAX_INTERVAL: number;

  // Connection timeout thresholds
  CONNECTION_TIMEOUT: number;
  STALE_CONNECTION_THRESHOLD: number;

  // Retry configuration
  MAX_RETRY_ATTEMPTS: number;
  RETRY_BACKOFF_BASE: number;
  RETRY_BACKOFF_MULTIPLIER: number;
  MAX_RETRY_DELAY: number;

  // Fallback behavior
  FALLBACK_MODE_DELAY: number;
  USE_FALLBACK_WHEN_STALE: boolean;
  USE_FALLBACK_WHEN_DISCONNECTED: boolean;

  // Message queue
  MESSAGE_QUEUE_SIZE: number;
  MESSAGE_REPLAY_LIMIT: number;

  // Status validation
  REQUIRE_VALID_STATUS: boolean;
  MIN_STATUS_FIELDS: string[];

  // Debug mode
  DEBUG_MODE_ENABLED: boolean;
  DEBUG_SHORTCUT_KEY: string;

  // Status update behavior
  STATUS_UPDATE_DEBOUNCE: number;
  STATUS_HISTORY_SIZE: number;

  // Connection health colors
  CONNECTION_COLORS: ConnectionColors;

  // Animation configuration
  SPINNER_ANIMATION_DURATION: number;
  ACTION_WORD_CYCLE_DURATION: number;

  // Token simulation (fallback mode)
  FAKE_TOKEN_MIN_RATE: number;
  FAKE_TOKEN_MAX_RATE: number;

  // Tool status display
  SHOW_TOOL_STATUS: boolean;
  SHOW_CONTEXT_REMAINING: boolean;

  // Mobile-specific
  MOBILE_SIMPLIFIED_STATUS: boolean;
  MOBILE_HIDE_TOKEN_DETAILS: boolean;
}

export const STATUS_CONFIG: StatusConfig = {
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
    disconnected: '#ef4444', // red
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
  MOBILE_HIDE_TOKEN_DETAILS: false,
};

/**
 * Get configuration value with optional override
 */
export function getConfig<K extends keyof StatusConfig>(
  key: K,
  override?: StatusConfig[K],
): StatusConfig[K] {
  if (override !== undefined) {
    return override;
  }
  return STATUS_CONFIG[key];
}

/**
 * Check if we should use fallback mode based on connection health
 */
export function shouldUseFallback(connectionHealth: ConnectionHealth): boolean {
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
 */
export function getConnectionColor(connectionHealth: ConnectionHealth): string {
  return (
    STATUS_CONFIG.CONNECTION_COLORS[connectionHealth] ||
    STATUS_CONFIG.CONNECTION_COLORS.disconnected
  );
}

/**
 * Calculate fake token count for fallback mode
 */
export function calculateFakeTokens(elapsedSeconds: number): number {
  const rate =
    STATUS_CONFIG.FAKE_TOKEN_MIN_RATE +
    Math.random() *
      (STATUS_CONFIG.FAKE_TOKEN_MAX_RATE - STATUS_CONFIG.FAKE_TOKEN_MIN_RATE);
  return Math.floor(elapsedSeconds * rate);
}
