import styled from '@emotion/styled';
import tw from 'twin.macro';

export const CopyButtonWrapper = styled.div`
  ${tw`relative inline-flex items-center justify-center`}
`;

export const CopyButton = styled.button`
  ${tw`
    relative inline-flex items-center justify-center
    rounded-md border border-transparent
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
    select-none
  `}

  /* Size variants */
  ${(props: any) => props.size === 'xs' && tw`w-5 h-5 p-0.5`}
  ${(props: any) => props.size === 'sm' && tw`w-6 h-6 p-1`}
  ${(props: any) => props.size === 'md' && tw`w-8 h-8 p-1.5`}
  ${(props: any) => props.size === 'lg' && tw`w-10 h-10 p-2`}
  
  /* Default size */
  ${(props: any) => !props.size && tw`w-6 h-6 p-1`}
  
  /* Color variants */
  ${(props: any) =>
    props.variant === 'default' &&
    tw`
    text-muted-foreground hover:text-foreground
    hover:bg-accent/80 dark:hover:bg-accent/60
  `}
  
  ${(props: any) =>
    props.variant === 'success' &&
    tw`
    text-green-600 dark:text-green-500
    bg-green-50 dark:bg-green-900/20
    border-green-200 dark:border-green-800
  `}
  
  ${(props: any) =>
    props.variant === 'error' &&
    tw`
    text-red-600 dark:text-red-500
    bg-red-50 dark:bg-red-900/20
    border-red-200 dark:border-red-800
  `}
  
  /* Default variant */
  ${(props: any) =>
    !props.variant &&
    tw`
    text-muted-foreground hover:text-foreground
    hover:bg-accent/80 dark:hover:bg-accent/60
  `}
  
  /* Mobile touch targets - ensure minimum 44px for accessibility */
  @media (max-width: 768px) {
    ${tw`min-w-[44px] min-h-[44px]`}
    ${(props: any) => props.size === 'xs' && tw`min-w-[36px] min-h-[36px]`}
  }

  /* Focus states */
  &:focus-visible {
    ${tw`ring-2 ring-primary/50 ring-offset-2 dark:ring-offset-gray-900`}
  }

  /* Active states */
  &:active {
    ${tw`scale-95`}
  }

  /* Loading state */
  ${(props: any) => props.isLoading && tw`cursor-wait`}
`;

export const CopyIcon = styled.div`
  ${tw`
    flex items-center justify-center
    transition-all duration-200 ease-in-out
  `}

  /* Icon size based on button size */
  ${(props: any) => props.size === 'xs' && tw`w-3 h-3`}
  ${(props: any) => props.size === 'sm' && tw`w-3.5 h-3.5`}
  ${(props: any) => props.size === 'md' && tw`w-4 h-4`}
  ${(props: any) => props.size === 'lg' && tw`w-5 h-5`}
  
  /* Default size */
  ${(props: any) => !props.size && tw`w-3.5 h-3.5`}
  
  /* Animation for state changes */
  ${(props: any) => props.isChanging && tw`animate-pulse`}
  
  /* Success animation */
  ${(props: any) =>
    props.isSuccess &&
    `
    animation: successPulse 0.3s ease-in-out;
    @keyframes successPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `}
`;

export const CopyButtonContainer = styled.div`
  ${tw`
    flex items-center gap-1
    opacity-60 hover:opacity-100
    transition-opacity duration-200
  `}

  /* Always visible on mobile */
  @media (max-width: 768px) {
    ${tw`opacity-100`}
  }

  /* Show on group hover for desktop */
  @media (min-width: 769px) {
    .group:hover & {
      ${tw`opacity-100`}
    }
  }
`;

export const VisuallyHidden = styled.span`
  ${tw`
    absolute w-px h-px p-0 -m-px
    overflow-hidden whitespace-nowrap
    border-0
  `}
  clip: rect(0, 0, 0, 0);
`;
