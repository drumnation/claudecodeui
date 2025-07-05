import styled from '@emotion/styled';
import tw from 'twin.macro';

export const TerminalWrapper = styled.div`
  ${tw`flex-1 p-2 overflow-hidden relative`}
  background-color: #000000;
  color: #00ff00;
  font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
`;

export const TerminalContainer = styled.div`
  ${tw`h-full w-full`}
`;

export const OverlayContainer = styled.div`
  ${tw`absolute inset-0 flex items-center justify-center`}
  background-color: rgba(0, 0, 0, 0.95);
  color: #00ff00;
`;

export const LoadingText = styled.div`
  color: #00ff00;
`;