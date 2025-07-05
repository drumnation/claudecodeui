import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeToggle } from './ThemeToggle.hook';
import {
  ToggleButton,
  ToggleSwitch,
  IconWrapper,
  ScreenReaderText,
} from './ThemeToggle.styles';

export const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useThemeToggle();

  return (
    <ToggleButton
      onClick={toggleDarkMode}
      role="switch"
      aria-checked={isDarkMode}
      aria-label="Toggle dark mode"
    >
      <ScreenReaderText>Toggle dark mode</ScreenReaderText>
      <ToggleSwitch $isDarkMode={isDarkMode}>
        <IconWrapper $isDarkMode={isDarkMode}>
          {isDarkMode ? (
            <Moon className="w-3.5 h-3.5 text-gray-700" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-yellow-500" />
          )}
        </IconWrapper>
      </ToggleSwitch>
    </ToggleButton>
  );
};