import styled from '@emotion/styled';
import tw from 'twin.macro';

export const SessionContainer = styled.div`
  ${tw`relative`}
`;

// Mobile styles
export const MobileWrapper = styled.div`
  ${tw`md:hidden`}
`;

export const MobileSessionItem = styled.div`
  ${tw`p-2 mx-3 my-0.5 rounded-md bg-card border active:scale-[0.98] transition-all duration-150 relative`}
  ${props => props.isSelected && tw`bg-primary/5 border-primary/20`}
  ${props => props.isActive && !props.isSelected && tw`border-green-500/30 bg-green-50/5 dark:bg-green-900/5`}
  ${props => !props.isSelected && !props.isActive && tw`border-border/30`}
`;

export const SessionContent = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const SessionIcon = styled.div`
  ${tw`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0`}
  ${props => props.isSelected && tw`bg-primary/10`}
  ${props => props.isActive && !props.isSelected && tw`bg-green-500/20`}
  ${props => !props.isSelected && !props.isActive && tw`bg-muted/50`}
`;

export const SessionInfo = styled.div`
  ${tw`min-w-0 flex-1`}
`;

export const SessionTitle = styled.div`
  ${tw`text-xs font-medium truncate text-foreground`}
`;

export const SessionMeta = styled.div`
  ${tw`flex items-center gap-1 mt-0.5`}
`;

export const TimeIcon = styled.div`
  ${tw`w-2.5 h-2.5`}
  ${props => props.isActive && tw`text-green-600 dark:text-green-500`}
  ${props => !props.isActive && tw`text-muted-foreground`}
`;

export const TimeText = styled.span`
  ${tw`text-xs`}
  ${props => props.isActive && tw`text-green-600 dark:text-green-500 font-medium`}
  ${props => !props.isActive && tw`text-muted-foreground`}
`;

export const SessionActions = styled.div`
  ${tw`flex items-center ml-auto`}
`;

export const ActiveIndicator = styled.div`
  ${tw`w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1`}
`;

export const MobileActions = styled.div`
  ${tw`flex items-center gap-1 ml-1`}
`;

export const ActionButton = styled.button`
  ${tw`w-5 h-5 rounded-md flex items-center justify-center active:scale-95 transition-transform opacity-70`}
`;

export const GenerateButton = styled(ActionButton)`
  ${tw`bg-blue-50 dark:bg-blue-900/20`}
`;

export const EditButton = styled(ActionButton)`
  ${tw`bg-gray-50 dark:bg-gray-900/20`}
`;

export const DeleteButton = styled(ActionButton)`
  ${tw`bg-red-50 dark:bg-red-900/20`}
`;

export const SaveButton = styled(ActionButton)`
  ${tw`bg-green-50 dark:bg-green-900/20`}
`;

export const CancelButton = styled(ActionButton)`
  ${tw`bg-gray-50 dark:bg-gray-900/20`}
`;

export const EditInput = styled.input`
  ${tw`w-24 px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary`}
`;

export const LoadingSpinner = styled.div`
  ${tw`w-2.5 h-2.5 animate-spin rounded-full border border-blue-600 dark:border-blue-400 border-t-transparent`}
`;

// Desktop styles
export const DesktopWrapper = styled.div`
  ${tw`hidden md:block`}
`;

export const DesktopHoverActions = styled.div`
  ${tw`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 transition-all duration-200`}
  
  @media (hover: hover) {
    .group:hover & {
      opacity: 1;
    }
  }
`;

export const DesktopActionButton = styled.button`
  ${tw`w-6 h-6 rounded flex items-center justify-center`}
`;

export const DesktopGenerateButton = styled(DesktopActionButton)`
  ${tw`bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40`}
`;

export const DesktopEditButton = styled(DesktopActionButton)`
  ${tw`bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/40`}
`;

export const DesktopDeleteButton = styled(DesktopActionButton)`
  ${tw`bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40`}
`;

export const DesktopSaveButton = styled(DesktopActionButton)`
  ${tw`bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40`}
`;

export const DesktopCancelButton = styled(DesktopActionButton)`
  ${tw`bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/40`}
`;

export const DesktopEditInput = styled.input`
  ${tw`w-32 px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary`}
`;