import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Message from '@/features/chat/components/Message';
import { useMessagesArea } from '@/features/chat/components/MessagesArea/MessagesArea.hook';
import { 
  getEmptyStateConfig, 
  shouldShowScrollButton, 
  shouldShowLoadMoreBanner 
} from '@/features/chat/components/MessagesArea/MessagesArea.logic';
import {
  MessagesContainer,
  EmptyStateContainer,
  EmptyStateContent,
  EmptyStateTitle,
  EmptyStateMessage,
  LoadingContainer,
  LoadingContent,
  LoadingSpinner,
  LoadingText,
  LoadMoreBanner,
  LoadMoreButton,
  ScrollToBottomButton,
  ScrollToBottomIcon,
  MessagesEndAnchor
} from '@/features/chat/components/MessagesArea/MessagesArea.styles';

const MessagesArea = ({
  chatMessages,
  isLoadingSessionMessages,
  visibleMessages,
  isUserScrolledUp,
  scrollToBottom,
  onFileOpen = () => {},
  onShowSettings = () => {},
  autoExpandTools = false,
  showRawParameters = false,
  createDiff = () => {},
  scrollContainerRef,
  messagesEndRef
}) => {
  const { handleSmoothScroll } = useMessagesArea({
    scrollContainerRef,
    messagesEndRef,
    chatMessages,
    onScroll: null // Parent component handles scroll events
  });
  
  const emptyStateConfig = getEmptyStateConfig(isLoadingSessionMessages && chatMessages.length === 0);
  const showScrollButton = shouldShowScrollButton(isUserScrolledUp, chatMessages.length);
  const showLoadMore = shouldShowLoadMoreBanner(chatMessages.length, visibleMessages.length);
  
  const handleScrollToBottomClick = () => {
    if (scrollToBottom) {
      scrollToBottom();
    } else {
      handleSmoothScroll();
    }
  };
  
  const renderEmptyState = () => {
    if (emptyStateConfig.showSpinner) {
      return (
        <LoadingContainer>
          <LoadingContent>
            <LoadingSpinner />
            <LoadingText>{emptyStateConfig.message}</LoadingText>
          </LoadingContent>
        </LoadingContainer>
      );
    }
    
    return (
      <EmptyStateContainer>
        <EmptyStateContent>
          <EmptyStateTitle>{emptyStateConfig.title}</EmptyStateTitle>
          <EmptyStateMessage>{emptyStateConfig.message}</EmptyStateMessage>
        </EmptyStateContent>
      </EmptyStateContainer>
    );
  };
  
  const renderMessages = () => (
    <>
      {showLoadMore && (
        <LoadMoreBanner>
          Showing last 100 messages ({chatMessages.length} total) • 
          <LoadMoreButton>
            Load earlier messages
          </LoadMoreButton>
        </LoadMoreBanner>
      )}
      
      {visibleMessages.map((message, index) => {
        const prevMessage = index > 0 ? visibleMessages[index - 1] : null;
        
        return (
          <Message
            key={index}
            message={message}
            index={index}
            prevMessage={prevMessage}
            createDiff={createDiff}
            onFileOpen={onFileOpen}
            onShowSettings={onShowSettings}
            autoExpandTools={autoExpandTools}
            showRawParameters={showRawParameters}
          />
        );
      })}
    </>
  );
  
  return (
    <MessagesContainer ref={scrollContainerRef}>
      {chatMessages.length === 0 ? renderEmptyState() : renderMessages()}
      
      <MessagesEndAnchor ref={messagesEndRef} />
      
      {showScrollButton && (
        <ScrollToBottomButton
          onClick={handleScrollToBottomClick}
          title="Scroll to bottom"
        >
          <ScrollToBottomIcon 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </ScrollToBottomIcon>
        </ScrollToBottomButton>
      )}
    </MessagesContainer>
  );
};

MessagesArea.propTypes = {
  chatMessages: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoadingSessionMessages: PropTypes.bool.isRequired,
  visibleMessages: PropTypes.arrayOf(PropTypes.object).isRequired,
  isUserScrolledUp: PropTypes.bool.isRequired,
  scrollToBottom: PropTypes.func.isRequired,
  onFileOpen: PropTypes.func,
  onShowSettings: PropTypes.func,
  autoExpandTools: PropTypes.bool,
  showRawParameters: PropTypes.bool,
  createDiff: PropTypes.func,
  scrollContainerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]).isRequired,
  messagesEndRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]).isRequired
};

export default memo(MessagesArea);