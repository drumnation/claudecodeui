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
  
  // Claude CLI configuration state
  const [claudeCliPath, setClaudeCliPath] = useState('');
  const [claudeCliStatus, setClaudeCliStatus] = useState(null);
  const [claudeCliTesting, setClaudeCliTesting] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadClaudeCliStatus();
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

  // Claude CLI configuration functions
  const loadClaudeCliStatus = async () => {
    try {
      const response = await fetch('/api/dependencies');
      if (response.ok) {
        const data = await response.json();
        setClaudeCliStatus(data.claudeCli);
      }
    } catch (error) {
      console.error('Error loading Claude CLI status:', error);
    }
  };

  const handleTestClaudeCli = async () => {
    if (!claudeCliPath.trim()) {
      alert('Please enter a path to test');
      return;
    }

    setClaudeCliTesting(true);
    try {
      // For now, just validate if the path looks reasonable
      // In a real implementation, you'd make an API call to test the path
      if (claudeCliPath.includes('claude')) {
        alert('Path appears valid (test would be implemented server-side)');
      } else {
        alert('Path does not appear to be a Claude CLI executable');
      }
    } catch (error) {
      console.error('Error testing Claude CLI path:', error);
      alert('Error testing path: ' + error.message);
    } finally {
      setClaudeCliTesting(false);
    }
  };

  const handleSaveClaudeCliPath = async () => {
    try {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
      // In a real implementation, you'd save to environment variables or config
      // For now, just store locally
      localStorage.setItem('claude-cli-path', claudeCliPath);
      alert('Claude CLI path saved. Restart the application for changes to take effect.');
    } catch (error) {
      console.error('Error saving Claude CLI path:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
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
    
    // Claude CLI state
    claudeCliPath,
    claudeCliStatus,
    claudeCliTesting,
    setClaudeCliPath,
    
    // Actions
    handleAddAllowedTool: addAllowedTool,
    handleRemoveAllowedTool: removeAllowedTool,
    handleAddDisallowedTool: addDisallowedTool,
    handleRemoveDisallowedTool: removeDisallowedTool,
    handleAllowedToolKeyPress,
    handleDisallowedToolKeyPress,
    handleSkipPermissionsChange,
    saveSettings,
    
    // Claude CLI actions
    handleTestClaudeCli,
    handleSaveClaudeCliPath
  };
};