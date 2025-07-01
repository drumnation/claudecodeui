import React, { memo } from 'react';

const CommandMenu = memo(({ commands, selectedIndex, onSelectCommand, position }) => {
  if (!commands || commands.length === 0) return null;

  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 sm:max-h-64 overflow-y-auto"
      style={{
        minWidth: '280px',
        maxWidth: '100%'
      }}
    >
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Available Commands
        </p>
      </div>
      <div className="py-1">
        {commands.map((cmd, index) => (
          <div
            key={cmd.command}
            className={`px-3 py-2 cursor-pointer flex items-start gap-3 ${
              index === selectedIndex
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => onSelectCommand(cmd)}
          >
            <span className="font-mono font-medium text-sm min-w-[100px]">
              {cmd.command}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
              {cmd.description}
            </span>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Type to filter • ↑↓ to navigate • Enter to select • Esc to close
        </p>
      </div>
    </div>
  );
});

CommandMenu.displayName = 'CommandMenu';

export default CommandMenu;