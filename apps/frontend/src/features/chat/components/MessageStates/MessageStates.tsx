import React from 'react';
import {
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  EmptyStateContainer,
  EmptyStateContent,
  EmptyStateTitle,
  EmptyStateDescription,
} from '@/features/chat/components/MessageStates/MessageStates.styles';
import {MessageStatesProps} from '@/features/chat/components/MessageStates/MessageStates.types';

export const MessageStates = ({
  isLoadingSessionMessages,
  chatMessages,
}: MessageStatesProps) => {
  if (isLoadingSessionMessages && chatMessages.length === 0) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading session messages...</LoadingText>
      </LoadingContainer>
    );
  }

  if (chatMessages.length === 0) {
    return (
      <EmptyStateContainer>
        <EmptyStateContent>
          <EmptyStateTitle>Start a conversation with Claude</EmptyStateTitle>
          <EmptyStateDescription>
            Ask questions about your code, request changes, or get help with
            development tasks
          </EmptyStateDescription>
        </EmptyStateContent>
      </EmptyStateContainer>
    );
  }

  return null;
};
