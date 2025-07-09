export const parseToolInput = (toolInput: any) => {
  try {
    return typeof toolInput === 'string' ? JSON.parse(toolInput) : toolInput;
  } catch (e) {
    return null;
  }
};
