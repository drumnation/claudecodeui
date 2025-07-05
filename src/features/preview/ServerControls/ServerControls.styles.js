import styled from '@emotion/styled';
import tw from 'twin.macro';

export const ControlsContainer = styled.div`
  ${tw`flex items-center gap-2 px-2 pb-2`}
  ${({ isMobile }) => isMobile && tw`flex-col`}
`;

export const ScriptSelectorContainer = styled.div`
  ${({ isMobile }) => isMobile ? tw`w-full flex gap-2` : tw`flex-1 flex gap-2`}
`;

export const ScriptSelect = styled.select`
  ${tw`
    flex-1 h-10 px-3 text-base bg-card dark:bg-gray-700 
    text-foreground dark:text-gray-100 
    border border-border dark:border-gray-600 
    rounded-md 
    focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-blue-500
  `}
  font-size: 16px; /* Prevent zoom on iOS */
`;

export const ButtonsContainer = styled.div`
  ${tw`flex gap-2`}
  ${({ isMobile }) => isMobile && tw`w-full`}
`;