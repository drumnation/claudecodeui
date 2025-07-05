import React, { memo } from 'react';
import { useCommandMenu } from '@/features/chat/components/CommandMenu/CommandMenu.hook';
import {
  CommandMenuContainer,
  CommandMenuHeader,
  CommandMenuTitle,
  CommandMenuList,
  CommandMenuItem,
  CommandName,
  CommandDescription,
  CommandMenuFooter,
  CommandMenuHelp
} from '@/features/chat/components/CommandMenu/CommandMenu.styles';

export const CommandMenu = memo(({ commands, selectedIndex, onSelectCommand, position }) => {
  const { handleCommandClick } = useCommandMenu({ commands, selectedIndex, onSelectCommand });

  if (!commands || commands.length === 0) return null;

  return (
    <CommandMenuContainer>
      <CommandMenuHeader>
        <CommandMenuTitle>
          Available Commands
        </CommandMenuTitle>
      </CommandMenuHeader>
      <CommandMenuList>
        {commands.map((cmd, index) => (
          <CommandMenuItem
            key={cmd.command}
            isSelected={index === selectedIndex}
            onClick={() => handleCommandClick(cmd)}
          >
            <CommandName>
              {cmd.command}
            </CommandName>
            <CommandDescription>
              {cmd.description}
            </CommandDescription>
          </CommandMenuItem>
        ))}
      </CommandMenuList>
      <CommandMenuFooter>
        <CommandMenuHelp>
          Type to filter • ↑↓ to navigate • Enter to select • Esc to close
        </CommandMenuHelp>
      </CommandMenuFooter>
    </CommandMenuContainer>
  );
});

CommandMenu.displayName = 'CommandMenu';

