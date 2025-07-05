// Business logic for ToolsSettings component

// Common tool patterns available for quick-add
export const commonTools = [
  'Bash(git log:*)',
  'Bash(git diff:*)',
  'Bash(git status:*)',
  'Write',
  'Read',
  'Edit',
  'Glob',
  'Grep',
  'MultiEdit',
  'Task',
  'TodoWrite',
  'TodoRead',
  'WebFetch',
  'WebSearch'
];

// Default settings structure
export const defaultSettings = {
  allowedTools: [],
  disallowedTools: [],
  skipPermissions: false
};

// Storage key for localStorage
export const STORAGE_KEY = 'claude-tools-settings';

// Load settings from localStorage
export const loadSettingsFromStorage = () => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return {
        allowedTools: settings.allowedTools || [],
        disallowedTools: settings.disallowedTools || [],
        skipPermissions: settings.skipPermissions || false
      };
    }
    
    return defaultSettings;
  } catch (error) {
    console.error('Error loading tool settings:', error);
    return defaultSettings;
  }
};

// Save settings to localStorage
export const saveSettingsToStorage = (settings) => {
  try {
    const settingsWithTimestamp = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsWithTimestamp));
    return { success: true };
  } catch (error) {
    console.error('Error saving tool settings:', error);
    return { success: false, error };
  }
};

// Validate tool pattern
export const isValidToolPattern = (tool) => {
  return tool && tool.trim().length > 0;
};

// Check if tool already exists in list
export const toolExistsInList = (tool, list) => {
  return list.includes(tool);
};

// Add tool to list if valid and not duplicate
export const addToolToList = (tool, list) => {
  if (!isValidToolPattern(tool)) {
    return { success: false, reason: 'Invalid tool pattern' };
  }
  
  if (toolExistsInList(tool, list)) {
    return { success: false, reason: 'Tool already exists' };
  }
  
  return { success: true, newList: [...list, tool] };
};

// Remove tool from list
export const removeToolFromList = (tool, list) => {
  return list.filter(t => t !== tool);
};