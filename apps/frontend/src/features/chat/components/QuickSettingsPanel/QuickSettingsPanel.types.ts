export type WhisperMode = 'transcribe' | 'enhance' | 'template';

export interface WhisperModeConfig {
  label: string;
  description: string;
  icon: 'Mic' | 'Sparkles' | 'FileText';
}

export interface QuickSettingsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  autoExpandTools: boolean;
  onAutoExpandChange: (value: boolean) => void;
  showRawParameters: boolean;
  onShowRawParametersChange: (value: boolean) => void;
  autoScrollToBottom: boolean;
  onAutoScrollChange: (value: boolean) => void;
  isMobile?: boolean;
}

export interface PullTabProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export interface AppearanceSectionProps {
  isDarkMode: boolean;
}

export interface ToolDisplaySectionProps {
  settings: {
    autoExpandTools: boolean;
    showRawParameters: boolean;
  };
  onAutoExpandChange: (value: boolean) => void;
  onShowRawParametersChange: (value: boolean) => void;
}

export interface ViewOptionsSectionProps {
  settings: {
    autoScrollToBottom: boolean;
  };
  onAutoScrollChange: (value: boolean) => void;
}

export interface WhisperModeOptionProps {
  mode: WhisperMode;
  config: WhisperModeConfig;
  isChecked: boolean;
  onChange: (mode: WhisperMode) => void;
}

export interface WhisperDictationSectionProps {
  whisperMode: WhisperMode;
  onWhisperModeChange: (mode: WhisperMode) => void;
}

export interface QuickSettingsPanelHookReturn {
  localIsOpen: boolean;
  whisperMode: WhisperMode;
  isDarkMode: boolean;
  handleToggle: () => void;
  handleWhisperModeChange: (mode: WhisperMode) => void;
  handleAutoExpandChange: (value: boolean) => void;
  handleShowRawParametersChange: (value: boolean) => void;
  handleAutoScrollChange: (value: boolean) => void;
  settings: {
    autoExpandTools: boolean;
    showRawParameters: boolean;
    autoScrollToBottom: boolean;
  };
}
