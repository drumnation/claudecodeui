// AssistantMessage formatting and parsing logic

export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};

export const extractFileEditInfo = (content) => {
  const match = content.match(/The file (.+?) has been updated\./);
  return match ? match[1] : null;
};

export const extractFileCreateInfo = (content) => {
  const match = content.match(/(?:The file|File) (.+?) has been (?:created|written)(?: successfully)?\.?/);
  return match ? match[1] : null;
};

export const parseInteractivePrompt = (content) => {
  const lines = content.split('\n');
  const promptIndex = lines.findIndex(line => line.includes('Do you want to proceed?'));
  const beforePrompt = lines.slice(0, promptIndex).join('\n');
  const promptLines = lines.slice(promptIndex);
  
  const questionLine = promptLines.find(line => line.includes('Do you want to proceed?')) || '';
  const options = [];
  
  // Parse numbered options (1. Yes, 2. No, etc.)
  promptLines.forEach(line => {
    const optionMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (optionMatch) {
      options.push({
        number: optionMatch[1],
        text: optionMatch[2].trim()
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
    selectedOption
  };
};

export const parseInteractiveMenuOptions = (content) => {
  const lines = content.split('\n').filter(line => line.trim());
  const questionLine = lines.find(line => line.includes('?')) || lines[0] || '';
  const options = [];
  
  // Parse the menu options
  lines.forEach(line => {
    // Match lines like "❯ 1. Yes" or "  2. No"
    const optionMatch = line.match(/[❯\s]*(\d+)\.\s+(.+)/);
    if (optionMatch) {
      const isSelected = line.includes('❯');
      options.push({
        number: optionMatch[1],
        text: optionMatch[2].trim(),
        isSelected
      });
    }
  });
  
  return { questionLine, options };
};

export const isTodoResult = (toolName, content) => {
  return (toolName === 'TodoWrite' || toolName === 'TodoRead') &&
         (content.includes('Todos have been modified successfully') || 
          content.includes('Todo list') || 
          (content.startsWith('[') && content.includes('"content"') && content.includes('"status"')));
};

export const parseTodoResult = (content) => {
  try {
    if (content.startsWith('[')) {
      return JSON.parse(content);
    }
    return null;
  } catch (e) {
    return null;
  }
};