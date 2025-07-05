import styled from '@emotion/styled';
import tw from 'twin.macro';

export const CompletedBadge = styled.div`
  ${tw`text-xs px-2 py-0.5`}
  ${tw`bg-green-100 dark:bg-green-900/30`}
  ${tw`text-green-800 dark:text-green-200`}
  ${tw`border-green-200 dark:border-green-800`}
`;

export const InProgressBadge = styled.div`
  ${tw`text-xs px-2 py-0.5`}
  ${tw`bg-blue-100 dark:bg-blue-900/30`}
  ${tw`text-blue-800 dark:text-blue-200`}
  ${tw`border-blue-200 dark:border-blue-800`}
`;

export const PendingBadge = styled.div`
  ${tw`text-xs px-2 py-0.5`}
  ${tw`bg-gray-100 dark:bg-gray-800`}
  ${tw`text-gray-600 dark:text-gray-400`}
  ${tw`border-gray-200 dark:border-gray-700`}
`;