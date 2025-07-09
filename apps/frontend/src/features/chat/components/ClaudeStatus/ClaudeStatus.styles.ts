import styled from '@emotion/styled';
import tw from 'twin.macro';

export const StatusContainer = styled.div`
  ${tw`w-full mb-6`}
  animation: slide-in-from-bottom 0.3s ease-out;

  @keyframes slide-in-from-bottom {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const StatusBar = styled.div`
  ${tw`flex items-center justify-between max-w-4xl mx-auto bg-gray-900 dark:bg-gray-950 text-white rounded-lg shadow-lg px-4 py-3`}
  ${({$error}: any) => $error && tw`bg-red-700 dark:bg-red-800`}
`;

export const StatusContent = styled.div`
  ${tw`flex-1`}
`;

export const StatusItems = styled.div`
  ${tw`flex items-center gap-3`}
`;

export const Spinner = styled.span`
  ${tw`text-xl transition-all duration-500`}
  ${({$isEven}: any) =>
    $isEven ? tw`text-blue-400 scale-110` : tw`text-blue-300`}
`;

export const StatusTextContainer = styled.div`
  ${tw`flex-1`}
`;

export const StatusLine = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const StatusText = styled.span`
  ${tw`font-medium text-sm`}
`;

export const TimeText = styled.span`
  ${tw`text-gray-400 text-sm`}
`;

export const Separator = styled.span`
  ${tw`text-gray-400`}
  ${({$hiddenOnMobile}: any) => $hiddenOnMobile && tw`hidden sm:inline`}
`;

export const TokenText = styled.span`
  ${tw`text-gray-300 text-sm`}
  ${({$desktop}: any) => ($desktop ? tw`hidden sm:inline` : tw`sm:hidden`)}
`;

export const HintText = styled.span`
  ${tw`text-gray-300 text-sm hidden sm:inline`}
`;

export const MobileHintText = styled.div`
  ${tw`text-xs text-gray-400 sm:hidden mt-1`}
`;

export const InterruptButton = styled.button`
  ${tw`ml-3 text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md transition-colors flex items-center gap-1.5 flex-shrink-0`}
`;

export const InterruptIcon = styled.svg`
  ${tw`w-3 h-3`}
`;

export const InterruptText = styled.span`
  ${tw`hidden sm:inline`}
`;

// Error-specific styled components
export const ErrorIcon = styled.svg`
  ${tw`w-5 h-5 text-red-300 flex-shrink-0`}
`;

export const ErrorContent = styled.div`
  ${tw`flex-1 ml-3`}
`;

export const ErrorMessage = styled.div`
  ${tw`font-medium text-sm text-white mb-1`}
`;

export const ErrorActions = styled.div`
  ${tw`flex items-center gap-2 text-xs`}
`;

export const ErrorLink = styled.a`
  ${tw`text-red-200 hover:text-white underline transition-colors`}
`;

export const ErrorSeparator = styled.span`
  ${tw`text-red-300`}
`;

export const SettingsButton = styled.button`
  ${tw`text-red-200 hover:text-white underline transition-colors bg-transparent border-none cursor-pointer p-0`}
`;

// Connection health indicator
export const ConnectionIndicator = styled.div`
  ${tw`w-2 h-2 rounded-full flex-shrink-0`}
  background-color: ${({$color}: any) => $color};
  box-shadow: 0 0 0 2px ${({$color}: any) => $color}33;
  animation: ${({$color}: any) =>
    $color === '#f59e0b'
      ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      : $color === '#ef4444'
        ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        : 'none'};

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

// Debug info components
export const DebugInfo = styled.div`
  ${tw`mt-2 p-3 bg-gray-800 dark:bg-gray-900 rounded-lg text-xs font-mono text-gray-400 max-w-4xl mx-auto`}
`;

export const DebugRow = styled.div`
  ${tw`flex items-center gap-2 py-0.5`}
`;

export const DebugLabel = styled.span`
  ${tw`text-gray-500 min-w-[140px]`}
`;

export const DebugValue = styled.span`
  ${tw`text-gray-300`}
`;
