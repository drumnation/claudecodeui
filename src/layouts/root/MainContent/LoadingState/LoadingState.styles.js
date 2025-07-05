import styled from '@emotion/styled';
import tw from 'twin.macro';
import { keyframes } from '@emotion/react';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const LoadingContainer = styled.div`
  ${tw`h-full flex flex-col`}
`;

export const LoadingContent = styled.div`
  ${tw`flex-1 flex items-center justify-center`}
`;

export const LoadingInner = styled.div`
  ${tw`text-center text-gray-500 dark:text-gray-400`}
`;

export const SpinnerWrapper = styled.div`
  ${tw`w-12 h-12 mx-auto mb-4`}
`;

export const Spinner = styled.div`
  ${tw`w-full h-full rounded-full border-4 border-gray-200 border-t-blue-500`}
  animation: ${spin} 1s linear infinite;
`;

export const LoadingTitle = styled.h2`
  ${tw`text-xl font-semibold mb-2`}
`;

export const LoadingText = styled.p``;

export const MobileHeaderContainer = styled.div`
  ${tw`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0`}
`;

export const MobileMenuButton = styled.button`
  ${tw`p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700`}
`;

export const MobileMenuIcon = styled.svg`
  ${tw`w-5 h-5`}
`;