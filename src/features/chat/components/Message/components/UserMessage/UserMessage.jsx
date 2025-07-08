import React, { memo } from 'react';
import * as S from '@/features/chat/components/Message/components/UserMessage/UserMessage.styles';
import { formatTimestamp } from '@/features/chat/components/Message/Message.logic';
import { CopyToClipboardButton } from '@/shared-components/CopyToClipboardButton';
import { getTextToCopy } from '@/shared-components/CopyToClipboardButton/CopyToClipboardButton.logic';

const UserMessage = memo(({ message, isGrouped }) => {
  return (
    <S.UserMessageContainer className="group">
      <S.MessageContent>
        <S.UserMessageBubble isQueued={message.isQueued}>
          <S.UserMessageText>{message.content}</S.UserMessageText>
          <S.UserMessageTime>
            {formatTimestamp(message.timestamp)}
            {message.isQueued && ' • Queued'}
          </S.UserMessageTime>
        </S.UserMessageBubble>
        <S.MessageActions>
          <CopyToClipboardButton
            message={message}
            textToCopy={getTextToCopy(message)}
            size="xs"
            ariaLabel="Copy message to clipboard"
          />
        </S.MessageActions>
      </S.MessageContent>
      {!isGrouped && (
        <S.UserAvatar src="/icons/user.jpg" alt="User" />
      )}
    </S.UserMessageContainer>
  );
});

UserMessage.displayName = 'UserMessage';

export default UserMessage;