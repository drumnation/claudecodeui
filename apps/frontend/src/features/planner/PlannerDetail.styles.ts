import styled from '@emotion/styled';
import tw from 'twin.macro';
import {keyframes} from '@emotion/react';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const Overlay = styled.div`
  ${tw`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}
`;

export const Modal = styled.div`
  ${tw`bg-background dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col`}
`;

export const Header = styled.div`
  ${tw`flex items-center justify-between p-6 border-b border-border dark:border-gray-700`}
`;

export const HeaderLeft = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const Title = styled.h2`
  ${tw`text-xl font-semibold`}
`;

export const CloseButton = styled.button`
  ${tw`p-2 rounded-md hover:bg-muted dark:hover:bg-gray-800 transition-colors`}
`;

export const LoadingContainer = styled.div`
  ${tw`flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground`}
`;

export const LoadingSpinner = styled.div`
  ${tw`w-8 h-8 border-2 border-primary border-t-transparent rounded-full`}
  animation: ${spin} 1s linear infinite;
`;

export const ErrorContainer = styled.div`
  ${tw`flex flex-col items-center justify-center h-64 gap-4 p-6`}
`;

export const ErrorMessage = styled.p`
  ${tw`text-destructive text-center`}
`;

export const MetaSection = styled.div`
  ${tw`flex flex-wrap gap-4 p-6 border-b border-border dark:border-gray-700`}
`;

export const MetaItem = styled.div`
  ${tw`flex items-center gap-2 text-sm text-muted-foreground`}
`;

export const DescriptionSection = styled.div`
  ${tw`p-6 border-b border-border dark:border-gray-700`}
`;

export const SectionTitle = styled.h3`
  ${tw`font-medium mb-3`}
`;

export const Description = styled.p`
  ${tw`text-sm text-muted-foreground leading-relaxed`}
`;

export const AgentsSection = styled.div`
  ${tw`p-6 border-b border-border dark:border-gray-700`}
`;

export const AgentsList = styled.div`
  ${tw`space-y-3`}
`;

export const AgentItem = styled.div`
  ${tw`p-3 rounded-lg border`}
  ${({status}: any) =>
    status === 'completed'
      ? tw`border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10`
      : tw`border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10`}
`;

export const AgentHeader = styled.div`
  ${tw`flex items-center justify-between`}
`;

export const AgentInfo = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const AgentName = styled.span`
  ${tw`font-medium text-sm`}
`;

export const AgentDuration = styled.span`
  ${tw`text-xs text-muted-foreground`}
`;

export const AgentError = styled.p`
  ${tw`text-sm text-destructive mt-2`}
`;

export const PlanSection = styled.div`
  ${tw`flex-1 flex flex-col overflow-hidden`}
`;

export const PlanHeader = styled.div`
  ${tw`flex items-center justify-between p-6 pb-3`}
`;

export const PlanActions = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const PlanContent = styled.div`
  ${tw`flex-1 overflow-y-auto px-6 pb-6`}

  pre {
    ${tw`text-sm whitespace-pre-wrap font-mono leading-relaxed`}
  }
`;

export const Actions = styled.div`
  ${tw`flex items-center justify-end gap-3 p-6 border-t border-border dark:border-gray-700`}
`;
