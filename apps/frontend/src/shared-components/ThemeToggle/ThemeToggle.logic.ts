// Helper functions
export const getIconForMode = (isDarkMode: any) => {
  return isDarkMode ? 'moon' : 'sun';
};

export const getTogglePosition = (isDarkMode: any) => {
  return isDarkMode ? 'translate-x-7' : 'translate-x-1';
};
