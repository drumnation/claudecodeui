import styled from '@emotion/styled';
import tw from 'twin.macro';

export const ActionsContainer = styled.div`
  ${tw`flex items-center gap-1 md:gap-2`}
`;

export const IconButton = styled.button`
  ${tw`p-2 md:p-2 rounded-md`}
  ${tw`text-gray-600 dark:text-gray-400`}
  ${tw`hover:text-gray-900 dark:hover:text-white`}
  ${tw`hover:bg-gray-100 dark:hover:bg-gray-800`}
  ${tw`min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0`}
  ${tw`flex items-center justify-center`}
`;

export const SaveButton = styled.button`
  ${tw`px-3 py-2 text-white rounded-md`}
  ${tw`disabled:opacity-50 flex items-center gap-2`}
  ${tw`transition-colors min-h-[44px] md:min-h-0`}
  
  background-color: ${({ success }) => success ? '#16a34a' : '#2563eb'};
  
  &:hover {
    background-color: ${({ success }) => success ? '#15803d' : '#1d4ed8'};
  }
`;

export const CheckIcon = styled.svg`
  ${tw`w-5 h-5 md:w-4 md:h-4`}
`;

export const ButtonText = styled.span`
  ${tw`hidden sm:inline`}
`;

export const FullscreenButton = styled.button`
  ${tw`hidden md:flex p-2`}
  ${tw`text-gray-600 dark:text-gray-400`}
  ${tw`hover:text-gray-900 dark:hover:text-white`}
  ${tw`rounded-md hover:bg-gray-100 dark:hover:bg-gray-800`}
  ${tw`items-center justify-center`}
`;