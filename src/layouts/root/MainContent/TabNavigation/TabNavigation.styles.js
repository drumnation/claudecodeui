import styled from '@emotion/styled';
import tw from 'twin.macro';

export const TabContainer = styled.div`
  ${tw`flex-shrink-0 hidden sm:block`}
`;

export const TabWrapper = styled.div`
  ${tw`relative flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1`}
`;

export const TabButton = styled.button`
  ${tw`relative px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200`}
  ${props => props.active 
    ? tw`bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm`
    : tw`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`
  }
`;

export const TabContent = styled.span`
  ${tw`flex items-center gap-1 sm:gap-1.5`}
`;

export const TabIcon = styled.svg`
  ${tw`w-3 sm:w-3.5 h-3 sm:h-3.5`}
`;

export const TabLabel = styled.span`
  ${tw`hidden sm:inline`}
`;