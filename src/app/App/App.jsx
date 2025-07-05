import React from 'react';
import Sidebar from '@/layouts/root/Sidebar';
import { MainContent } from '@/layouts/root/MainContent';
import { MobileNav } from '@/layouts/root/MobileNav';
import { ToolsSettings } from '@/features/settings';
import { QuickSettingsPanel } from '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel';
import { useApp } from './App.hook';
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
    navigate
  } = useApp();

  return (
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
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(false);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSidebarOpen(false);
            }}
          />
          <S.MobileSidebarContent 
            $isOpen={sidebarOpen}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ws={ws}
          sendMessage={sendMessage}
          messages={messages}
          isMobile={isMobile}
          onMenuClick={() => setSidebarOpen(true)}
          isLoading={isLoadingProjects}
          onInputFocusChange={setIsInputFocused}
          onSessionActive={markSessionAsActive}
          onSessionInactive={markSessionAsInactive}
          onReplaceTemporarySession={replaceTemporarySession}
          onNavigateToSession={(sessionId) => navigate(`/session/${sessionId}`)}
          onShowSettings={() => setShowToolsSettings(true)}
          autoExpandTools={autoExpandTools}
          showRawParameters={showRawParameters}
          autoScrollToBottom={autoScrollToBottom}
        />
      </S.MainContentArea>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isInputFocused={isInputFocused}
        />
      )}

      {/* Quick Settings Panel - Only show on chat tab */}
      {activeTab === 'chat' && (
        <QuickSettingsPanel
          isOpen={showQuickSettings}
          onToggle={setShowQuickSettings}
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
  );
};