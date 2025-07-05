import React from 'react';

const MessageStates = ({ isLoadingSessionMessages, chatMessages }) => {
  if (isLoadingSessionMessages && chatMessages.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          <p>Loading session messages...</p>
        </div>
      </div>
    );
  }

  if (chatMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400 px-6 sm:px-4">
          <p className="font-bold text-lg sm:text-xl mb-3">Start a conversation with Claude</p>
          <p className="text-sm sm:text-base leading-relaxed">
            Ask questions about your code, request changes, or get help with development tasks
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default MessageStates;