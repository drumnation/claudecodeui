import styled from '@emotion/styled';
import tw from 'twin.macro';

export const HeaderContainer = styled.div`
  ${tw`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0`}
`;

export const HeaderContent = styled.div`
  ${tw`flex items-center justify-between`}
`;

export const HeaderLeft = styled.div`
  ${tw`flex items-center space-x-2 sm:space-x-3`}
`;

export const MenuButton = styled.button`
  ${tw`p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation active:scale-95`}
`;

export const MenuIcon = styled.svg`
  ${tw`w-6 h-6`}
`;

export const HeaderInfo = styled.div`
  ${tw`min-w-0`}
`;

export const Title = styled.h2`
  ${tw`text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate`}
`;

export const Subtitle = styled.div`
  ${tw`text-xs text-gray-500 dark:text-gray-400 truncate`}
`;

export const SessionId = styled.span`
  ${tw`hidden sm:inline`}
`;