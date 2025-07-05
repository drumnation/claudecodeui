import { useCallback, useEffect } from 'react';

export const useCommandMenu = ({ commands, selectedIndex, onSelectCommand }) => {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!commands || commands.length === 0) return;

      switch (event.key) {
        case 'Escape':
          // Parent component should handle closing
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commands]);

  // Handle command selection with memoization
  const handleCommandClick = useCallback((command) => {
    if (onSelectCommand) {
      onSelectCommand(command);
    }
  }, [onSelectCommand]);

  return {
    handleCommandClick
  };
};