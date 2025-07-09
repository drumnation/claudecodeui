import React, {memo, useMemo, useCallback} from 'react';
import Message from '@/features/chat/components/Message';
import {useMessagesArea} from '@/features/chat/components/MessagesArea/MessagesArea.hook';
import {
  getEmptyStateConfig,
  shouldShowScrollButton,
  shouldShowLoadMoreBanner,
} from '@/features/chat/components/MessagesArea/MessagesArea.logic';
import type {MessagesAreaProps} from './MessagesArea.types';
import {useVirtualList} from '@/utils/performance';
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
  MessagesEndAnchor,
} from '@/features/chat/components/MessagesArea/MessagesArea.styles';

const MessagesArea: React.FC<MessagesAreaProps> = ({
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
  messagesEndRef,
  isStreaming = false,
}) => {
  const {handleSmoothScroll} = useMessagesArea({
    scrollContainerRef,
    messagesEndRef,
    chatMessages,
    onScroll: null, // Parent component handles scroll events
  });

  const handleScrollToBottomClick = () => {
    if (scrollToBottom) {
      scrollToBottom();
    } else {
      handleSmoothScroll();
    }
  };

  const renderEmptyState = () => {
    if (messagesConfig.emptyStateConfig.showSpinner) {
      return (
        <LoadingContainer>
          <LoadingContent>
            <LoadingSpinner />
            <LoadingText>{messagesConfig.emptyStateConfig.message}</LoadingText>
          </LoadingContent>
        </LoadingContainer>
      );
    }

    return (
      <EmptyStateContainer>
        <EmptyStateContent>
          <EmptyStateTitle>
            {messagesConfig.emptyStateConfig.title}
          </EmptyStateTitle>
          <EmptyStateMessage>
            {messagesConfig.emptyStateConfig.message}
          </EmptyStateMessage>
        </EmptyStateContent>
      </EmptyStateContainer>
    );
  };

  // Memoize expensive calculations
  const messagesConfig = useMemo(
    () => ({
      emptyStateConfig: getEmptyStateConfig(
        isLoadingSessionMessages && chatMessages.length === 0,
      ),
      showScrollButton: shouldShowScrollButton(
        isUserScrolledUp,
        chatMessages.length,
      ),
      showLoadMore: shouldShowLoadMoreBanner(
        chatMessages.length,
        visibleMessages.length,
      ),
    }),
    [
      isLoadingSessionMessages,
      chatMessages.length,
      isUserScrolledUp,
      visibleMessages.length,
    ],
  );

  // Memoize the createDiff callback
  const memoizedCreateDiff = useCallback(createDiff, [createDiff]);

  // Virtual list for large message lists (threshold of 50 messages)
  const useVirtualization = visibleMessages.length > 50;
  const virtualList = useVirtualList(
    visibleMessages,
    100, // Estimated message height
    600, // Container height
    5, // Overscan
  );

  const renderMessage = useCallback(
    (message: any, index: number) => {
      const prevMessage = index > 0 ? visibleMessages[index - 1] : null;

      return (
        <Message
          key={`${message.id || index}-${message.timestamp || ''}`}
          message={message}
          index={index}
          prevMessage={prevMessage}
          createDiff={memoizedCreateDiff}
          onFileOpen={onFileOpen}
          onShowSettings={onShowSettings}
          autoExpandTools={autoExpandTools}
          showRawParameters={showRawParameters}
        />
      );
    },
    [
      visibleMessages,
      memoizedCreateDiff,
      onFileOpen,
      onShowSettings,
      autoExpandTools,
      showRawParameters,
    ],
  );

  const renderMessages = () => (
    <>
      {messagesConfig.showLoadMore && (
        <LoadMoreBanner>
          Showing last 100 messages ({chatMessages.length} total) •
          <LoadMoreButton>Load earlier messages</LoadMoreButton>
        </LoadMoreBanner>
      )}

      {useVirtualization ? (
        <div
          style={{height: virtualList.totalHeight, position: 'relative'}}
          onScroll={virtualList.onScroll}
        >
          <div
            style={{
              transform: `translateY(${virtualList.offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {virtualList.visibleItems.map((message, index) =>
              renderMessage(message, index),
            )}
          </div>
        </div>
      ) : (
        visibleMessages.map((message, index) => renderMessage(message, index))
      )}
    </>
  );

  return (
    <MessagesContainer ref={scrollContainerRef}>
      {chatMessages.length === 0 && !isLoadingSessionMessages && !isStreaming
        ? renderEmptyState()
        : renderMessages()}

      <MessagesEndAnchor ref={messagesEndRef} />

      {messagesConfig.showScrollButton && (
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

export default memo(MessagesArea);
