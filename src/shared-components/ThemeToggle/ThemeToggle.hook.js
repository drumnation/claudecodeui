import { useTheme } from '@/contexts/ThemeContext';

export const useThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return {
    isDarkMode,
    toggleDarkMode,
  };
};