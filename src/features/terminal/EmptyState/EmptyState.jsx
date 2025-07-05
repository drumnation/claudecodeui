import React from 'react';
import {
  Container,
  Content,
  IconWrapper,
  Icon,
  Title,
  Description
} from '@/features/terminal/EmptyState/EmptyState.styles';

export const EmptyState = () => {
  return (
    <Container>
      <Content>
        <IconWrapper>
          <Icon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </Icon>
        </IconWrapper>
        <Title>Select a Project</Title>
        <Description>Choose a project to open an interactive shell in that directory</Description>
      </Content>
    </Container>
  );
};