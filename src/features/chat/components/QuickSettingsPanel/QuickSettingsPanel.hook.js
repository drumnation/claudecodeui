// QuickSettingsPanel.hook.js
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  getStoredWhisperMode, 
  setStoredWhisperMode,
  normalizeLegacyWhisperMode,
  WHISPER_MODES 
} from '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel.logic';

export const useQuickSettingsPanel = ({ 
  isOpen, 
  onToggle,
  autoExpandTools,
  onAutoExpandChange,
  showRawParameters,
  onShowRawParametersChange,
  autoScrollToBottom,
  onAutoScrollChange
}) => {
  const [localIsOpen, setLocalIsOpen] = useState(isOpen);
  const [whisperMode, setWhisperMode] = useState(() => {
    const storedMode = getStoredWhisperMode();
    return normalizeLegacyWhisperMode(storedMode);
  });
  const { isDarkMode } = useTheme();

  useEffect(() => {
    setLocalIsOpen(isOpen);
  }, [isOpen]);

  const handleToggle = () => {
    const newState = !localIsOpen;
    setLocalIsOpen(newState);
    onToggle(newState);
  };

  const handleWhisperModeChange = (mode) => {
    setWhisperMode(mode);
    setStoredWhisperMode(mode);
  };

  const handleAutoExpandChange = (checked) => {
    onAutoExpandChange(checked);
  };

  const handleShowRawParametersChange = (checked) => {
    onShowRawParametersChange(checked);
  };

  const handleAutoScrollChange = (checked) => {
    onAutoScrollChange(checked);
  };

  return {
    localIsOpen,
    whisperMode,
    isDarkMode,
    handleToggle,
    handleWhisperModeChange,
    handleAutoExpandChange,
    handleShowRawParametersChange,
    handleAutoScrollChange,
    settings: {
      autoExpandTools,
      showRawParameters,
      autoScrollToBottom
    }
  };
};