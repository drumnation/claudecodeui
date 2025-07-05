import styled from '@emotion/styled';
import tw from 'twin.macro';

// Root container
export const AppContainer = styled.div`
  ${tw`fixed inset-0 flex bg-background`}
`;

// Desktop sidebar wrapper
export const DesktopSidebar = styled.div`
  ${tw`w-80 flex-shrink-0 border-r border-border bg-card`}
`;

export const SidebarContent = styled.div`
  ${tw`h-full overflow-hidden`}
`;

// Mobile sidebar overlay
export const MobileSidebarOverlay = styled.div`
  ${tw`fixed inset-0 z-50 flex transition-all duration-150 ease-out`}
  ${({ $isOpen }) => $isOpen 
    ? tw`opacity-100 visible` 
    : tw`opacity-0 invisible`}
`;

export const MobileSidebarBackdrop = styled.div`
  ${tw`fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-150 ease-out`}
`;

export const MobileSidebarContent = styled.div`
  ${tw`relative w-[85vw] max-w-sm sm:w-80 bg-card border-r border-border h-full transform transition-transform duration-150 ease-out`}
  ${({ $isOpen }) => $isOpen 
    ? tw`translate-x-0` 
    : tw`-translate-x-full`}
`;

// Main content area
export const MainContentArea = styled.div`
  ${tw`flex-1 flex flex-col min-w-0`}
`;