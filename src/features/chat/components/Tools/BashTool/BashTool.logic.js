export const parseToolInput = (toolInput) => {
  try {
    return typeof toolInput === 'string' ? JSON.parse(toolInput) : toolInput;
  } catch (e) {
    return null;
  }
};