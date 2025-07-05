import styled from '@emotion/styled';
import tw from 'twin.macro';

export const ItemContainer = styled.div`
  ${tw`flex items-start gap-3 p-3`}
  ${tw`bg-white dark:bg-gray-800`}
  ${tw`border border-gray-200 dark:border-gray-700`}
  ${tw`rounded-lg shadow-sm`}
  ${tw`hover:shadow-md dark:shadow-gray-900/50`}
  ${tw`transition-shadow`}
`;

export const IconWrapper = styled.div`
  ${tw`flex-shrink-0 mt-0.5`}
`;

export const ContentWrapper = styled.div`
  ${tw`flex-1 min-w-0`}
`;

export const ContentRow = styled.div`
  ${tw`flex items-start justify-between gap-2 mb-2`}
`;

export const TodoContent = styled.p`
  ${tw`text-sm font-medium`}
  ${({ completed }) => completed 
    ? tw`line-through text-gray-500 dark:text-gray-400` 
    : tw`text-gray-900 dark:text-gray-100`}
`;

export const BadgeContainer = styled.div`
  ${tw`flex gap-1 flex-shrink-0`}
`;