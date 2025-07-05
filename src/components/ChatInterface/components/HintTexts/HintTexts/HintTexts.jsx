import React from 'react';
import { HintTextDesktop, HintTextMobile } from './HintTexts.styles';

const HintTexts = ({ isInputFocused }) => {
  return (
    <>
      {/* Hint text */}
      <HintTextDesktop>
        Press Enter to send • Shift+Enter for new line • @ to reference files • / for commands
      </HintTextDesktop>
      <HintTextMobile isInputFocused={isInputFocused}>
        Enter to send • @ for files • / for commands
      </HintTextMobile>
    </>
  );
};

export default HintTexts;