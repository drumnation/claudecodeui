import type {ChildProcess} from 'child_process';

// State management - using closures to maintain state without classes
const createSessionManager = () => {
  const activeClaudeProcesses = new Map<string, ChildProcess>();
  const sessionMessageCounts = new Map<string, number>();
  const manuallyEditedSessions = new Set<string>();

  return {
    setProcess: (sessionId: string, process: ChildProcess) => {
      activeClaudeProcesses.set(sessionId, process);
    },

    getProcess: (sessionId: string): ChildProcess | undefined => {
      return activeClaudeProcesses.get(sessionId);
    },

    deleteProcess: (sessionId: string) => {
      activeClaudeProcesses.delete(sessionId);
    },

    incrementMessageCount: (sessionId: string): number => {
      const currentCount = sessionMessageCounts.get(sessionId) ?? 0;
      const newCount = currentCount + 1;
      sessionMessageCounts.set(sessionId, newCount);
      return newCount;
    },

    getMessageCount: (sessionId: string): number => {
      return sessionMessageCounts.get(sessionId) ?? 0;
    },

    deleteMessageCount: (sessionId: string) => {
      sessionMessageCounts.delete(sessionId);
    },

    markAsManuallyEdited: (sessionId: string) => {
      if (sessionId) {
        manuallyEditedSessions.add(sessionId);
      }
    },

    clearManualEditFlag: (sessionId: string) => {
      if (sessionId) {
        manuallyEditedSessions.delete(sessionId);
      }
    },

    isManuallyEdited: (sessionId: string): boolean => {
      return manuallyEditedSessions.has(sessionId);
    },

    deleteManualEditFlag: (sessionId: string) => {
      manuallyEditedSessions.delete(sessionId);
    },
  };
};

// Create singleton instance
export const sessionManager = createSessionManager();

// Utility functions
export const parseStatusMessage = (
  text: string,
): {action: string; tokens: number} => {
  const tokensMatch = /⚒\s*(\d+)\s*tokens/.exec(text);
  const tokens = tokensMatch?.[1] ? parseInt(tokensMatch[1]) : 0;

  const actionMatch = /[✻✹✸✶]\s*(\w+)/.exec(text);
  const action = actionMatch?.[1] ?? 'Working';

  return {action, tokens};
};

export const isStatusMessage = (text: string): boolean => {
  return (
    text.includes('✻') ||
    text.includes('✹') ||
    text.includes('✸') ||
    text.includes('✶') ||
    text.includes('⚒') ||
    text.includes('tokens') ||
    text.includes('esc to interrupt')
  );
};

export const isInteractivePrompt = (text: string): boolean => {
  return (
    text.includes('Do you want to') ||
    text.includes('?') ||
    text.includes('>') ||
    text.includes('❯') ||
    /\d+\.\s+\w+/.test(text) // Matches "1. Yes" pattern
  );
};

export const buildClaudeArgs = (
  command: string | undefined,
  options: {
    resume?: boolean;
    sessionId?: string;
    toolsSettings?: {
      allowedTools: string[];
      disallowedTools: string[];
      skipPermissions: boolean;
    };
  },
): string[] => {
  const args: string[] = [];
  const {sessionId, resume, toolsSettings} = options;

  // Add print flag with command if we have a command
  if (command?.trim()) {
    args.push('--print', command);
  }

  // Add resume flag if resuming
  if (resume && sessionId) {
    args.push('--resume', sessionId);
  }

  // Add basic flags
  args.push('--output-format', 'stream-json', '--verbose');

  // Add model for new sessions
  if (!resume) {
    args.push('--model', 'sonnet');
  }

  // Add tools settings flags
  if (toolsSettings?.skipPermissions) {
    args.push('--dangerously-skip-permissions');
  } else {
    // Only add allowed/disallowed tools if not skipping permissions
    if (toolsSettings?.allowedTools && toolsSettings.allowedTools.length > 0) {
      for (const tool of toolsSettings.allowedTools) {
        args.push('--allowedTools', tool);
      }
    }

    if (
      toolsSettings?.disallowedTools &&
      toolsSettings.disallowedTools.length > 0
    ) {
      for (const tool of toolsSettings.disallowedTools) {
        args.push('--disallowedTools', tool);
      }
    }
  }

  return args;
};

export const formatCommandForLogging = (
  command: string,
  args: string[],
): string => {
  return `${command} ${args
    .map((arg) => {
      const cleanArg = arg.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      return cleanArg.includes(' ') ? `"${cleanArg}"` : cleanArg;
    })
    .join(' ')}`;
};
