import React, { memo } from 'react';
import { useMessage } from '@/features/chat/components/Message/Message.hook';
import * as logic from '@/features/chat/components/Message/Message.logic';
import * as S from '@/features/chat/components/Message/Message.styles';

// Import refactored components
import UserMessage from '@/features/chat/components/Message/components/UserMessage';
import AssistantMessage from '@/features/chat/components/Message/components/AssistantMessage';

// Import refactored tool components
// Tool components are now imported in AssistantMessage component

const Message = memo(({
  message,
  index,
  prevMessage,
  createDiff,
  onFileOpen,
  onShowSettings,
  autoExpandTools,
  showRawParameters
}) => {
  const isGrouped = logic.isMessageGrouped(prevMessage, message);
  const { messageRef, isExpanded, setIsExpanded } = useMessage({ 
    autoExpandTools, 
    message 
  });

  const renderUserMessage = () => (
    <UserMessage message={message} isGrouped={isGrouped} />
  );

  const renderAssistantMessage = () => (
    <AssistantMessage
      message={message}
      isGrouped={isGrouped}
      onFileOpen={onFileOpen}
      onShowSettings={onShowSettings}
      autoExpandTools={autoExpandTools}
      showRawParameters={showRawParameters}
      createDiff={createDiff}
    />
  );


  return (
    <S.MessageWrapper
      ref={messageRef}
      type={message.type}
      isGrouped={isGrouped}
      isUser={message.type === 'user'}
      className={`chat-message ${message.type} ${isGrouped ? 'grouped' : ''}`}
    >
      {message.type === 'user' ? renderUserMessage() : renderAssistantMessage()}
    </S.MessageWrapper>
  );
});

Message.displayName = 'Message';

export default Message;