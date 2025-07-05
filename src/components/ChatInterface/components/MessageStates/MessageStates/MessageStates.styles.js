import styled from '@emotion/styled';
import tw from 'twin.macro';

export const LoadingContainer = styled.div`
  ${tw`text-center text-gray-500 dark:text-gray-400 mt-8`}
  ${tw`flex items-center justify-center space-x-2`}
`;

export const LoadingSpinner = styled.div`
  ${tw`animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400`}
`;

export const LoadingText = styled.p`
  ${tw`m-0`}
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

export const EmptyStateDescription = styled.p`
  ${tw`text-sm sm:text-base leading-relaxed`}
`;