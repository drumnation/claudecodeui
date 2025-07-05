import styled from '@emotion/styled';
import tw from 'twin.macro';

export const CommitSection = styled.div`
  ${tw`px-4 py-3 border-b border-gray-200 dark:border-gray-700`}
`;

export const CommitTextareaContainer = styled.div`
  ${tw`relative`}
`;

export const CommitTextarea = styled.textarea`
  ${tw`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 resize-none pr-20`}
  &:focus {
    ${tw`outline-none ring-2 ring-blue-500`}
  }
`;

export const CommitButtonGroup = styled.div`
  ${tw`absolute right-2 top-2 flex gap-1`}
`;

export const CommitActionsContainer = styled.div`
  ${tw`flex items-center justify-between mt-2`}
`;

export const FileCountText = styled.span`
  ${tw`text-xs text-gray-500`}
`;

export const CommitButton = styled.button`
  ${tw`px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1`}
  ${props => props.disabled && tw`opacity-50 cursor-not-allowed`}
`;

export const IconButton = styled.button`
  ${tw`p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`}
  ${props => props.disabled && tw`opacity-50 cursor-not-allowed`}
`;