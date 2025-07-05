
const ScrollToBottomButton = ({ isUserScrolledUp, chatMessages, scrollToBottom }) => {
  if (!isUserScrolledUp || chatMessages.length === 0) {
    return null;
  }

  return (
    <button
      onClick={scrollToBottom}
      className="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800 z-10"
      title="Scroll to bottom"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </button>
  );
};

export default ScrollToBottomButton;