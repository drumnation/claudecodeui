import styled from '@emotion/styled';
import tw from 'twin.macro';

export const ErrorContainer = styled.div`
  ${tw`min-h-screen flex items-center justify-center px-4 py-8 bg-background`}

  /* For component-level errors, adjust height */
  ${(props: any) => props.level === 'component' && tw`min-h-[400px]`}
`;

export const ErrorContent = styled.div`
  ${tw`max-w-md w-full text-center space-y-6`}
`;

export const ErrorIcon = styled.div`
  ${tw`flex justify-center mb-6`}

  svg {
    ${tw`drop-shadow-lg`}
    filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3));
  }
`;

export const ErrorHeader = styled.div`
  ${tw`space-y-3`}
`;

export const ErrorTitle = styled.h1`
  ${tw`text-2xl font-bold text-foreground`}
`;

export const ErrorSubtitle = styled.p`
  ${tw`text-muted-foreground text-base leading-relaxed`}
`;

export const ErrorId = styled.div`
  ${tw`inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-mono border border-border`}
`;

export const ErrorActions = styled.div`
  ${tw`flex flex-col sm:flex-row gap-3 justify-center items-center`}
`;

export const BaseButton = styled.button`
  ${tw`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2`}
  min-width: 120px;
`;

export const PrimaryButton = styled(BaseButton)`
  ${tw`bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 shadow-md hover:shadow-lg`}
`;

export const SecondaryButton = styled(BaseButton)`
  ${tw`bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary/50 border border-border`}
`;

export const ErrorDetails = styled.div`
  ${tw`mt-8 p-4 bg-muted/50 rounded-lg border border-border text-left`}
`;

export const ErrorDetailsTitle = styled.h3`
  ${tw`font-semibold text-foreground mb-3 flex items-center gap-2`}
`;

export const ErrorDetailsContent = styled.div`
  ${tw`text-sm text-muted-foreground space-y-2 font-mono`}
`;

export const ErrorStack = styled.pre`
  ${tw`text-xs bg-background p-3 rounded border border-border overflow-x-auto mt-2 text-foreground`}
  max-height: 200px;
  white-space: pre-wrap;
`;

export const ErrorFooter = styled.p`
  ${tw`text-xs text-muted-foreground mt-6 leading-relaxed`}
`;

// Minimal error boundary for smaller components
export const MinimalErrorContainer = styled.div`
  ${tw`flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border text-center space-y-4`}
  min-height: 200px;
`;

export const MinimalErrorIcon = styled.div`
  ${tw`text-muted-foreground`}
`;

export const MinimalErrorText = styled.p`
  ${tw`text-sm text-muted-foreground`}
`;

export const MinimalErrorButton = styled.button`
  ${tw`inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors active:scale-95`}
`;
