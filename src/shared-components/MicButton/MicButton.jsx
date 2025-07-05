import React from 'react';
import { Mic, Loader2, Brain } from 'lucide-react';
import { useMicButton } from '@/shared-components/MicButton/MicButton.hook';
import {
  MicButtonContainer,
  StyledButton,
  ErrorMessage,
  AnimatedRing
} from '@/shared-components/MicButton/MicButton.styles';

export const MicButton = ({ onTranscript, className = '' }) => {
  const {
    state,
    error,
    handleClick,
    buttonConfig
  } = useMicButton({ onTranscript });

  // Get the appropriate icon based on state
  const getIcon = () => {
    switch (buttonConfig.iconType) {
      case 'loader':
        return <Loader2 {...buttonConfig.iconProps} />;
      case 'brain':
        return <Brain {...buttonConfig.iconProps} />;
      case 'mic':
      default:
        return <Mic {...buttonConfig.iconProps} />;
    }
  };

  return (
    <MicButtonContainer className={className}>
      <StyledButton
        type="button"
        $state={state}
        $disabled={buttonConfig.disabled}
        $animateButton={buttonConfig.animateButton}
        onClick={handleClick}
        disabled={buttonConfig.disabled}
      >
        {getIcon()}
      </StyledButton>
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      
      {buttonConfig.showRing && (
        <AnimatedRing $color={buttonConfig.ringColor} />
      )}
    </MicButtonContainer>
  );
};