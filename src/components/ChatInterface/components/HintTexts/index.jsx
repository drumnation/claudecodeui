import React from 'react';

const HintTexts = ({ isInputFocused }) => {
  return (
    <>
      {/* Hint text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 hidden sm:block">
        Press Enter to send • Shift+Enter for new line • @ to reference files • / for commands
      </div>
      <div className={`text-xs text-gray-500 dark:text-gray-400 text-center mt-2 sm:hidden transition-opacity duration-200 ${
        isInputFocused ? 'opacity-100' : 'opacity-0'
      }`}>
        Enter to send • @ for files • / for commands
      </div>
    </>
  );
};

export default HintTexts;