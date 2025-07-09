import React from 'react';
import Sidebar from '@/layouts/root/Sidebar';
import {MainContent} from '@/layouts/root/MainContent';
import {MobileNav} from '@/layouts/root/MobileNav';
import {ToolsSettings} from '@/features/settings';
import {QuickSettingsPanel} from '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel';
import {ErrorBoundary} from '@/shared-components/ErrorBoundary';
import {useApp} from './App.hook';
import * as S from './App.styles';

/**
 * Main App component
 * Orchestrates the application layout with session protection system
 */
export const App = () => {
  const {
    // State
    projects,
    selectedProject,
    selectedSession,
    activeTab,
    isMobile,
    sidebarOpen,
    isLoadingProjects,
    projectsError,
    isInputFocused,
    showToolsSettings,
    showQuickSettings,
    autoExpandTools,
    showRawParameters,
    autoScrollToBottom,

    // WebSocket
    ws,
    sendMessage,
    messages,
    connectionHealth,

    // Setters
    setActiveTab,
    setSidebarOpen,
    setIsInputFocused,
    setShowToolsSettings,
    setShowQuickSettings,

    // Handlers
    handleProjectSelect,
    handleSessionSelect,
    handleNewSession,
    handleSessionDelete,
    handleSidebarRefresh,
    handleProjectDelete,
    markSessionAsActive,
    markSessionAsInactive,
    replaceTemporarySession,
    handleAutoExpandChange,
    handleShowRawParametersChange,
    handleAutoScrollChange,

    // Navigation
    navigate,
  } = useApp();

  return (
    <ErrorBoundary
      level="page"
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <S.AppContainer>
        {/* Fixed Desktop Sidebar */}
        {!isMobile && (
          <S.DesktopSidebar>
            <S.SidebarContent>
              <Sidebar
                projects={projects}
                selectedProject={selectedProject}
                selectedSession={selectedSession}
                onProjectSelect={handleProjectSelect}
                onSessionSelect={handleSessionSelect}
                onNewSession={handleNewSession}
                onSessionDelete={handleSessionDelete}
                onProjectDelete={handleProjectDelete}
                isLoading={isLoadingProjects}
                error={projectsError}
                onRefresh={handleSidebarRefresh}
                onShowSettings={() => setShowToolsSettings(true)}
              />
            </S.SidebarContent>
          </S.DesktopSidebar>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && (
          <S.MobileSidebarOverlay $isOpen={sidebarOpen}>
            <S.MobileSidebarBackdrop
              onClick={(e: any) => {
                e.stopPropagation();
                setSidebarOpen(false);
              }}
              onTouchEnd={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
            <S.MobileSidebarContent
              $isOpen={sidebarOpen}
              onClick={(e: any) => e.stopPropagation()}
            >
              <Sidebar
                projects={projects}
                selectedProject={selectedProject}
                selectedSession={selectedSession}
                onProjectSelect={handleProjectSelect}
                onSessionSelect={handleSessionSelect}
                onNewSession={handleNewSession}
                onSessionDelete={handleSessionDelete}
                onProjectDelete={handleProjectDelete}
                isLoading={isLoadingProjects}
                error={projectsError}
                onRefresh={handleSidebarRefresh}
                onShowSettings={() => setShowToolsSettings(true)}
              />
            </S.MobileSidebarContent>
          </S.MobileSidebarOverlay>
        )}

        {/* Main Content Area - Flexible */}
        <S.MainContentArea>
          <MainContent
            selectedProject={selectedProject}
            selectedSession={selectedSession}
            activeTab={
              activeTab as import('@/layouts/root/MainContent/MainContent.types').TabId
            }
            setActiveTab={
              setActiveTab as (
                tab: import('@/layouts/root/MainContent/MainContent.types').TabId,
              ) => void
            }
            ws={ws}
            sendMessage={sendMessage}
            messages={messages}
            connectionHealth={{
              status:
                connectionHealth === 'connected'
                  ? 'connected'
                  : connectionHealth === 'connecting'
                    ? 'connecting'
                    : 'disconnected',
              lastPing: Date.now(),
              error:
                connectionHealth === 'disconnected'
                  ? 'Connection lost'
                  : undefined,
            }}
            isMobile={isMobile}
            onMenuClick={() => {
              setSidebarOpen(true);
            }}
            isLoading={isLoadingProjects}
            onInputFocusChange={setIsInputFocused}
            onSessionActive={() =>
              markSessionAsActive(selectedSession?.id || '')
            }
            onSessionInactive={() =>
              markSessionAsInactive(selectedSession?.id || '')
            }
            onReplaceTemporarySession={replaceTemporarySession}
            onNavigateToSession={(projectId: string, sessionId: string) =>
              navigate(`/session/${sessionId}`)
            }
            onShowSettings={() => setShowToolsSettings(true)}
            autoExpandTools={autoExpandTools}
            showRawParameters={showRawParameters}
            autoScrollToBottom={autoScrollToBottom}
          />
        </S.MainContentArea>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileNav
            activeTab={
              activeTab as import('@/layouts/root/MainContent/MainContent.types').TabId
            }
            setActiveTab={
              setActiveTab as (
                tab: import('@/layouts/root/MainContent/MainContent.types').TabId,
              ) => void
            }
            isInputFocused={isInputFocused}
          />
        )}

        {/* Quick Settings Panel - Only show on chat tab */}
        {activeTab === 'chat' && (
          <QuickSettingsPanel
            isOpen={showQuickSettings}
            onToggle={() => setShowQuickSettings(!showQuickSettings)}
            autoExpandTools={autoExpandTools}
            onAutoExpandChange={handleAutoExpandChange}
            showRawParameters={showRawParameters}
            onShowRawParametersChange={handleShowRawParametersChange}
            autoScrollToBottom={autoScrollToBottom}
            onAutoScrollChange={handleAutoScrollChange}
            isMobile={isMobile}
          />
        )}

        {/* Tools Settings Modal */}
        <ToolsSettings
          isOpen={showToolsSettings}
          onClose={() => setShowToolsSettings(false)}
        />
      </S.AppContainer>
    </ErrorBoundary>
  );
};
