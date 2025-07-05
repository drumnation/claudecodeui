import styled from '@emotion/styled';
import tw from 'twin.macro';

export const ProjectContainer = styled.div`
  ${tw`md:space-y-1`}
`;

export const ProjectHeader = styled.div`
  ${tw``}
`;

// Mobile styles
export const MobileProjectWrapper = styled.div`
  ${tw`md:hidden`}
`;

export const MobileProjectItem = styled.div`
  ${tw`p-3 mx-3 my-1 rounded-lg bg-card border border-border/50 active:scale-[0.98] transition-all duration-150`}
  ${props => props.isSelected && tw`bg-primary/5 border-primary/20`}
`;

export const MobileProjectContent = styled.div`
  ${tw`flex items-center justify-between`}
`;

export const ProjectInfo = styled.div`
  ${tw`flex items-center gap-3 min-w-0 flex-1`}
`;

export const ProjectIconWrapper = styled.div`
  ${tw`w-8 h-8 rounded-lg flex items-center justify-center transition-colors`}
  ${props => props.isExpanded ? tw`bg-primary/10` : props.hasActiveSession ? tw`bg-green-500/10` : tw`bg-muted`}
`;

export const ProjectDetails = styled.div`
  ${tw`min-w-0 flex-1`}
`;

export const ProjectName = styled.h3`
  ${tw`text-sm font-medium text-foreground truncate`}
`;

export const ProjectMeta = styled.p`
  ${tw`text-xs text-muted-foreground`}
`;

export const ProjectActions = styled.div`
  ${tw`flex items-center gap-1`}
`;

export const ActionButton = styled.button`
  ${tw`w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-all duration-150 shadow-sm active:shadow-none`}
`;

export const SaveButton = styled(ActionButton)`
  ${tw`bg-green-500 dark:bg-green-600`}
`;

export const CancelButton = styled(ActionButton)`
  ${tw`bg-gray-500 dark:bg-gray-600`}
`;

export const DeleteButton = styled(ActionButton)`
  ${tw`bg-red-500/10 dark:bg-red-900/30 border border-red-200 dark:border-red-800`}
`;

export const EditButton = styled(ActionButton)`
  ${tw`bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30`}
`;

export const ChevronWrapper = styled.div`
  ${tw`w-6 h-6 rounded-md bg-muted/30 flex items-center justify-center`}
`;

export const EditInput = styled.input`
  ${tw`w-full px-3 py-2 text-sm border-2 border-primary/40 focus:border-primary rounded-lg bg-background text-foreground shadow-sm focus:shadow-md transition-all duration-200 focus:outline-none`}
`;

// Desktop hover actions
export const DesktopHoverActions = styled.div`
  ${tw`w-6 h-6 opacity-0 transition-all duration-200 hover:bg-accent flex items-center justify-center rounded cursor-pointer`}
  
  @media (hover: hover) {
    .group:hover & {
      opacity: 1;
    }
  }
  
  @media (hover: none) {
    opacity: 1;
  }
`;

export const DesktopDeleteAction = styled(DesktopHoverActions)`
  ${tw`hover:bg-red-50 dark:hover:bg-red-900/20`}
`;

// Sessions container
export const SessionsContainer = styled.div`
  ${tw`ml-3 space-y-1 border-l border-border pl-3`}
`;

export const SessionsLoading = styled.div`
  ${tw`p-2 rounded-md`}
`;

export const SessionSkeleton = styled.div`
  ${tw`flex items-start gap-2`}
`;

export const SkeletonDot = styled.div`
  ${tw`w-3 h-3 bg-muted rounded-full animate-pulse mt-0.5`}
`;

export const SkeletonContent = styled.div`
  ${tw`flex-1 space-y-1`}
`;

export const SkeletonBar = styled.div`
  ${tw`h-3 bg-muted rounded animate-pulse`}
`;

export const SkeletonBarSmall = styled.div`
  ${tw`h-2 bg-muted rounded animate-pulse w-1/2`}
`;

export const NoSessionsText = styled.div`
  ${tw`py-2 px-3 text-left`}
`;

export const NoSessionsLabel = styled.p`
  ${tw`text-xs text-muted-foreground`}
`;

export const NewSessionButtonMobile = styled.div`
  ${tw`md:hidden px-3 pb-2`}
`;

export const NewSessionButton = styled.button`
  ${tw`w-full h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md flex items-center justify-center gap-2 font-medium text-xs active:scale-[0.98] transition-all duration-150`}
`;