import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Container = styled.div`
  ${tw`flex flex-col h-full bg-background dark:bg-gray-900`}
`;

export const Header = styled.div`
  ${tw`flex items-center justify-between p-4 border-b border-border dark:border-gray-700`}
`;

export const HeaderLeft = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const Title = styled.h2`
  ${tw`text-lg font-semibold`}
`;

export const HeaderActions = styled.div`
  ${tw`flex items-center gap-1`}
`;

export const TaskList = styled.div`
  ${tw`flex-1 overflow-y-auto`}
`;

export const TaskItem = styled.div`
  ${tw`p-4 border-b border-border dark:border-gray-700 cursor-pointer transition-colors hover:bg-muted/50 dark:hover:bg-gray-800/50`}
  ${({ selected }) => selected && tw`bg-muted dark:bg-gray-800`}
`;

export const TaskHeader = styled.div`
  ${tw`mb-2`}
`;

export const TaskTitle = styled.h3`
  ${tw`font-medium text-foreground mb-1`}
`;

export const TaskMeta = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const StatusBadge = styled.div`
  ${tw`flex items-center gap-1 text-xs px-2 py-1 rounded-full`}
  ${({ status }) => status === 'completed' 
    ? tw`bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400` 
    : tw`bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400`
  }
`;

export const ModeBadge = styled.div`
  ${tw`text-xs px-2 py-1 rounded-full`}
  ${({ mode }) => mode === 'multi' 
    ? tw`bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400` 
    : tw`bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400`
  }
`;

export const TaskDescription = styled.p`
  ${tw`text-sm text-muted-foreground mb-3 line-clamp-2`}
`;

export const TaskFooter = styled.div`
  ${tw`flex items-center justify-between text-xs text-muted-foreground`}
`;

export const TaskTime = styled.div`
  ${tw`flex items-center gap-1`}
`;

export const AgentList = styled.div`
  ${tw`font-mono text-xs`}
`;

export const LoadingState = styled.div`
  ${tw`flex items-center justify-center h-32 text-muted-foreground`}
`;

export const EmptyState = styled.div`
  ${tw`flex flex-col items-center justify-center h-64 text-center px-4`}
`;

export const EmptyTitle = styled.h3`
  ${tw`font-medium text-foreground mb-1`}
`;

export const EmptyDescription = styled.p`
  ${tw`text-sm text-muted-foreground`}
`;