/**
 * EmptyStates.jsx - Empty state components for when no project is selected
 */

import React from 'react';
import {
  EmptyStateContainer,
  EmptyStateContent,
  EmptyStateInner,
  IconWrapper,
  Icon,
  EmptyTitle,
  EmptyDescription,
  TipBox,
  TipText,
  MobileHeaderContainer,
  MobileMenuButton,
  MobileMenuIcon
} from '@/layouts/root/MainContent/EmptyStates/EmptyStates.styles';

export const NoProjectSelected = ({ isMobile, onMenuClick }) => {
  return (
    <EmptyStateContainer>
      {isMobile && <MobileHeader onMenuClick={onMenuClick} />}
      <EmptyStateContent>
        <EmptyStateInner>
          <IconWrapper>
            <Icon fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
            </Icon>
          </IconWrapper>
          <EmptyTitle>Choose Your Project</EmptyTitle>
          <EmptyDescription>
            Select a project from the sidebar to start coding with Claude. 
            Each project contains your chat sessions and file history.
          </EmptyDescription>
          <TipBox>
            <TipText>
              💡 <strong>Tip:</strong> {isMobile 
                ? 'Tap the menu button above to access projects' 
                : 'Create a new project by clicking the folder icon in the sidebar'}
            </TipText>
          </TipBox>
        </EmptyStateInner>
      </EmptyStateContent>
    </EmptyStateContainer>
  );
};

const MobileHeader = ({ onMenuClick }) => {
  return (
    <MobileHeaderContainer>
      <MobileMenuButton onClick={onMenuClick}>
        <MobileMenuIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </MobileMenuIcon>
      </MobileMenuButton>
    </MobileHeaderContainer>
  );
};