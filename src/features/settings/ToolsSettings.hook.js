import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  loadSettingsFromStorage,
  saveSettingsToStorage,
  addToolToList,
  removeToolFromList
} from '@/features/settings/ToolsSettings.logic';

// Custom hook for ToolsSettings
export const useToolsSettings = (isOpen, onClose) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [allowedTools, setAllowedTools] = useState([]);
  const [disallowedTools, setDisallowedTools] = useState([]);
  const [newAllowedTool, setNewAllowedTool] = useState('');
  const [newDisallowedTool, setNewDisallowedTool] = useState('');
  const [skipPermissions, setSkipPermissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = () => {
    const settings = loadSettingsFromStorage();
    setAllowedTools(settings.allowedTools);
    setDisallowedTools(settings.disallowedTools);
    setSkipPermissions(settings.skipPermissions);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    const settings = {
      allowedTools,
      disallowedTools,
      skipPermissions
    };
    
    const result = saveSettingsToStorage(settings);
    
    if (result.success) {
      setSaveStatus('success');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setSaveStatus('error');
    }
    
    setIsSaving(false);
  };

  const addAllowedTool = (tool) => {
    const result = addToolToList(tool, allowedTools);
    if (result.success) {
      setAllowedTools(result.newList);
      setNewAllowedTool('');
    }
  };

  const removeAllowedTool = (tool) => {
    setAllowedTools(removeToolFromList(tool, allowedTools));
  };

  const addDisallowedTool = (tool) => {
    const result = addToolToList(tool, disallowedTools);
    if (result.success) {
      setDisallowedTools(result.newList);
      setNewDisallowedTool('');
    }
  };

  const removeDisallowedTool = (tool) => {
    setDisallowedTools(removeToolFromList(tool, disallowedTools));
  };

  const handleAllowedToolKeyPress = (e) => {
    if (e.key === 'Enter') {
      addAllowedTool(newAllowedTool);
    }
  };

  const handleDisallowedToolKeyPress = (e) => {
    if (e.key === 'Enter') {
      addDisallowedTool(newDisallowedTool);
    }
  };

  const handleSkipPermissionsChange = (e) => {
    setSkipPermissions(e.target.checked);
  };

  return {
    // Theme
    isDarkMode,
    toggleDarkMode,
    
    // State
    allowedTools,
    disallowedTools,
    newAllowedTool,
    setNewAllowedTool,
    newDisallowedTool,
    setNewDisallowedTool,
    skipPermissions,
    isSaving,
    saveStatus,
    
    // Actions
    handleAddAllowedTool: addAllowedTool,
    handleRemoveAllowedTool: removeAllowedTool,
    handleAddDisallowedTool: addDisallowedTool,
    handleRemoveDisallowedTool: removeDisallowedTool,
    handleAllowedToolKeyPress,
    handleDisallowedToolKeyPress,
    handleSkipPermissionsChange,
    saveSettings
  };
};