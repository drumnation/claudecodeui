/**
 * ProjectHeader.jsx - Header component showing project and session info
 */

import React from 'react';
import { TabNavigation } from '@/layouts/root/MainContent/TabNavigation';
import {
  HeaderContainer,
  HeaderContent,
  HeaderLeft,
  MenuButton,
  MenuIcon,
  HeaderInfo,
  Title,
  Subtitle,
  SessionId
} from '@/layouts/root/MainContent/ProjectHeader/ProjectHeader.styles';

export const ProjectHeader = ({ 
  selectedProject,
  selectedSession,
  activeTab,
  onTabChange,
  isMobile,
  onMenuClick
}) => {
  const getTitle = () => {
    if (activeTab === 'chat' && selectedSession) {
      return selectedSession.summary;
    }
    if (activeTab === 'chat' && !selectedSession) {
      return 'New Session';
    }
    if (activeTab === 'files') return 'Project Files';
    if (activeTab === 'git') return 'Source Control';
    return 'Project';
  };

  const showSessionId = activeTab === 'chat' && selectedSession;

  return (
    <HeaderContainer>
      <HeaderContent>
        <HeaderLeft>
          {isMobile && (
            <MenuButton
              onClick={onMenuClick}
              onTouchStart={(e) => {
                e.preventDefault();
                onMenuClick();
              }}
            >
              <MenuIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </MenuIcon>
            </MenuButton>
          )}
          <HeaderInfo>
            <Title>{getTitle()}</Title>
            <Subtitle>
              {selectedProject.displayName}
              {showSessionId && (
                <>
                  {' • '}
                  <SessionId>{selectedSession.id}</SessionId>
                </>
              )}
            </Subtitle>
          </HeaderInfo>
        </HeaderLeft>
        
        <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
      </HeaderContent>
    </HeaderContainer>
  );
};