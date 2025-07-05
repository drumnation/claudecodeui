import styled from '@emotion/styled';
import tw from 'twin.macro';

export const LogsContainer = styled.div`
  ${tw`h-48 border-t border-border dark:border-gray-700 bg-card dark:bg-gray-800 overflow-hidden flex flex-col`}
`;

export const LogsHeader = styled.div`
  ${tw`flex items-center justify-between p-2 border-b border-border dark:border-gray-700`}
`;

export const LogsTitle = styled.span`
  ${tw`text-sm font-medium dark:text-gray-200`}
`;

export const LogsContent = styled.div`
  ${tw`flex-1 overflow-y-auto p-2 font-mono text-xs dark:text-gray-300`}
`;

export const LogEntry = styled.div`
  ${tw`whitespace-pre-wrap`}
  ${({ isError }) => isError && tw`text-red-500 dark:text-red-400`}
`;

export const EmptyLogs = styled.div`
  ${tw`text-muted-foreground dark:text-gray-500`}
`;