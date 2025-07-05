import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Container = styled.div`
  ${tw`h-full flex flex-col bg-card`}
`;

export const LoadingContainer = styled.div`
  ${tw`h-full flex items-center justify-center`}
`;

export const LoadingStateContainer = styled.div`
  ${tw`text-center py-8`}
`;

export const LoadingStateIcon = styled.div`
  ${tw`w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3`}
`;

export const LoadingIcon = styled.div`
  ${tw`w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin`}
`;

export const LoadingStateTitle = styled.h4`
  ${tw`font-medium text-foreground mb-1`}
`;

export const LoadingStateDescription = styled.p`
  ${tw`text-sm text-muted-foreground`}
`;

export const ScrollContainer = styled.div`
  ${tw`flex-1 p-4`}
`;

export const EmptyStateContainer = styled.div`
  ${tw`text-center py-8`}
`;

export const EmptyStateIcon = styled.div`
  ${tw`w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3`}
`;

export const EmptyFolderIcon = styled.div`
  ${tw`w-6 h-6 text-gray-400 dark:text-gray-500`}
`;

export const EmptyStateTitle = styled.h4`
  ${tw`font-medium text-foreground mb-1`}
`;

export const EmptyStateDescription = styled.p`
  ${tw`text-sm text-muted-foreground`}
`;

export const ErrorStateContainer = styled.div`
  ${tw`text-center py-8`}
`;

export const ErrorStateIcon = styled.div`
  ${tw`w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-3`}
`;

export const ErrorIcon = styled.div`
  ${tw`w-6 h-6 text-red-600 dark:text-red-400`}
`;

export const ErrorStateTitle = styled.h4`
  ${tw`font-medium text-foreground mb-1`}
`;

export const ErrorStateMessage = styled.p`
  ${tw`text-sm text-red-600 dark:text-red-400`}
`;

export const FileTreeContainer = styled.div`
  ${tw`space-y-1`}
`;

export const FileTreeItem = styled.div`
  ${tw`select-none`}
`;

export const FileButton = styled.button`
  ${tw`w-full justify-start p-2 h-auto font-normal text-left hover:bg-accent`}
  ${tw`bg-transparent border-none cursor-pointer`}
  ${tw`transition-colors duration-200`}
`;

export const FileButtonContent = styled.div`
  ${tw`flex items-center gap-2 min-w-0 w-full`}
`;

export const FileName = styled.span`
  ${tw`text-sm truncate text-foreground`}
`;

// Icon components with proper styling
export const FolderIconOpen = styled.div`
  ${tw`w-4 h-4 text-blue-500 flex-shrink-0`}
`;

export const FolderIconClosed = styled.div`
  ${tw`w-4 h-4 text-muted-foreground flex-shrink-0`}
`;

export const CodeFileIcon = styled.div`
  ${tw`w-4 h-4 text-green-500 flex-shrink-0`}
`;

export const DocumentFileIcon = styled.div`
  ${tw`w-4 h-4 text-blue-500 flex-shrink-0`}
`;

export const ImageFileIcon = styled.div`
  ${tw`w-4 h-4 text-purple-500 flex-shrink-0`}
`;

export const DefaultFileIcon = styled.div`
  ${tw`w-4 h-4 text-muted-foreground flex-shrink-0`}
`;