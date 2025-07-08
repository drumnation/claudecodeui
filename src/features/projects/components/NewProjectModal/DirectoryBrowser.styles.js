import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Container = styled.div`
  ${tw`border border-border rounded-md bg-card overflow-hidden`}
  min-height: 300px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  ${tw`flex items-center gap-2 p-2 border-b border-border bg-muted/30`}
`;

export const NavigationButtons = styled.div`
  ${tw`flex items-center gap-1`}
`;

export const PathDisplay = styled.div`
  ${tw`flex-1 min-w-0 px-2`}
`;

export const CreateFolderForm = styled.div`
  ${tw`p-2 border-b border-border bg-muted/20`}
`;

export const CreateFolderActions = styled.div`
  ${tw`flex items-center gap-1 mt-2`}
`;

export const ErrorMessage = styled.div`
  ${tw`p-2 text-xs text-destructive bg-destructive/10 border-b border-border`}
`;

export const DirectoryList = styled.div`
  ${tw`flex-1 overflow-y-auto`}
`;

export const LoadingState = styled.div`
  ${tw`flex items-center justify-center h-32 text-xs text-muted-foreground`}
`;

export const DirectoryItem = styled.div`
  ${tw`flex items-center gap-2 p-2 hover:bg-accent cursor-pointer border-b border-border/50 transition-colors`}
  
  ${props => props.$isHidden && tw`opacity-60`}
  
  &:last-child {
    ${tw`border-b-0`}
  }
`;

export const FileItem = styled.div`
  ${tw`flex items-center gap-2 p-2 border-b border-border/30 bg-muted/20`}
  
  ${props => props.$isHidden && tw`opacity-40`}
  
  &:last-child {
    ${tw`border-b-0`}
  }
`;

export const ItemIcon = styled.div`
  ${tw`flex-shrink-0`}
`;

export const ItemName = styled.div`
  ${tw`flex-1 text-xs truncate`}
`;

export const ItemAction = styled.div`
  ${tw`flex-shrink-0`}
`;

export const FileInfo = styled.div`
  ${tw`p-2 text-xs text-muted-foreground italic bg-muted/10`}
`;

export const Footer = styled.div`
  ${tw`p-2 border-t border-border bg-muted/30`}
`;