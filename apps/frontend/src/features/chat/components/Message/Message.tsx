import React, {memo, useMemo} from 'react';
import {useMessage} from '@/features/chat/components/Message/Message.hook';
import * as logic from '@/features/chat/components/Message/Message.logic';
import * as S from '@/features/chat/components/Message/Message.styles';
import type {MessageProps} from './Message.types';
import {useRenderCount} from '@/utils/performance';

// Import refactored components
import UserMessage from '@/features/chat/components/Message/components/UserMessage';
import AssistantMessage from '@/features/chat/components/Message/components/AssistantMessage';

// Import refactored tool components
// Tool components are now imported in AssistantMessage component

const Message = memo<MessageProps>(
  ({
    message,
    index,
    prevMessage,
    createDiff,
    onFileOpen,
    onShowSettings,
    autoExpandTools,
    showRawParameters,
  }) => {
    useRenderCount('Message');

    const isGrouped = useMemo(
      () => logic.isMessageGrouped(prevMessage, message),
      [prevMessage, message],
    );
    const {messageRef, isExpanded, setIsExpanded} = useMessage({
      autoExpandTools,
      message,
    });

    const messageClassName = useMemo(
      () => `chat-message ${message.type} ${isGrouped ? 'grouped' : ''}`,
      [message.type, isGrouped],
    );

    const renderUserMessage = useMemo(
      () => <UserMessage message={message} isGrouped={isGrouped} />,
      [message, isGrouped],
    );

    const renderAssistantMessage = useMemo(
      () => (
        <AssistantMessage
          message={message}
          isGrouped={isGrouped}
          onFileOpen={onFileOpen}
          onShowSettings={onShowSettings}
          autoExpandTools={autoExpandTools}
          showRawParameters={showRawParameters}
          createDiff={createDiff}
        />
      ),
      [
        message,
        isGrouped,
        onFileOpen,
        onShowSettings,
        autoExpandTools,
        showRawParameters,
        createDiff,
      ],
    );

    return (
      <S.MessageWrapper
        ref={messageRef}
        type={message.type}
        isGrouped={isGrouped}
        isUser={message.type === 'user'}
        className={messageClassName}
      >
        {message.type === 'user' ? renderUserMessage : renderAssistantMessage}
      </S.MessageWrapper>
    );
  },
);

Message.displayName = 'Message';

export default Message;
