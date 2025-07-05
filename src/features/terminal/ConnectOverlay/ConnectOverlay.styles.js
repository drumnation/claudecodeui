import styled from '@emotion/styled';
import tw from 'twin.macro';

export const OverlayContainer = styled.div`
  ${tw`absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90`}
  ${({ withPadding }) => withPadding && tw`p-4`}
`;

export const ConnectContainer = styled.div`
  ${tw`text-center max-w-sm w-full`}
`;

export const ConnectButton = styled.button`
  ${tw`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-base font-medium w-full sm:w-auto mx-auto`}
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