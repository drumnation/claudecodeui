import React from 'react';
import 'xterm/css/xterm.css';
import {
  TerminalWrapper,
  TerminalContainer,
  OverlayContainer,
  LoadingText
} from '@/features/terminal/Terminal/Terminal.styles';

export const Terminal = ({ terminalRef, isInitialized }) => {
  return (
    <TerminalWrapper>
      <TerminalContainer ref={terminalRef} />
      
      {/* Loading state */}
      {!isInitialized && (
        <OverlayContainer>
          <LoadingText>Loading terminal...</LoadingText>
        </OverlayContainer>
      )}
    </TerminalWrapper>
  );
};