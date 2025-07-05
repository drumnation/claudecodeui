import React from 'react';
import { Container, Content, Message } from '@/features/chat/components/NoProjectSelected/NoProjectSelected/NoProjectSelected.styles';

const NoProjectSelected = () => {
  return (
    <Container>
      <Content>
        <Message>Select a project to start chatting with Claude</Message>
      </Content>
    </Container>
  );
};

export default NoProjectSelected;