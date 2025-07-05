import styled from '@emotion/styled';
import tw from 'twin.macro';

export const MobileNavContainer = styled.div`
  ${tw`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-in-out shadow-lg`}
  ${tw`border-t border-gray-200 dark:border-gray-700`}
  ${({ isInputFocused }) => isInputFocused ? tw`translate-y-full` : tw`translate-y-0`}
  
  background-color: ${({ isDarkMode }) => isDarkMode ? '#1f2937' : '#ffffff'} !important;
  
  &:hover {
    background-color: ${({ isDarkMode }) => isDarkMode ? '#1f2937' : '#ffffff'} !important;
  }
  
  /* iOS safe area handling */
  padding-bottom: env(safe-area-inset-bottom, 0);
`;

export const NavWrapper = styled.div`
  ${tw`flex items-center justify-around py-1`}
`;

export const NavButton = styled.button`
  ${tw`flex items-center justify-center p-2 rounded-lg min-h-[40px] min-w-[40px] relative`}
  ${({ isActive }) => isActive 
    ? tw`text-blue-600 dark:text-blue-400` 
    : tw`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`
  }
  
  /* Touch manipulation for better mobile experience */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    transform: scale(0.95);
  }
`;

export const ActiveIndicator = styled.div`
  ${tw`absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full`}
`;

export const IconWrapper = styled.div`
  ${tw`w-5 h-5`}
  
  svg {
    ${tw`w-full h-full`}
  }
`;