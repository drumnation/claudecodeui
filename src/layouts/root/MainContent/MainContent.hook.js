/**
 * MainContent.hook.js - Custom hooks for MainContent component
 * Manages state and side effects for the main content area
 */

import { useState, useEffect } from 'react';
import { 
  processServerMessage, 
  shouldRequestScripts,
  createServerScriptsMessage,
  createServerStatusMessage 
} from '@/layouts/root/MainContent/MainContent.logic';

export const useMainContent = (selectedProject, ws, sendMessage, messages) => {
  const [editingFile, setEditingFile] = useState(null);
  const [serverStatus, setServerStatus] = useState('stopped');
  const [serverUrl, setServerUrl] = useState('');
  const [currentScript, setCurrentScript] = useState('');
  const [availableScripts, setAvailableScripts] = useState([]);
  const [serverLogs, setServerLogs] = useState([]);

  // Load available scripts when project changes
  useEffect(() => {
    if (shouldRequestScripts(selectedProject, ws)) {
      console.log('📡 Requesting scripts for project:', selectedProject.fullPath);
      sendMessage(createServerScriptsMessage(selectedProject.fullPath));
      sendMessage(createServerStatusMessage(selectedProject.fullPath));
    }
  }, [selectedProject, ws, sendMessage]);

  // Handle server-related WebSocket messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      const state = { serverLogs };
      const updates = processServerMessage(latestMessage, selectedProject, state);
      
      if (updates) {
        if (updates.availableScripts !== undefined) setAvailableScripts(updates.availableScripts);
        if (updates.serverStatus !== undefined) setServerStatus(updates.serverStatus);
        if (updates.serverUrl !== undefined) setServerUrl(updates.serverUrl);
        if (updates.currentScript !== undefined) setCurrentScript(updates.currentScript);
        if (updates.serverLogs !== undefined) setServerLogs(updates.serverLogs);
      }
    }
  }, [messages, selectedProject, serverLogs]);

  return {
    editingFile,
    setEditingFile,
    serverStatus,
    serverUrl,
    currentScript,
    setCurrentScript,
    availableScripts,
    serverLogs,
    setServerLogs
  };
};