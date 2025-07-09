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
import {ChatInterface} from '@/features/chat';
import {FileTree} from '@/features/files';
import {CodeEditor} from '@/shared-components/CodeEditor';
import {Shell} from '@/features/terminal';
import {GitPanel} from '@/features/git';
import {LivePreviewPanel} from '@/features/preview';
import {BacklogBoard} from '@/features/backlog';
import {ErrorBoundary} from '@/shared-components/ErrorBoundary';

import {ProjectHeader} from '@/layouts/root/MainContent/ProjectHeader';
import {NoProjectSelected} from '@/layouts/root/MainContent/EmptyStates';
import {LoadingState} from '@/layouts/root/MainContent/LoadingState';

import {useMainContent} from '@/layouts/root/MainContent/MainContent.hook';
import {
  createFileObject,
  createServerStartMessage,
  createServerStopMessage,
} from '@/layouts/root/MainContent/MainContent.logic';
import {
  MainContentContainer,
  ContentArea,
  TabContent,
} from '@/layouts/root/MainContent/MainContent.styles';
import {MainContentProps} from './MainContent.types';

export const MainContent = ({
  selectedProject,
  selectedSession,
  activeTab,
  setActiveTab,
  ws,
  sendMessage,
  messages,
  connectionHealth,
  isMobile,
  onMenuClick,
  isLoading,
  onInputFocusChange,

  // Session Protection Props: Functions passed down from App.jsx to manage active session state
  // These functions control when project updates are paused during active conversations
  // Mark session as active when user sends message
  onSessionActive,

  // Mark session as inactive when conversation completes/aborts
  onSessionInactive,

  // Replace temporary session ID with real session ID from WebSocket
  onReplaceTemporarySession,

  // Navigate to a specific session (for Claude CLI session duplication workaround)
  onNavigateToSession,

  // Show tools settings panel
  onShowSettings,

  // Auto-expand tool accordions
  autoExpandTools,

  // Show raw parameters in tool accordions
  showRawParameters,

  // Auto-scroll to bottom when new messages arrive
  autoScrollToBottom,
}: MainContentProps) => {
  const {
    editingFile,
    setEditingFile,
    serverStatus,
    serverUrl,
    currentScript,
    setCurrentScript,
    availableScripts,
    serverLogs,
    setServerLogs,
    gitStatus,
    setGitStatus,
  } = useMainContent(selectedProject, ws, sendMessage, messages);

  const handleFileOpen = (filePath: string, diffInfo = null) => {
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
    <ErrorBoundary
      level="component"
      showDetails={process.env.NODE_ENV === 'development'}
    >
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
              connectionHealth={connectionHealth}
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
            <FileTree selectedProject={selectedProject} gitStatus={gitStatus} />
          </TabContent>

          <TabContent hidden={activeTab !== 'shell'} $overflow>
            <Shell
              selectedProject={selectedProject}
              selectedSession={selectedSession}
              isActive={activeTab === 'shell'}
            />
          </TabContent>

          <TabContent hidden={activeTab !== 'git'} $overflow>
            <GitPanel
              selectedProject={selectedProject}
              isMobile={isMobile}
              gitStatus={gitStatus}
              onGitStatusChange={setGitStatus}
            />
          </TabContent>

          <TabContent hidden={activeTab !== 'backlog'} $overflow>
            <BacklogBoard
              selectedProject={selectedProject}
              selectedSession={selectedSession}
            />
          </TabContent>

          <TabContent hidden={activeTab !== 'preview'} $overflow>
            <LivePreviewPanel
              selectedProject={selectedProject}
              serverStatus={serverStatus}
              serverUrl={serverUrl}
              availableScripts={availableScripts}
              onStartServer={(script: string) => {
                sendMessage(
                  createServerStartMessage(selectedProject?.fullPath, script),
                );
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
    </ErrorBoundary>
  );
};
