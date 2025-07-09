export interface Command {
  command: string;
  description: string;
}

export interface CommandMenuProps {
  commands: Command[];
  selectedIndex: number;
  onSelectCommand: (command: Command) => void;
  position?: {x: number; y: number};
}

export interface CommandMenuHookProps {
  commands: Command[];
  selectedIndex: number;
  onSelectCommand: (command: Command) => void;
}

export interface CommandMenuHookReturn {
  handleCommandClick: (command: Command) => void;
}
