import styled from '@emotion/styled';
import tw from 'twin.macro';

export const ShellContainer = styled.div`
  ${tw`h-full flex flex-col bg-gray-900`}
`;

export const ShellHeader = styled.div`
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

export const TerminalWrapper = styled.div`
  ${tw`flex-1 p-2 overflow-hidden relative`}
`;

export const TerminalContainer = styled.div`
  ${tw`h-full w-full`}
`;

export const OverlayContainer = styled.div`
  ${tw`absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90`}
  ${({ withPadding }) => withPadding && tw`p-4`}
`;

export const LoadingText = styled.div`
  ${tw`text-white`}
`;

export const ConnectContainer = styled.div`
  ${tw`text-center max-w-sm w-full`}
`;

export const ConnectButton = styled.button`
  ${tw`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-base font-medium w-full sm:w-auto`}
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

export const EmptyStateContainer = styled.div`
  ${tw`h-full flex items-center justify-center`}
`;

export const EmptyStateContent = styled.div`
  ${tw`text-center text-gray-500 dark:text-gray-400`}
`;

export const EmptyStateIconWrapper = styled.div`
  ${tw`w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center`}
`;

export const EmptyStateIcon = styled.svg`
  ${tw`w-8 h-8 text-gray-400`}
`;

export const EmptyStateTitle = styled.h3`
  ${tw`text-lg font-semibold mb-2`}
`;

export const EmptyStateDescription = styled.p`
  ${tw``}
`;