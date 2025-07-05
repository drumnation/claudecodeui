// QuickSettingsPanel.logic.js
export const WHISPER_MODES = {
  DEFAULT: 'default',
  PROMPT: 'prompt',
  VIBE: 'vibe'
};

export const WHISPER_MODE_CONFIG = {
  [WHISPER_MODES.DEFAULT]: {
    label: 'Default Mode',
    description: 'Direct transcription of your speech',
    icon: 'Mic'
  },
  [WHISPER_MODES.PROMPT]: {
    label: 'Prompt Enhancement',
    description: 'Transform rough ideas into clear, detailed AI prompts',
    icon: 'Sparkles'
  },
  [WHISPER_MODES.VIBE]: {
    label: 'Vibe Mode',
    description: 'Format ideas as clear agent instructions with details',
    icon: 'FileText'
  }
};

export const STORAGE_KEYS = {
  WHISPER_MODE: 'whisperMode'
};

export const EVENTS = {
  WHISPER_MODE_CHANGED: 'whisperModeChanged'
};

export const getStoredWhisperMode = () => {
  return localStorage.getItem(STORAGE_KEYS.WHISPER_MODE) || WHISPER_MODES.DEFAULT;
};

export const setStoredWhisperMode = (mode) => {
  localStorage.setItem(STORAGE_KEYS.WHISPER_MODE, mode);
  window.dispatchEvent(new Event(EVENTS.WHISPER_MODE_CHANGED));
};

export const isLegacyWhisperMode = (mode) => {
  const legacyModes = ['instructions', 'architect'];
  return legacyModes.includes(mode);
};

export const normalizeLegacyWhisperMode = (mode) => {
  if (isLegacyWhisperMode(mode)) {
    return WHISPER_MODES.VIBE;
  }
  return mode;
};

export const getPanelTransformClass = (isOpen, isMobile) => {
  const baseClasses = [
    'fixed',
    'top-0',
    'right-0',
    'h-full',
    'w-64',
    'transform',
    'transition-transform',
    'duration-150',
    'ease-out',
    'z-40'
  ];
  
  if (isOpen) {
    baseClasses.push('translate-x-0');
  } else {
    baseClasses.push('translate-x-full');
  }
  
  if (isMobile) {
    baseClasses.push('h-screen');
  }
  
  return baseClasses;
};

export const getTabPositionClasses = (isOpen, isMobile) => {
  const baseClasses = ['fixed', 'z-50', 'transition-all', 'duration-150', 'ease-out'];
  
  if (isMobile) {
    baseClasses.push('bottom-44');
  } else {
    baseClasses.push('top-1/2', '-translate-y-1/2');
  }
  
  if (isOpen) {
    baseClasses.push('right-64');
  } else {
    baseClasses.push('right-0');
  }
  
  return baseClasses;
};