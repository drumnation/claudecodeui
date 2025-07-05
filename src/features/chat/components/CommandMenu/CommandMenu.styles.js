import styled from '@emotion/styled';
import tw from 'twin.macro';

export const CommandMenuContainer = styled.div`
  ${tw`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 sm:max-h-64 overflow-y-auto`}
  min-width: 280px;
  max-width: 100%;
`;

export const CommandMenuHeader = styled.div`
  ${tw`p-2 border-b border-gray-200 dark:border-gray-700`}
`;

export const CommandMenuTitle = styled.p`
  ${tw`text-xs text-gray-500 dark:text-gray-400 font-medium`}
`;

export const CommandMenuList = styled.div`
  ${tw`py-1`}
`;

export const CommandMenuItem = styled.div`
  ${tw`px-3 py-2 cursor-pointer flex items-start gap-3`}
  ${({ isSelected }) => 
    isSelected 
      ? tw`bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300`
      : tw`hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`
  }
`;

export const CommandName = styled.span`
  ${tw`font-mono font-medium text-sm`}
  min-width: 100px;
`;

export const CommandDescription = styled.span`
  ${tw`text-sm text-gray-600 dark:text-gray-400 flex-1`}
`;

export const CommandMenuFooter = styled.div`
  ${tw`p-2 border-t border-gray-200 dark:border-gray-700`}
`;

export const CommandMenuHelp = styled.p`
  ${tw`text-xs text-gray-500 dark:text-gray-400`}
`;