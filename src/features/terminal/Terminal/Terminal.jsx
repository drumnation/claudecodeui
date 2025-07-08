import React, { useEffect } from 'react';
import 'xterm/css/xterm.css';
import {
  TerminalWrapper,
  TerminalContainer,
  OverlayContainer,
  LoadingText
} from '@/features/terminal/Terminal/Terminal.styles';

export const Terminal = ({ terminalRef, isInitialized }) => {
  // Debug logging
  useEffect(() => {
    console.log('[Terminal] Component rendered', {
      hasTerminalRef: !!terminalRef,
      isInitialized,
      refCurrent: terminalRef?.current
    });
  }, [terminalRef, isInitialized]);
  
  return (
    <TerminalWrapper>
      <TerminalContainer 
        ref={terminalRef} 
        data-testid="terminal-container"
        data-initialized={isInitialized}
      />
      
      {/* Loading state */}
      {!isInitialized && (
        <OverlayContainer>
          <LoadingText>Loading terminal...</LoadingText>
        </OverlayContainer>
      )}
    </TerminalWrapper>
  );
};