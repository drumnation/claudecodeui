import React, { memo } from 'react';
import Message from '../Message';
import MessageStates from '../MessageStates';
import ScrollToBottomButton from '../ScrollToBottomButton';


const MessagesArea = ({
  chatMessages,
  isLoadingSessionMessages,
  visibleMessages,
  isUserScrolledUp,
  scrollToBottom,
  onFileOpen,
  onShowSettings,
  autoExpandTools,
  showRawParameters,
  createDiff,
  scrollContainerRef,
  messagesEndRef
}) => {
  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden px-0 py-3 sm:p-4 space-y-3 sm:space-y-4 relative"
    >
      {isLoadingSessionMessages && chatMessages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            <p>Loading session messages...</p>
          </div>
        </div>
      ) : chatMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500 dark:text-gray-400 px-6 sm:px-4">
            <p className="font-bold text-lg sm:text-xl mb-3">Start a conversation with Claude</p>
            <p className="text-sm sm:text-base leading-relaxed">
              Ask questions about your code, request changes, or get help with development tasks
            </p>
          </div>
        </div>
      ) : (
        <>
          {chatMessages.length > 100 && (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2 border-b border-gray-200 dark:border-gray-700">
              Showing last 100 messages ({chatMessages.length} total) • 
              <button className="ml-1 text-blue-600 hover:text-blue-700 underline">
                Load earlier messages
              </button>
            </div>
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
      )}
      
      <div ref={messagesEndRef} />
      
      {/* Floating scroll to bottom button */}
      {isUserScrolledUp && chatMessages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800 z-10"
          title="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessagesArea;