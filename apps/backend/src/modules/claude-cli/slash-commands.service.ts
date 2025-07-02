import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

interface SlashCommand {
  name: string;
  description: string;
}

export const getSlashCommands = async (): Promise<SlashCommand[]> => {
  try {
    // Run claude --help to get available commands
    const {stdout} = await execAsync('claude --help');

    // Parse the output to extract slash commands
    const lines = stdout.split('\n');
    const commands: SlashCommand[] = [];

    let inCommandsSection = false;

    for (const line of lines) {
      // Look for the commands section
      if (line.includes('Commands:')) {
        inCommandsSection = true;
        continue;
      }

      // Stop parsing if we hit another section
      if (inCommandsSection && line.match(/^[A-Z]/)) {
        break;
      }

      // Parse command lines (they typically start with /)
      if (inCommandsSection && line.trim().startsWith('/')) {
        const match = line.match(/^\s*(\/\w+)\s+(.+)$/);
        if (match && match[1] && match[2]) {
          commands.push({
            name: match[1],
            description: match[2].trim(),
          });
        }
      }
    }

    // If no commands found from help, provide defaults
    if (commands.length === 0) {
      return [
        {name: '/help', description: 'Show available commands'},
        {name: '/exit', description: 'Exit the current session'},
        {name: '/clear', description: 'Clear the conversation'},
        {name: '/settings', description: 'Show or modify settings'},
        {name: '/search', description: 'Search through files'},
        {name: '/undo', description: 'Undo the last change'},
      ];
    }

    return commands;
  } catch (error) {
    console.error('Error getting slash commands:', error);
    // Return default commands if claude CLI is not available
    return [
      {name: '/help', description: 'Show available commands'},
      {name: '/exit', description: 'Exit the current session'},
      {name: '/clear', description: 'Clear the conversation'},
      {name: '/settings', description: 'Show or modify settings'},
    ];
  }
};
