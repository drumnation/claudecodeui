import styled from '@emotion/styled';
import tw from 'twin.macro';

export const PreviewContainer = styled.div`
  ${tw`flex-1 relative bg-white dark:bg-gray-900`}
`;

export const StyledIframe = styled.iframe`
  ${tw`w-full h-full border-0 bg-white`}
`;

export const LoadingOverlay = styled.div`
  ${tw`absolute inset-0 flex items-center justify-center bg-background/50 dark:bg-gray-900/50 z-20`}
`;

export const ErrorOverlay = styled.div`
  ${tw`absolute inset-0 flex items-center justify-center bg-background/80 dark:bg-gray-900/80 z-10`}
`;

export const ErrorContent = styled.div`
  ${tw`text-center p-4`}
`;

export const ErrorIcon = styled.div`
  ${tw`h-12 w-12 text-destructive mx-auto mb-2`}
`;

export const ErrorText = styled.p`
  ${tw`text-sm text-muted-foreground`}
`;

export const EmptyStateContainer = styled.div`
  ${tw`flex items-center justify-center h-full text-center p-8 dark:text-gray-200`}
`;

export const EmptyStateContent = styled.div``;

export const EmptyStateIcon = styled.div`
  ${tw`h-16 w-16 text-muted-foreground/30 dark:text-gray-600 mx-auto mb-4`}
`;

export const EmptyStateTitle = styled.h3`
  ${tw`text-lg font-semibold mb-2 dark:text-white`}
`;

export const EmptyStateDescription = styled.p`
  ${tw`text-sm text-muted-foreground dark:text-gray-400 mb-4`}
`;

export const LoadingIndicator = styled.div`
  ${tw`flex items-center justify-center gap-2 text-sm text-muted-foreground`}
`;

export const ErrorMessage = styled.div`
  ${tw`text-sm text-destructive`}
`;