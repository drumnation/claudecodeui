import styled from '@emotion/styled';
import tw from 'twin.macro';

export const SessionContainer = styled.div`
  ${tw`relative py-1`}
`;

// Mobile styles
export const MobileWrapper = styled.div`
  ${tw`md:hidden`}
`;

export const MobileSessionItem = styled.div`
  ${tw`p-3 mx-3 my-1 rounded-lg bg-card border active:scale-[0.98] transition-all duration-150 relative space-y-3 cursor-pointer`}
  ${props => props.isSelected && tw`bg-primary/5 border-primary/20`}
  ${props => props.isActive && !props.isSelected && tw`border-green-500/30 bg-green-50/5 dark:bg-green-900/5`}
  ${props => !props.isSelected && !props.isActive && tw`border-border/30`}
  
  /* Ensure button areas don't trigger parent click */
  & button {
    position: relative;
    z-index: 100;
    pointer-events: auto;
  }
`;

// Multi-row layout containers
export const SessionMainContent = styled.div`
  ${tw`flex items-center gap-3`}
`;

export const SessionMetaContent = styled.div`
  ${tw`flex items-center justify-between ml-8`}
`;

export const SessionContent = styled.div`
  ${tw`flex items-center gap-3`}
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

// New layout components
export const SessionTitleArea = styled.div`
  ${tw`min-w-0 flex-1`}
`;

export const SessionTitle = styled.div`
  ${tw`text-sm font-medium text-foreground leading-5`}
`;

export const SessionBadges = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const SessionMeta = styled.div`
  ${tw`flex items-center gap-1.5 mt-1`}
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

// New mobile button styles
export const MenuButton = styled.button`
  ${tw`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-all bg-muted/50 hover:bg-muted text-muted-foreground flex-shrink-0`}
  position: relative;
  z-index: 100;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  pointer-events: auto;
  
  &:focus {
    outline: 2px solid rgba(59, 130, 246, 0.5);
    outline-offset: 2px;
  }
  
  &:active {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export const EditActions = styled.div`
  ${tw`flex items-center gap-2 flex-shrink-0`}
  position: relative;
  z-index: 100;
  pointer-events: auto;
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

export const SaveButton = styled.button`
  ${tw`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-all bg-green-50 dark:bg-green-900/20 text-green-600 relative z-10 flex-shrink-0`}
  
  &:focus {
    outline: 2px solid rgba(34, 197, 94, 0.5);
    outline-offset: 2px;
  }
`;

export const CancelButton = styled.button`
  ${tw`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-all bg-gray-50 dark:bg-gray-900/20 text-gray-600 relative z-10 flex-shrink-0`}
  
  &:focus {
    outline: 2px solid rgba(107, 114, 128, 0.5);
    outline-offset: 2px;
  }
`;

export const EditInput = styled.input`
  ${tw`w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
`;

export const LoadingSpinner = styled.div`
  ${tw`w-4 h-4 animate-spin rounded-full border-2 border-blue-600 dark:border-blue-400 border-t-transparent`}
`;

// Desktop styles
export const DesktopWrapper = styled.div`
  ${tw`hidden md:block`}
`;

export const DesktopHoverActions = styled.div`
  ${tw`absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5 opacity-0 transition-all duration-200`}
  
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

export const DesktopEditContainer = styled.div`
  ${tw`absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5`}
`;

// Desktop 3-dot menu styles
export const DesktopMenuWrapper = styled.div`
  ${tw`relative`}
`;

export const DesktopMenuButton = styled.button`
  ${tw`w-7 h-7 rounded-md flex items-center justify-center hover:bg-accent transition-colors`}
`;

export const DesktopMenuDropdown = styled.div`
  ${tw`absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-lg shadow-lg py-1`}
  z-index: 9999;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

export const DesktopMenuItem = styled.button`
  ${tw`w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors`}
  ${props => props.variant === 'destructive' && tw`text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
  ${props => props.disabled && tw`opacity-50 cursor-not-allowed`}
  
  span {
    ${tw`text-sm`}
  }
`;

export const DesktopMenuDivider = styled.div`
  ${tw`h-px bg-border my-1 mx-2`}
`;

// Mobile Action Modal Styles
export const MobileActionOverlay = styled.div`
  ${tw`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm`}
  z-index: 9999;
  touch-action: none;
`;

export const MobileActionModal = styled.div`
  ${tw`absolute left-0 right-0 bg-card rounded-t-xl border-t border-border`}
  bottom: calc(env(safe-area-inset-bottom, 0px) + 48px);
  animation: slide-up 0.3s ease-out;
  
  @keyframes slide-up {
    from {
      transform: translateY(calc(100% + env(safe-area-inset-bottom, 0px) + 48px));
    }
    to {
      transform: translateY(0);
    }
  }
`;

export const MobileActionHeader = styled.div`
  ${tw`flex items-center justify-between p-4 border-b border-border`}
`;

export const MobileActionTitle = styled.h3`
  ${tw`text-base font-semibold text-foreground`}
`;

export const MobileActionCloseButton = styled.button`
  ${tw`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-all hover:bg-accent text-muted-foreground`}
`;

export const MobileActionList = styled.div`
  ${tw`p-2 space-y-1`}
`;

export const MobileActionButton = styled.button`
  ${tw`w-full flex items-center gap-3 p-4 rounded-lg text-left active:scale-[0.98] transition-all font-medium`}
  ${tw`hover:bg-accent text-foreground`}
  ${props => props.variant === 'destructive' && tw`text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
  ${props => props.disabled && tw`opacity-50 pointer-events-none`}
  
  span {
    ${tw`text-sm`}
  }
`;