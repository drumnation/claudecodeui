import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Overlay = styled.div`
  ${tw`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm`}
  ${tw`flex items-center justify-center p-4`}
`;

export const Modal = styled.div`
  ${tw`bg-card border border-border rounded-lg shadow-lg`}
  ${tw`w-full max-w-md mx-auto`}
  animation: modal-appear 0.15s ease-out;
  
  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

export const Header = styled.div`
  ${tw`flex items-center gap-3 p-4 border-b border-border`}
`;

export const IconWrapper = styled.div`
  ${tw`flex-shrink-0`}
`;

export const Title = styled.h3`
  ${tw`flex-1 text-base font-semibold text-foreground`}
`;

export const CloseButton = styled.button`
  ${tw`flex-shrink-0 p-1 rounded-md hover:bg-accent transition-colors`}
  ${tw`disabled:opacity-50 disabled:cursor-not-allowed`}
`;

export const Content = styled.div`
  ${tw`p-4`}
`;

export const Message = styled.p`
  ${tw`text-sm text-muted-foreground leading-relaxed`}
`;

export const Actions = styled.div`
  ${tw`flex gap-2 p-4 border-t border-border`}
`;