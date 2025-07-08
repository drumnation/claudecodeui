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
  
  // Planner configuration state
  const [plannerEnabled, setPlannerEnabled] = useState(true);
  const [selectedAgents, setSelectedAgents] = useState(['ARCH', 'DIFF', 'DEPS']);
  const [codeqaiEnabled, setCodeqaiEnabled] = useState(true);
  const [codeqaiStatus, setCodeqaiStatus] = useState(null);
  const [contextLimits, setContextLimits] = useState({
    maxResults: 8,
    snippetLength: 500
  });
  const [codeqaiEmbeddingModel, setCodeqaiEmbeddingModel] = useState('sentence-transformers');
  const [codeqaiUseLocalLLM, setCodeqaiUseLocalLLM] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadClaudeCliStatus();
      loadCodeQAIStatus();
    }
  }, [isOpen]);

  const loadSettings = () => {
    const settings = loadSettingsFromStorage();
    setAllowedTools(settings.allowedTools);
    setDisallowedTools(settings.disallowedTools);
    setSkipPermissions(settings.skipPermissions);
    
    // Load planner settings
    setPlannerEnabled(settings.plannerEnabled ?? true);
    setSelectedAgents(settings.selectedAgents ?? ['ARCH', 'DIFF', 'DEPS']);
    setCodeqaiEnabled(settings.codeqaiEnabled ?? true);
    setContextLimits(settings.contextLimits ?? { maxResults: 8, snippetLength: 500 });
    setCodeqaiEmbeddingModel(settings.codeqaiEmbeddingModel ?? 'sentence-transformers');
    setCodeqaiUseLocalLLM(settings.codeqaiUseLocalLLM ?? false);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    const settings = {
      allowedTools,
      disallowedTools,
      skipPermissions,
      plannerEnabled,
      selectedAgents,
      codeqaiEnabled,
      contextLimits,
      codeqaiEmbeddingModel,
      codeqaiUseLocalLLM
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

  const loadCodeQAIStatus = async () => {
    try {
      // Simple check to see if CodeQAI is available
      // In a real implementation, you'd check if the codeqai command exists
      // For now, we'll assume it's available
      setCodeqaiStatus({ available: true });
    } catch (error) {
      setCodeqaiStatus({ available: false, error: error.message });
    }
  };

  // Planner action handlers
  const togglePlanner = () => {
    setPlannerEnabled(!plannerEnabled);
  };

  const toggleAgent = (agentType) => {
    setSelectedAgents(prev => 
      prev.includes(agentType) 
        ? prev.filter(agent => agent !== agentType)
        : [...prev, agentType]
    );
  };

  const toggleCodeQAI = () => {
    setCodeqaiEnabled(!codeqaiEnabled);
  };

  const updateContextLimits = (key, value) => {
    setContextLimits(prev => ({
      ...prev,
      [key]: value
    }));
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
    
    // Planner state
    plannerEnabled,
    selectedAgents,
    codeqaiEnabled,
    codeqaiStatus,
    contextLimits,
    codeqaiEmbeddingModel,
    codeqaiUseLocalLLM,
    setCodeqaiEmbeddingModel,
    setCodeqaiUseLocalLLM,
    
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
    handleSaveClaudeCliPath,
    
    // Planner actions
    togglePlanner,
    toggleAgent,
    toggleCodeQAI,
    updateContextLimits
  };
};