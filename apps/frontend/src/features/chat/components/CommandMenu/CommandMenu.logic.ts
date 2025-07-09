/**
 * Filters commands based on search query
 * @param {Array} commands - Array of command objects
 * @param {string} query - Search query
 * @returns {Array} Filtered commands
 */
export const filterCommands = (commands: any, query: any) => {
  if (!query || !commands) return commands;

  const normalizedQuery = query.toLowerCase();
  return commands.filter(
    (cmd: any) =>
      cmd.command.toLowerCase().includes(normalizedQuery) ||
      cmd.description.toLowerCase().includes(normalizedQuery),
  );
};

/**
 * Gets the display name for a command
 * @param {string} command - Command string
 * @returns {string} Formatted command display name
 */
export const formatCommandName = (command: any) => {
  if (!command) return '';
  return command.startsWith('/') ? command : `/${command}`;
};

/**
 * Validates command menu props
 * @param {Object} props - Component props
 * @returns {boolean} Whether props are valid
 */
export const validateProps = (props: any) => {
  const {commands} = props;
  return (
    Array.isArray(commands) &&
    commands.every(
      (cmd) =>
        cmd.command &&
        typeof cmd.command === 'string' &&
        cmd.description &&
        typeof cmd.description === 'string',
    )
  );
};
