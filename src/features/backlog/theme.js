// Default theme for BacklogBoard when Emotion theme is not provided
export const defaultTheme = {
  colors: {
    // Light mode colors
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981'
  },
  fonts: {
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
  }
};

// Dark mode theme
export const darkTheme = {
  colors: {
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981'
  },
  fonts: {
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
  }
};

// Get theme based on dark mode
export const getTheme = (isDarkMode) => isDarkMode ? darkTheme : defaultTheme;