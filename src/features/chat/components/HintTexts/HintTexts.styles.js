import styled from '@emotion/styled';
import tw from 'twin.macro';

export const HintTextDesktop = styled.div`
  ${tw`text-xs text-gray-500 dark:text-gray-400 text-center mt-2 hidden sm:block`}
`;

export const HintTextMobile = styled.div`
  ${tw`text-xs text-gray-500 dark:text-gray-400 text-center mt-2 sm:hidden transition-opacity duration-200`}
  opacity: ${props => props.isInputFocused ? '1' : '0'};
`;