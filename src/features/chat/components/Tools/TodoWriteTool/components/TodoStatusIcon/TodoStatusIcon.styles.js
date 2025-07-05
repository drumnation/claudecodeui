import styled from '@emotion/styled';
import tw from 'twin.macro';

export const CompletedIcon = styled.div`
  ${tw`w-4 h-4 text-green-500 dark:text-green-400`}
`;

export const InProgressIcon = styled.div`
  ${tw`w-4 h-4 text-blue-500 dark:text-blue-400`}
`;

export const PendingIcon = styled.div`
  ${tw`w-4 h-4 text-gray-400 dark:text-gray-500`}
`;