import React from 'react';
import {
  Container,
  Content,
  Message,
} from '@/features/chat/components/NoProjectSelected/NoProjectSelected.styles';

export const NoProjectSelected = () => {
  return (
    <Container data-testid="no-project-selected">
      <Content>
        <Message>No project selected</Message>
        <Message>Select a project to start chatting with Claude</Message>
      </Content>
    </Container>
  );
};
