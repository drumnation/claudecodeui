import styled from '@emotion/styled';
import tw from 'twin.macro';

export const PermissionContainer = styled.div`
  ${tw`bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm`}
`;

export const PermissionLabel = styled.label`
  ${tw`flex items-start gap-3 cursor-pointer`}
`;

export const PermissionCheckbox = styled.input`
  ${tw`mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600`}
`;

export const PermissionInfo = styled.div`
  ${tw`flex-1`}
`;

export const PermissionTitle = styled.div`
  ${tw`font-medium text-gray-900 dark:text-white`}
`;

export const PermissionDescription = styled.div`
  ${tw`text-sm text-gray-600 dark:text-gray-400 mt-0.5`}
`;