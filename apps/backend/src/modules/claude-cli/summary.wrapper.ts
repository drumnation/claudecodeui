import {handleGenerateSummary as generateSummaryHandler} from './summary.handler.js';
import {createLogger} from '@kit/logger/node';

// Wrapper to provide the expected interface for the routes
export const generateSummaryForApi = async (
  messages: any[],
): Promise<{summary: string}> => {
  const logger = createLogger({scope: 'summary-wrapper'});
  return generateSummaryHandler(messages, logger);
};
