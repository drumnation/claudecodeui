// Helper functions
export const getIconForMode = (isDarkMode) => {
  return isDarkMode ? 'moon' : 'sun';
};

export const getTogglePosition = (isDarkMode) => {
  return isDarkMode ? 'translate-x-7' : 'translate-x-1';
};