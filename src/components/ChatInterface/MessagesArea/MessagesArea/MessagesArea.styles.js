import styled from '@emotion/styled';
import tw from 'twin.macro';

export const MessagesContainer = styled.div`
  ${tw`flex-1 overflow-y-auto overflow-x-hidden px-0 py-3 sm:p-4 space-y-3 sm:space-y-4 relative`}
`;

export const EmptyStateContainer = styled.div`
  ${tw`flex items-center justify-center h-full`}
`;

export const EmptyStateContent = styled.div`
  ${tw`text-center text-gray-500 dark:text-gray-400 px-6 sm:px-4`}
`;

export const EmptyStateTitle = styled.p`
  ${tw`font-bold text-lg sm:text-xl mb-3`}
`;

export const EmptyStateMessage = styled.p`
  ${tw`text-sm sm:text-base leading-relaxed`}
`;

export const LoadingContainer = styled.div`
  ${tw`text-center text-gray-500 dark:text-gray-400 mt-8`}
`;

export const LoadingContent = styled.div`
  ${tw`flex items-center justify-center space-x-2`}
`;

export const LoadingSpinner = styled.div`
  ${tw`animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400`}
`;

export const LoadingText = styled.p`
  ${tw`text-base`}
`;

export const LoadMoreBanner = styled.div`
  ${tw`text-center text-gray-500 dark:text-gray-400 text-sm py-2 border-b border-gray-200 dark:border-gray-700`}
`;

export const LoadMoreButton = styled.button`
  ${tw`ml-1 text-blue-600 hover:text-blue-700 underline`}
`;

export const ScrollToBottomButton = styled.button`
  ${tw`
    absolute bottom-4 right-4 
    w-10 h-10 
    bg-blue-600 hover:bg-blue-700 
    text-white 
    rounded-full 
    shadow-lg 
    flex items-center justify-center 
    transition-all duration-200 
    hover:scale-105 
    focus:outline-none 
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
    dark:ring-offset-gray-800 
    z-10
  `}
`;

export const ScrollToBottomIcon = styled.svg`
  ${tw`w-5 h-5`}
`;

export const MessagesEndAnchor = styled.div`
  ${tw`h-0`}
`;