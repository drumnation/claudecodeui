import styled from '@emotion/styled';
import tw from 'twin.macro';

export const MainContentContainer = styled.div`
  ${tw`h-full flex flex-col`}
`;

export const ContentArea = styled.div`
  ${tw`flex-1 flex flex-col min-h-0 overflow-hidden`}
`;

export const TabContent = styled.div`
  ${tw`h-full`}
  ${props => props.hidden && tw`hidden`}
  ${props => props.$overflow && tw`overflow-hidden`}
`;