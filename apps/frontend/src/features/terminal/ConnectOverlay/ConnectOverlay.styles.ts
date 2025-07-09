import styled from '@emotion/styled';
import tw from 'twin.macro';

export const OverlayContainer = styled.div`
  ${tw`absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90`}
  ${({withPadding}: any) => withPadding && tw`p-4`}
  z-index: 9999;
  /* Debug styling - add visible border and shadow */
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  border: 2px solid rgba(0, 255, 0, 0.1);
  /* Ensure minimum dimensions */
  min-width: 100%;
  min-height: 100%;
`;

export const ConnectContainer = styled.div`
  ${tw`text-center max-w-sm w-full`}
`;

export const ConnectButton = styled.button`
  ${tw`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-base font-medium w-full sm:w-auto mx-auto`}
  /* Ensure button is clickable with high z-index */
  position: relative;
  z-index: 10000;
  cursor: pointer;
  /* Add shadow for better visibility */
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.06);
`;

export const ConnectIcon = styled.svg`
  ${tw`w-5 h-5`}
`;

export const ConnectDescription = styled.p`
  ${tw`text-gray-400 text-sm mt-3 px-2`}
`;

export const ConnectingContainer = styled.div`
  ${tw`text-center max-w-sm w-full`}
`;

export const ConnectingContent = styled.div`
  ${tw`flex items-center justify-center space-x-3 text-yellow-400`}
`;

export const Spinner = styled.div`
  ${tw`w-6 h-6 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent`}
`;

export const ConnectingText = styled.span`
  ${tw`text-base font-medium`}
`;

export const ConnectingDescription = styled.p`
  ${tw`text-gray-400 text-sm mt-3 px-2`}
`;
