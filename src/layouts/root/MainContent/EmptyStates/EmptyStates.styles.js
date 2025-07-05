import styled from '@emotion/styled';
import tw from 'twin.macro';

export const EmptyStateContainer = styled.div`
  ${tw`h-full flex flex-col`}
`;

export const EmptyStateContent = styled.div`
  ${tw`flex-1 flex items-center justify-center`}
`;

export const EmptyStateInner = styled.div`
  ${tw`text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto px-6`}
`;

export const IconWrapper = styled.div`
  ${tw`w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center`}
`;

export const Icon = styled.svg`
  ${tw`w-8 h-8 text-gray-400`}
`;

export const EmptyTitle = styled.h2`
  ${tw`text-2xl font-semibold mb-3 text-gray-900 dark:text-white`}
`;

export const EmptyDescription = styled.p`
  ${tw`text-gray-600 dark:text-gray-300 mb-6 leading-relaxed`}
`;

export const TipBox = styled.div`
  ${tw`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800`}
`;

export const TipText = styled.p`
  ${tw`text-sm text-blue-700 dark:text-blue-300`}
`;

export const MobileHeaderContainer = styled.div`
  ${tw`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0`}
`;

export const MobileMenuButton = styled.button`
  ${tw`p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700`}
`;

export const MobileMenuIcon = styled.svg`
  ${tw`w-5 h-5`}
`;