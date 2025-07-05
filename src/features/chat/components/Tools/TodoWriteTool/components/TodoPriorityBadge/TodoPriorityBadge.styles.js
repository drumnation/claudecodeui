import styled from '@emotion/styled';
import tw from 'twin.macro';

export const HighPriorityBadge = styled.div`
  ${tw`text-xs px-2 py-0.5`}
  ${tw`bg-red-100 dark:bg-red-900/30`}
  ${tw`text-red-700 dark:text-red-300`}
  ${tw`border-red-200 dark:border-red-800`}
`;

export const MediumPriorityBadge = styled.div`
  ${tw`text-xs px-2 py-0.5`}
  ${tw`bg-yellow-100 dark:bg-yellow-900/30`}
  ${tw`text-yellow-700 dark:text-yellow-300`}
  ${tw`border-yellow-200 dark:border-yellow-800`}
`;

export const LowPriorityBadge = styled.div`
  ${tw`text-xs px-2 py-0.5`}
  ${tw`bg-gray-100 dark:bg-gray-800`}
  ${tw`text-gray-600 dark:text-gray-400`}
  ${tw`border-gray-200 dark:border-gray-700`}
`;