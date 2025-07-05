/**
 * LoadingState.jsx - Loading state component
 */

import React from 'react';
import {
  LoadingContainer,
  LoadingContent,
  LoadingInner,
  SpinnerWrapper,
  Spinner,
  LoadingTitle,
  LoadingText,
  MobileHeaderContainer,
  MobileMenuButton,
  MobileMenuIcon
} from '@/layouts/root/MainContent/LoadingState/LoadingState.styles';

export const LoadingState = ({ isMobile, onMenuClick }) => {
  return (
    <LoadingContainer>
      {isMobile && <MobileHeader onMenuClick={onMenuClick} />}
      <LoadingContent>
        <LoadingInner>
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
          <LoadingTitle>Loading Claude Code UI</LoadingTitle>
          <LoadingText>Setting up your workspace...</LoadingText>
        </LoadingInner>
      </LoadingContent>
    </LoadingContainer>
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