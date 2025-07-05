import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Container = styled.div`
  ${tw`md:p-3 md:border-b md:border-border md:bg-muted/30`}
`;

// Desktop styles
export const DesktopForm = styled.div`
  ${tw`hidden md:block space-y-2`}
`;

export const FormHeader = styled.div`
  ${tw`flex items-center gap-2 text-sm font-medium text-foreground`}
`;

export const FormActions = styled.div`
  ${tw`flex gap-2`}
`;

export const CreateButton = styled.button`
  ${tw`flex-1 h-8 text-xs hover:bg-primary/90 transition-colors`}
`;

export const CancelButton = styled.button`
  ${tw`h-8 text-xs hover:bg-accent transition-colors`}
`;

// Mobile styles
export const MobileOverlay = styled.div`
  ${tw`md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm`}
`;

export const MobileModal = styled.div`
  ${tw`absolute bottom-0 left-0 right-0 bg-card rounded-t-lg border-t border-border p-4 space-y-4`}
  animation: slide-up 0.3s ease-out;
  
  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

export const MobileHeader = styled.div`
  ${tw`flex items-center justify-between`}
`;

export const MobileHeaderContent = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const MobileIconWrapper = styled.div`
  ${tw`w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center`}
`;

export const MobileTitle = styled.h2`
  ${tw`text-base font-semibold text-foreground`}
`;

export const MobileCloseButton = styled.button`
  ${tw`w-6 h-6 rounded-md bg-muted flex items-center justify-center active:scale-95 transition-transform`}
`;

export const MobileFormContent = styled.div`
  ${tw`space-y-3`}
`;

export const MobileActions = styled.div`
  ${tw`flex gap-2`}
`;

export const MobileCancelButton = styled.button`
  ${tw`flex-1 h-9 text-sm rounded-md active:scale-95 transition-transform`}
`;

export const MobileCreateButton = styled.button`
  ${tw`flex-1 h-9 text-sm rounded-md bg-primary hover:bg-primary/90 active:scale-95 transition-all`}
`;

export const SafeArea = styled.div`
  ${tw`h-4`}
`;