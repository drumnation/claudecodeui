import React from 'react';
import { StyledButton, StyledIcon } from './ScrollToBottomButton.styles';

const ScrollToBottomButton = ({ isUserScrolledUp, chatMessages, scrollToBottom }) => {
  if (!isUserScrolledUp || chatMessages.length === 0) {
    return null;
  }

  return (
    <StyledButton
      onClick={scrollToBottom}
      title="Scroll to bottom"
      aria-label="Scroll to bottom"
    >
      <StyledIcon viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M19 14l-7 7m0 0l-7-7m7 7V3" 
        />
      </StyledIcon>
    </StyledButton>
  );
};

export default ScrollToBottomButton;