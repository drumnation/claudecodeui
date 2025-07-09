import React, {useEffect} from 'react';
import 'xterm/css/xterm.css';
import {
  TerminalWrapper,
  TerminalContainer,
  OverlayContainer,
  LoadingText,
} from '@/features/terminal/Terminal/Terminal.styles';
import {TerminalProps} from './Terminal.types';
import {useLogger, isLevelEnabled} from '../../../logger';

export const Terminal: React.FC<TerminalProps> = ({
  terminalRef,
  isInitialized,
}) => {
  const logger = useLogger({component: 'Terminal'});

  // Debug logging
  useEffect(() => {
    if (isLevelEnabled(logger, 'debug')) {
      logger.debug('Component rendered', {
        hasTerminalRef: !!terminalRef,
        isInitialized,
        refCurrent: terminalRef?.current,
      });
    }
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
