import React from "react";
import { useLogger } from "@kit/logger/react";
import { useTheme } from "@/contexts/ThemeContext";

export interface DarkModeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  className = "",
  size = "md"
}) => {
  const logger = useLogger({ scope: 'DarkModeToggle' });
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleToggle = () => {
    const previousMode = isDarkMode ? 'dark' : 'light';
    const newMode = isDarkMode ? 'light' : 'dark';
    
    logger.info('Theme toggle initiated', {
      previousMode,
      newMode,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
    });
    
    toggleDarkMode();
  };

  React.useEffect(() => {
    logger.debug('DarkModeToggle mounted', {
      currentMode: isDarkMode ? 'dark' : 'light',
      size
    });
  }, [isDarkMode, size, logger]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'h-6 w-10',
          thumb: 'h-4 w-4',
          translate: isDarkMode ? 'translate-x-5' : 'translate-x-0.5',
          icon: 'w-2.5 h-2.5'
        };
      case 'lg':
        return {
          button: 'h-10 w-16',
          thumb: 'h-8 w-8',
          translate: isDarkMode ? 'translate-x-8' : 'translate-x-1',
          icon: 'w-4 h-4'
        };
      case 'md':
      default:
        return {
          button: 'h-8 w-14',
          thumb: 'h-6 w-6',
          translate: isDarkMode ? 'translate-x-7' : 'translate-x-1',
          icon: 'w-3.5 h-3.5'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex ${sizeClasses.button} items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${className}`}
      role="switch"
      aria-checked={isDarkMode}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      data-testid="dark-mode-toggle"
    >
      <span className="sr-only">Toggle dark mode</span>
      <span
        className={`${sizeClasses.translate} inline-block ${sizeClasses.thumb} transform rounded-full bg-white shadow-lg transition-transform duration-200 flex items-center justify-center`}
      >
        {isDarkMode ? (
          <svg
            className={`${sizeClasses.icon} text-gray-700`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
            className={`${sizeClasses.icon} text-yellow-500`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </span>
    </button>
  );
};

export { DarkModeToggle };