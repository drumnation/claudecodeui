import styled from '@emotion/styled';
import tw from 'twin.macro';

export const CommitItemContainer = styled.div`
  ${tw`border-b border-gray-200 dark:border-gray-700 last:border-0`}
`;

export const CommitHeader = styled.div`
  ${tw`flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer`}
`;

export const ExpandButton = styled.div`
  ${tw`mr-2 mt-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded`}
`;

export const CommitContent = styled.div`
  ${tw`flex-1 min-w-0`}
`;

export const CommitInfo = styled.div`
  ${tw`flex items-start justify-between gap-2`}
`;

export const CommitMessage = styled.p`
  ${tw`text-sm font-medium text-gray-900 dark:text-white truncate flex-1 min-w-0`}
`;

export const CommitMeta = styled.p`
  ${tw`text-xs text-gray-500 dark:text-gray-400 mt-1`}
`;

export const CommitHash = styled.span`
  ${tw`text-xs font-mono text-gray-400 dark:text-gray-500 flex-shrink-0`}
`;

export const CommitDiffContainer = styled.div`
  ${tw`bg-gray-50 dark:bg-gray-900 max-h-96 overflow-y-auto p-2`}
`;

export const DiffStats = styled.div`
  ${tw`text-xs font-mono text-gray-600 dark:text-gray-400 mb-2`}
`;

export const DiffLine = styled.div`
  ${tw`font-mono text-xs whitespace-pre overflow-x-auto`}
  ${props => {
    if (props.isAddition) return tw`bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300`;
    if (props.isDeletion) return tw`bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300`;
    if (props.isHeader) return tw`bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300`;
    return tw`text-gray-600 dark:text-gray-400`;
  }}
`;