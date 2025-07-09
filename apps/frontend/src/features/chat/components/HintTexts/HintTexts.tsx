import React from 'react';
import {
  HintTextDesktop,
  HintTextMobile,
} from '@/features/chat/components/HintTexts/HintTexts.styles';
import {HintTextsProps} from '@/features/chat/components/HintTexts/HintTexts.types';

export const HintTexts = ({isInputFocused}: HintTextsProps) => {
  return (
    <>
      {/* Hint text */}
      <HintTextDesktop>
        Press Enter to send • Shift+Enter for new line • @ to reference files •
        / for commands
      </HintTextDesktop>
      <HintTextMobile isInputFocused={isInputFocused}>
        Enter to send • @ for files • / for commands
      </HintTextMobile>
    </>
  );
};
