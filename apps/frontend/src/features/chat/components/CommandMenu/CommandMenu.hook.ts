import {useCallback, useEffect} from 'react';

export const useCommandMenu = ({
  commands,
  selectedIndex,
  onSelectCommand,
}: any) => {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: any) => {
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
  const handleCommandClick = useCallback(
    (command: any) => {
      if (onSelectCommand) {
        onSelectCommand(command);
      }
    },
    [onSelectCommand],
  );

  return {
    handleCommandClick,
  };
};
