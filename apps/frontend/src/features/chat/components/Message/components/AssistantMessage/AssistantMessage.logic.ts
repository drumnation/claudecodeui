// AssistantMessage formatting and parsing logic

export const formatTimestamp = (timestamp: any) => {
  return new Date(timestamp).toLocaleTimeString();
};

export const extractFileEditInfo = (content: any) => {
  const match = content.match(/The file (.+?) has been updated\./);
  return match ? match[1] : null;
};

export const extractFileCreateInfo = (content: any) => {
  const match = content.match(
    /(?:The file|File) (.+?) has been (?:created|written)(?: successfully)?\.?/,
  );
  return match ? match[1] : null;
};

export const parseInteractivePrompt = (content: any) => {
  const lines = content.split('\n');
  const promptIndex = lines.findIndex((line: any) =>
    line.includes('Do you want to proceed?'),
  );
  const beforePrompt = lines.slice(0, promptIndex).join('\n');
  const promptLines = lines.slice(promptIndex);

  const questionLine =
    promptLines.find((line: any) => line.includes('Do you want to proceed?')) ||
    '';
  const options: any = [];

  // Parse numbered options (1. Yes, 2. No, etc.)
  promptLines.forEach((line: any) => {
    const optionMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (optionMatch) {
      options.push({
        number: optionMatch[1],
        text: optionMatch[2].trim(),
      });
    }
  });

  // Find which option was selected (usually indicated by "> 1" or similar)
  const selectedMatch = content.match(/>\s*(\d+)/);
  const selectedOption = selectedMatch ? selectedMatch[1] : null;

  return {
    beforePrompt,
    questionLine,
    options,
    selectedOption,
  };
};

export const parseInteractiveMenuOptions = (content: any) => {
  const lines = content.split('\n').filter((line: any) => line.trim());
  const questionLine =
    lines.find((line: any) => line.includes('?')) || lines[0] || '';
  const options: any = [];

  // Parse the menu options
  lines.forEach((line: any) => {
    // Match lines like "❯ 1. Yes" or "  2. No"
    const optionMatch = line.match(/[❯\s]*(\d+)\.\s+(.+)/);
    if (optionMatch) {
      const isSelected = line.includes('❯');
      options.push({
        number: optionMatch[1],
        text: optionMatch[2].trim(),
        isSelected,
      });
    }
  });

  return {questionLine, options};
};

export const isTodoResult = (toolName: any, content: any) => {
  return (
    (toolName === 'TodoWrite' || toolName === 'TodoRead') &&
    (content.includes('Todos have been modified successfully') ||
      content.includes('Todo list') ||
      (content.startsWith('[') &&
        content.includes('"content"') &&
        content.includes('"status"')))
  );
};

export const parseTodoResult = (content: any) => {
  try {
    if (content.startsWith('[')) {
      return JSON.parse(content);
    }
    return null;
  } catch (e) {
    return null;
  }
};
