import styled from '@emotion/styled';
import tw from 'twin.macro';

export const ToggleButton = styled.button`
  ${tw`
    relative
    inline-flex
    h-8
    w-14
    items-center
    rounded-full
    bg-gray-200
    dark:bg-gray-700
    transition-colors
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    focus:ring-offset-2
    dark:focus:ring-offset-gray-900
  `}
`;

export const ToggleSwitch = styled.span`
  ${tw`
    inline-block
    h-6
    w-6
    transform
    rounded-full
    bg-white
    shadow-lg
    transition-transform
    duration-200
    flex
    items-center
    justify-center
  `}
  
  ${({ $isDarkMode }) => $isDarkMode ? tw`translate-x-7` : tw`translate-x-1`}
`;

export const IconWrapper = styled.span`
  ${({ $isDarkMode }) => $isDarkMode ? tw`text-gray-700` : tw`text-yellow-500`}
`;

export const ScreenReaderText = styled.span`
  ${tw`sr-only`}
`;