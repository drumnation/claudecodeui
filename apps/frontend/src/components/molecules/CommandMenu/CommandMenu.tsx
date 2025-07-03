import React, { memo } from "react";
import { useLogger } from "@kit/logger/react";

export interface Command {
  name: string;
  description?: string;
  command?: string;
  [key: string]: any;
}

export interface CommandMenuProps {
  commands: Command[];
  selectedIndex: number;
  onSelectCommand: (command: Command) => void;
  position: { x: number; y: number };
}

const CommandMenu = memo(
  ({
    commands,
    selectedIndex,
    onSelectCommand,
    position,
  }: CommandMenuProps) => {
    const logger = useLogger({ scope: 'CommandMenu' });

    React.useEffect(() => {
      logger.debug('CommandMenu rendered', {
        commandCount: commands.length,
        selectedIndex,
        position,
        hasPosition: !!position,
        firstCommand: commands[0]?.command || commands[0]?.name
      });
    }, [commands, selectedIndex, position, logger]);

    const handleCommandSelect = (command: Command, index: number) => {
      logger.info('Command selected from menu', {
        command: command.command || command.name,
        description: command.description,
        index,
        totalCommands: commands.length,
        selectionMethod: 'click'
      });
      onSelectCommand(command);
    };

    if (!commands || commands.length === 0) {
      logger.debug('CommandMenu not rendered - no commands available');
      return null;
    }

    return (
      <div
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 sm:max-h-64 overflow-y-auto"
        style={{
          minWidth: "280px",
          maxWidth: "100%",
        }}
        data-testid="command-dropdown"
      >
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Available Commands ({commands.length})
          </p>
        </div>
        <div className="py-1">
          {commands.map((cmd, index) => (
            <div
              key={cmd.command || cmd.name || index}
              className={`px-3 py-2 cursor-pointer flex items-start gap-3 transition-colors duration-150 ${
                index === selectedIndex
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => handleCommandSelect(cmd, index)}
              onMouseEnter={() => {
                logger.debug('Command hovered', {
                  command: cmd.command || cmd.name,
                  index
                });
              }}
              data-testid={`command-item-${index}`}
            >
              <span className="font-mono font-medium text-sm min-w-[100px]">
                {cmd.command || cmd.name}
              </span>
              {cmd.description && (
                <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                  {cmd.description}
                </span>
              )}
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
  },
);

CommandMenu.displayName = "CommandMenu";

export default CommandMenu;