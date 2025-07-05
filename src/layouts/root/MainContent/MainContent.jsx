/**
 * MainContent.jsx - Main Content Area with Session Protection Props Passthrough
 * 
 * SESSION PROTECTION PASSTHROUGH:
 * ===============================
 * 
 * This component serves as a passthrough layer for Session Protection functions:
 * - Receives session management functions from App.jsx
 * - Passes them down to ChatInterface.jsx
 * 
 * No session protection logic is implemented here - it's purely a props bridge.
 */

import React from 'react';
import { ChatInterface } from '@/features/chat';
import { FileTree } from '@/features/files';
import { CodeEditor } from '@/shared-components/CodeEditor';
import { Shell } from '@/features/terminal';
import { GitPanel } from '@/features/git';
import { LivePreviewPanel } from '@/features/preview';

import { ProjectHeader } from '@/layouts/root/MainContent/ProjectHeader';
import { NoProjectSelected } from '@/layouts/root/MainContent/EmptyStates';
import { LoadingState } from '@/layouts/root/MainContent/LoadingState';

import { useMainContent } from '@/layouts/root/MainContent/MainContent.hook';
import { createFileObject, createServerStartMessage, createServerStopMessage } from '@/layouts/root/MainContent/MainContent.logic';
import { MainContentContainer, ContentArea, TabContent } from '@/layouts/root/MainContent/MainContent.styles';

export const MainContent = ({ 
  selectedProject, 
  selectedSession, 
  activeTab, 
  setActiveTab, 
  ws, 
  sendMessage, 
  messages,
  isMobile,
  onMenuClick,
  isLoading,
  onInputFocusChange,
  // Session Protection Props: Functions passed down from App.jsx to manage active session state
  // These functions control when project updates are paused during active conversations
  onSessionActive,        // Mark session as active when user sends message
  onSessionInactive,      // Mark session as inactive when conversation completes/aborts  
  onReplaceTemporarySession, // Replace temporary session ID with real session ID from WebSocket
  onNavigateToSession,    // Navigate to a specific session (for Claude CLI session duplication workaround)
  onShowSettings,         // Show tools settings panel
  autoExpandTools,        // Auto-expand tool accordions
  showRawParameters,      // Show raw parameters in tool accordions
  autoScrollToBottom      // Auto-scroll to bottom when new messages arrive
}) => {
  const {
    editingFile,
    setEditingFile,
    serverStatus,
    serverUrl,
    currentScript,
    setCurrentScript,
    availableScripts,
    serverLogs,
    setServerLogs
  } = useMainContent(selectedProject, ws, sendMessage, messages);

  const handleFileOpen = (filePath, diffInfo = null) => {
    const file = createFileObject(filePath, selectedProject, diffInfo);
    setEditingFile(file);
  };

  const handleCloseEditor = () => {
    setEditingFile(null);
  };

  if (isLoading) {
    return <LoadingState isMobile={isMobile} onMenuClick={onMenuClick} />;
  }

  if (!selectedProject) {
    return <NoProjectSelected isMobile={isMobile} onMenuClick={onMenuClick} />;
  }

  return (
    <MainContentContainer>
      <ProjectHeader
        selectedProject={selectedProject}
        selectedSession={selectedSession}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobile={isMobile}
        onMenuClick={onMenuClick}
      />

      <ContentArea>
        <TabContent hidden={activeTab !== 'chat'}>
          <ChatInterface
            selectedProject={selectedProject}
            selectedSession={selectedSession}
            ws={ws}
            sendMessage={sendMessage}
            messages={messages}
            onFileOpen={handleFileOpen}
            onInputFocusChange={onInputFocusChange}
            onSessionActive={onSessionActive}
            onSessionInactive={onSessionInactive}
            onReplaceTemporarySession={onReplaceTemporarySession}
            onNavigateToSession={onNavigateToSession}
            onShowSettings={onShowSettings}
            autoExpandTools={autoExpandTools}
            showRawParameters={showRawParameters}
            autoScrollToBottom={autoScrollToBottom}
          />
        </TabContent>
        
        <TabContent hidden={activeTab !== 'files'} $overflow>
          <FileTree selectedProject={selectedProject} />
        </TabContent>
        
        <TabContent hidden={activeTab !== 'shell'} $overflow>
          <Shell 
            selectedProject={selectedProject} 
            selectedSession={selectedSession}
            isActive={activeTab === 'shell'}
          />
        </TabContent>
        
        <TabContent hidden={activeTab !== 'git'} $overflow>
          <GitPanel selectedProject={selectedProject} isMobile={isMobile} />
        </TabContent>
        
        <TabContent hidden={activeTab !== 'preview'} $overflow>
          <LivePreviewPanel
            selectedProject={selectedProject}
            serverStatus={serverStatus}
            serverUrl={serverUrl}
            availableScripts={availableScripts}
            onStartServer={(script) => {
              sendMessage(createServerStartMessage(selectedProject?.fullPath, script));
            }}
            onStopServer={() => {
              sendMessage(createServerStopMessage(selectedProject?.fullPath));
            }}
            onScriptSelect={setCurrentScript}
            currentScript={currentScript}
            isMobile={isMobile}
            serverLogs={serverLogs}
            onClearLogs={() => setServerLogs([])}
          />
        </TabContent>
      </ContentArea>

      {editingFile && (
        <CodeEditor
          file={editingFile}
          onClose={handleCloseEditor}
          projectPath={selectedProject?.path}
        />
      )}
    </MainContentContainer>
  );
};