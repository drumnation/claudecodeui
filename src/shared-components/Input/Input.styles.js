import styled from '@emotion/styled';
import tw from 'twin.macro';

export const StyledInput = styled.input`
  ${tw`
    flex
    h-9
    w-full
    rounded-md
    border
    border-gray-300
    bg-transparent
    px-3
    py-1
    text-sm
    shadow-sm
    transition-colors
    placeholder:text-gray-500
    disabled:cursor-not-allowed
    disabled:opacity-50
  `}
  
  &:focus-visible {
    ${tw`
      outline-none
      ring-1
      ring-blue-500
    `}
  }
  
  &:file {
    ${tw`
      border-0
      bg-transparent
      text-sm
      font-medium
      text-gray-900
    `}
  }
`;