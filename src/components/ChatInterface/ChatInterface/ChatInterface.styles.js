import styled from '@emotion/styled';
import tw from 'twin.macro';

export const ChatInterfaceContainer = styled.div`
  ${tw`h-full flex flex-col`}
`;

export const ChatInterfaceStyles = styled.style`
  details[open] .details-chevron {
    transform: rotate(180deg);
  }
`;