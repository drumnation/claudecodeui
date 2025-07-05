import styled from '@emotion/styled';
import tw from 'twin.macro';

export const FileListContainer = styled.div`
  ${tw`flex-1 overflow-y-auto`}
  ${props => props.isMobile && tw`pb-20`}
`;

export const EmptyStateContainer = styled.div`
  ${tw`flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400`}
`;

export const EmptyStateIcon = styled.div`
  ${tw`mb-2 opacity-50`}
`;

export const EmptyStateText = styled.p`
  ${tw`text-sm`}
`;

export const LoadingContainer = styled.div`
  ${tw`flex items-center justify-center h-32`}
`;

export const FileListContent = styled.div`
  ${props => props.isMobile && tw`pb-4`}
`;