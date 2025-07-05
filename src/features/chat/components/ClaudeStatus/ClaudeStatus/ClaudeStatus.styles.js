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
`;

export const StatusContent = styled.div`
  ${tw`flex-1`}
`;

export const StatusItems = styled.div`
  ${tw`flex items-center gap-3`}
`;

export const Spinner = styled.span`
  ${tw`text-xl transition-all duration-500`}
  ${({ $isEven }) => $isEven ? tw`text-blue-400 scale-110` : tw`text-blue-300`}
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
  ${({ $hiddenOnMobile }) => $hiddenOnMobile && tw`hidden sm:inline`}
`;

export const TokenText = styled.span`
  ${tw`text-gray-300 text-sm`}
  ${({ $desktop }) => $desktop ? tw`hidden sm:inline` : tw`sm:hidden`}
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