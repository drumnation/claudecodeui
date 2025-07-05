import styled from '@emotion/styled';
import tw from 'twin.macro';

export const TerminalWrapper = styled.div`
  ${tw`flex-1 p-2 overflow-hidden relative`}
`;

export const TerminalContainer = styled.div`
  ${tw`h-full w-full`}
`;

export const OverlayContainer = styled.div`
  ${tw`absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90`}
`;

export const LoadingText = styled.div`
  ${tw`text-white`}
`;