import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Container = styled.div`
  ${tw`flex flex-col h-full bg-card md:select-none`}
`;

export const Header = styled.div`
  ${tw`md:p-4 md:border-b md:border-border`}
`;

export const DesktopHeader = styled.div`
  ${tw`hidden md:flex items-center justify-between`}
`;

export const MobileHeader = styled.div`
  ${tw`md:hidden p-3 border-b border-border`}
`;

export const LogoSection = styled.div`
  ${tw`flex items-center gap-3`}
`;

export const LogoWrapper = styled.div`
  ${tw`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm`}
`;

export const TitleWrapper = styled.div`
  ${tw`flex flex-col`}
`;

export const Title = styled.h1`
  ${tw`text-lg font-bold text-foreground`}
`;

export const MobileTitle = styled.h1`
  ${tw`text-lg font-semibold text-foreground`}
`;

export const MobileSubtitle = styled.p`
  ${tw`text-sm text-muted-foreground`}
`;

export const ActionButtons = styled.div`
  ${tw`flex gap-2`}
`;

export const RefreshButton = styled.button`
  ${tw`w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center active:scale-95 transition-all duration-150`}
`;

export const NewProjectButton = styled.button`
  ${tw`w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-all duration-150`}
`;

export const ProjectsSection = styled.div`
  ${tw`flex-1 overflow-y-auto overscroll-contain`}
`;

export const ProjectsList = styled.div`
  ${tw`md:space-y-1 pb-safe-area-inset-bottom`}
`;

export const LoadingState = styled.div`
  ${tw`text-center py-12 md:py-8 px-4`}
`;

export const LoadingIcon = styled.div`
  ${tw`w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4 md:mb-3`}
`;

export const Spinner = styled.div`
  ${tw`w-6 h-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent`}
`;

export const LoadingTitle = styled.h3`
  ${tw`text-base font-medium text-foreground mb-2 md:mb-1`}
`;

export const LoadingText = styled.p`
  ${tw`text-sm text-muted-foreground`}
`;

export const EmptyState = styled.div`
  ${tw`text-center py-12 md:py-8 px-4`}
`;

export const EmptyIcon = styled.div`
  ${tw`w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4 md:mb-3`}
`;

export const EmptyTitle = styled.h3`
  ${tw`text-base font-medium text-foreground mb-2 md:mb-1`}
`;

export const EmptyText = styled.p`
  ${tw`text-sm text-muted-foreground`}
`;

export const SettingsSection = styled.div`
  ${tw`md:p-2 md:border-t md:border-border flex-shrink-0`}
`;

export const MobileSettings = styled.div`
  ${tw`md:hidden p-4 pb-20 border-t border-border/50`}
`;

export const MobileSettingsButton = styled.button`
  ${tw`w-full h-14 bg-muted/50 hover:bg-muted/70 rounded-2xl flex items-center justify-start gap-4 px-4 active:scale-[0.98] transition-all duration-150`}
`;

export const MobileSettingsIcon = styled.div`
  ${tw`w-10 h-10 rounded-2xl bg-background/80 flex items-center justify-center`}
`;

export const MobileSettingsText = styled.span`
  ${tw`text-lg font-medium text-foreground`}
`;