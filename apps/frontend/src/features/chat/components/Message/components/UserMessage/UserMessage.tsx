import React, {memo, useMemo} from 'react';
import * as S from '@/features/chat/components/Message/components/UserMessage/UserMessage.styles';
import {formatTimestamp} from '@/features/chat/components/Message/Message.logic';
import {CopyToClipboardButton} from '@/shared-components/CopyToClipboardButton';
import {getTextToCopy} from '@/shared-components/CopyToClipboardButton/CopyToClipboardButton.logic';
import {UserMessageProps} from '@/features/chat/components/Message/components/UserMessage/UserMessage.types';
import {useRenderCount} from '@/utils/performance';

const UserMessage = memo<UserMessageProps>(({message, isGrouped}) => {
  useRenderCount('UserMessage');

  const formattedTimestamp = useMemo(
    () => formatTimestamp(message.timestamp),
    [message.timestamp],
  );
  const textToCopy = useMemo(() => getTextToCopy(message), [message]);
  const timeText = useMemo(
    () => `${formattedTimestamp}${message.isQueued ? ' • Queued' : ''}`,
    [formattedTimestamp, message.isQueued],
  );

  return (
    <S.UserMessageContainer className="group">
      <S.MessageContent>
        <S.UserMessageBubble isQueued={message.isQueued}>
          <S.UserMessageText>{message.content}</S.UserMessageText>
          <S.UserMessageTime>{timeText}</S.UserMessageTime>
        </S.UserMessageBubble>
        <S.MessageActions>
          <CopyToClipboardButton
            message={message}
            textToCopy={textToCopy}
            size="xs"
            ariaLabel="Copy message to clipboard"
          />
        </S.MessageActions>
      </S.MessageContent>
      {!isGrouped && <S.UserAvatar src="/icons/user.jpg" alt="User" />}
    </S.UserMessageContainer>
  );
});

UserMessage.displayName = 'UserMessage';

export default UserMessage;
