import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Header = styled.div`
  ${tw`flex-shrink-0 bg-gray-800 border-b border-gray-700 px-4 py-2`}
`;

export const HeaderContent = styled.div`
  ${tw`flex items-center justify-between`}
`;

export const StatusGroup = styled.div`
  ${tw`flex items-center space-x-2`}
`;

export const StatusIndicator = styled.div`
  ${tw`w-2 h-2 rounded-full`}
  ${({ isConnected }) => isConnected ? tw`bg-green-500` : tw`bg-red-500`}
`;

export const SessionInfo = styled.span`
  ${tw`text-xs text-blue-300`}
`;

export const SessionLabel = styled.span`
  ${tw`text-xs text-gray-400`}
`;

export const StatusMessage = styled.span`
  ${tw`text-xs`}
  ${({ type }) => {
    switch (type) {
      case 'initializing':
        return tw`text-yellow-400`;
      case 'restarting':
        return tw`text-blue-400`;
      default:
        return tw`text-gray-400`;
    }
  }}
`;

export const ControlGroup = styled.div`
  ${tw`flex items-center space-x-3`}
`;

export const DisconnectButton = styled.button`
  ${tw`px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-1`}
`;

export const RestartButton = styled.button`
  ${tw`text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1`}
`;

export const IconSvg = styled.svg`
  ${tw`w-3 h-3`}
`;