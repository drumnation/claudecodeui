/**
 * Color themes for @kit/logger
 * Each theme provides colors for different log levels and metadata
 */

export interface ThemeDefinition {
  /** Color for timestamp */
  time: string;
  /** Color for logger scope/name */
  scope: string;
  /** Trace level (10) */
  10: string;
  /** Debug level (20) */
  20: string;
  /** Info level (30) */
  30: string;
  /** Warn level (40) */
  40: string;
  /** Error level (50) */
  50: string;
  /** Fatal level (60) */
  60: string;
}

export type ThemeName = 'Classic' | 'Dracula' | 'Solarized' | 'Nord' | 'Gruvbox' | 'NightOwl' | 'Monochrome';

// Classic theme - matches the original logger colors
export const Classic: ThemeDefinition = {
  time: '#A0A0A0',
  scope: '#FFEB3B',
  10: '#9E9E9E', // trace - gray
  20: '#2196F3', // debug - blue
  30: '#4CAF50', // info - green
  40: '#FF9800', // warn - orange
  50: '#F44336', // error - red
  60: '#9C27B0', // fatal - purple
};

// Dracula theme - dark and vibrant
export const Dracula: ThemeDefinition = {
  time: '#6272a4',
  scope: '#f1fa8c',
  10: '#6272a4', // trace - comment gray
  20: '#8be9fd', // debug - cyan
  30: '#50fa7b', // info - green
  40: '#ffb86c', // warn - orange
  50: '#ff5555', // error - red
  60: '#ff79c6', // fatal - pink
};

// Solarized theme - balanced and scientific
export const Solarized: ThemeDefinition = {
  time: '#93a1a1',
  scope: '#b58900',
  10: '#586e75', // trace - base01
  20: '#268bd2', // debug - blue
  30: '#859900', // info - green
  40: '#cb4b16', // warn - orange
  50: '#dc322f', // error - red
  60: '#d33682', // fatal - magenta
};

// Nord theme - arctic and clean
export const Nord: ThemeDefinition = {
  time: '#4C566A',
  scope: '#EBCB8B',
  10: '#4C566A', // trace - nord3
  20: '#81A1C1', // debug - nord9
  30: '#A3BE8C', // info - nord14
  40: '#D08770', // warn - nord12
  50: '#BF616A', // error - nord11
  60: '#B48EAD', // fatal - nord15
};

// Gruvbox theme - retro and warm
export const Gruvbox: ThemeDefinition = {
  time: '#928374',
  scope: '#fabd2f',
  10: '#928374', // trace - gray
  20: '#83a598', // debug - blue
  30: '#b8bb26', // info - green
  40: '#fe8019', // warn - orange
  50: '#fb4934', // error - red
  60: '#d3869b', // fatal - purple
};

// Night Owl theme - optimized for night coding
export const NightOwl: ThemeDefinition = {
  time: '#5f7e97',
  scope: '#ecc48d',
  10: '#5f7e97', // trace - gray
  20: '#82aaff', // debug - blue
  30: '#addb67', // info - green
  40: '#ffcb8b', // warn - orange
  50: '#ff5874', // error - red
  60: '#c792ea', // fatal - purple
};

// Monochrome theme - no colors, uses ANSI styles
export const Monochrome: ThemeDefinition = {
  time: 'dim',
  scope: 'bold',
  10: 'dim',      // trace - dim
  20: 'normal',   // debug - normal
  30: 'normal',   // info - normal
  40: 'bold',     // warn - bold
  50: 'bold',     // error - bold
  60: 'inverse',  // fatal - inverse
};

// Theme registry
export const themes: Record<ThemeName, ThemeDefinition> = {
  Classic,
  Dracula,
  Solarized,
  Nord,
  Gruvbox,
  NightOwl,
  Monochrome,
};

/**
 * Get a theme definition by name
 */
export function getThemeByName(name: string): ThemeDefinition | undefined {
  return themes[name as ThemeName];
}

/**
 * Check if a theme name is valid
 */
export function isValidTheme(name: string): name is ThemeName {
  return name in themes;
}

/**
 * Resolve a theme from a name or definition
 * Falls back to Classic theme if invalid
 */
export function resolveTheme(
  theme?: string | ThemeDefinition
): ThemeDefinition {
  if (!theme) {
    return Classic;
  }

  if (typeof theme === 'string') {
    return getThemeByName(theme) || Classic;
  }

  return theme;
}