import styled from '@emotion/styled';
import tw from 'twin.macro';

export const BranchSelectorContainer = styled.div`
  ${tw`relative`}
`;

export const BranchButton = styled.button`
  ${tw`flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors`}
`;

export const BranchDropdown = styled.div`
  ${tw`absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50`}
`;

export const BranchList = styled.div`
  ${tw`py-1 max-h-64 overflow-y-auto`}
`;

export const BranchItem = styled.button`
  ${tw`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700`}
  ${props => props.isActive && tw`bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
  ${props => !props.isActive && tw`text-gray-700 dark:text-gray-300`}
`;