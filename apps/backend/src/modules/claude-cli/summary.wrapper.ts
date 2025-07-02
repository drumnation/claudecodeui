import {handleGenerateSummary as generateSummaryHandler} from './summary.handler.js';

// Wrapper to provide the expected interface for the routes
export const generateSummaryForApi = async (
  messages: any[],
): Promise<{summary: string}> => {
  return generateSummaryHandler(messages);
};
