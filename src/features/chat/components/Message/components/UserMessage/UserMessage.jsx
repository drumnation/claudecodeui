import React, { memo } from 'react';
import * as S from '@/features/chat/components/Message/components/UserMessage/UserMessage.styles';
import { formatTimestamp } from '@/features/chat/components/Message/Message.logic';

const UserMessage = memo(({ message, isGrouped }) => {
  return (
    <S.UserMessageContainer>
      <S.UserMessageBubble>
        <S.UserMessageText>{message.content}</S.UserMessageText>
        <S.UserMessageTime>{formatTimestamp(message.timestamp)}</S.UserMessageTime>
      </S.UserMessageBubble>
      {!isGrouped && (
        <S.UserAvatar src="/icons/user.jpg" alt="User" />
      )}
    </S.UserMessageContainer>
  );
});

UserMessage.displayName = 'UserMessage';

export default UserMessage;